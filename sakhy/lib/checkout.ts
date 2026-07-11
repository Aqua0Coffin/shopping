import crypto from "crypto";
import Razorpay from "razorpay";
import {
  InventoryChangeReason,
  OrderStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const RESERVATION_TIMEOUT_MS = 15 * 60 * 1000;

export interface CheckoutCartItem {
  variantId: string;
  quantity: number;
}

export interface CheckoutCustomerInput {
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface CreateCheckoutInput {
  customer: CheckoutCustomerInput;
  items: CheckoutCartItem[];
}

export class CheckoutError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = "CHECKOUT_ERROR"
  ) {
    super(message);
  }
}

function isSerializableConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new CheckoutError(
      "Razorpay server keys are not configured.",
      500,
      "RAZORPAY_NOT_CONFIGURED"
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

function getPublicRazorpayKey() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;

  if (!keyId) {
    throw new CheckoutError(
      "Razorpay public key is not configured.",
      500,
      "RAZORPAY_PUBLIC_KEY_NOT_CONFIGURED"
    );
  }

  return keyId;
}

function normalizeCartItems(items: CheckoutCartItem[]) {
  const byVariant = new Map<string, number>();

  for (const item of items) {
    byVariant.set(item.variantId, (byVariant.get(item.variantId) || 0) + item.quantity);
  }

  return Array.from(byVariant.entries()).map(([variantId, quantity]) => ({
    variantId,
    quantity,
  }));
}

export async function releaseExpiredReservations(now = new Date()) {
  const expiredOrders = await prisma.order.findMany({
    where: {
      status: OrderStatus.pending,
      reservationExpiresAt: { lte: now },
      reservationReleasedAt: null,
    },
    select: { id: true },
    take: 50,
  });

  for (const order of expiredOrders) {
    await releaseReservationForOrder(order.id, "Reservation timed out", now);
  }

  return expiredOrders.length;
}

export async function releaseReservationForOrder(
  orderId: string,
  note: string,
  now = new Date()
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        id: orderId,
        status: OrderStatus.pending,
        reservationReleasedAt: null,
      },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      return false;
    }

    for (const item of order.items) {
      await tx.inventory.updateMany({
        where: {
          variantId: item.variantId,
          reservedQty: { gte: item.quantity },
        },
        data: {
          reservedQty: { decrement: item.quantity },
        },
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.cancelled,
        reservationReleasedAt: now,
      },
    });

    if (order.payment && order.payment.status === PaymentStatus.created) {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: {
          status: PaymentStatus.failed,
          rawPayload: {
            reason: note,
            releasedAt: now.toISOString(),
          },
        },
      });
    }

    return true;
  });
}

export async function createCheckoutOrder(input: CreateCheckoutInput) {
  const razorpay = getRazorpayClient();
  const publicKeyId = getPublicRazorpayKey();
  await releaseExpiredReservations();

  const normalizedItems = normalizeCartItems(input.items);
  if (normalizedItems.length === 0) {
    throw new CheckoutError("Your bag is empty.");
  }

  const reservationExpiresAt = new Date(Date.now() + RESERVATION_TIMEOUT_MS);

  let orderSnapshot: {
    orderId: string;
    amount: number;
    customer: {
      email: string;
      phone: string;
    };
  } | null = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      orderSnapshot = await prisma.$transaction(
        async (tx) => {
          const variants = await tx.productVariant.findMany({
            where: {
              id: { in: normalizedItems.map((item) => item.variantId) },
              product: { status: "published" },
            },
            include: {
              product: true,
              inventory: true,
            },
          });

          const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
          let subtotal = 0;

          for (const item of normalizedItems) {
            const variant = variantsById.get(item.variantId);
            if (!variant || !variant.inventory) {
              throw new CheckoutError("One or more items are no longer available.", 409, "ITEM_UNAVAILABLE");
            }

            const availableQty = variant.inventory.stockQty - variant.inventory.reservedQty;
            if (availableQty < item.quantity) {
              throw new CheckoutError(
                `${variant.product.name} (${variant.color}) has only ${Math.max(0, availableQty)} available.`,
                409,
                "INSUFFICIENT_STOCK"
              );
            }

            subtotal += variant.price * item.quantity;
          }

          const user = await tx.user.upsert({
            where: { email: input.customer.email.toLowerCase() },
            update: {},
            create: {
              email: input.customer.email.toLowerCase(),
              passwordHash: null,
              role: "customer",
            },
          });

          const address = await tx.address.create({
            data: {
              userId: user.id,
              line1: input.customer.line1,
              line2: input.customer.line2 || null,
              city: input.customer.city,
              state: input.customer.state,
              pincode: input.customer.pincode,
              phone: input.customer.phone,
            },
          });

          for (const item of normalizedItems) {
            await tx.inventory.update({
              where: { variantId: item.variantId },
              data: { reservedQty: { increment: item.quantity } },
            });
          }

          const order = await tx.order.create({
            data: {
              userId: user.id,
              addressId: address.id,
              subtotal,
              shipping: 0,
              tax: 0,
              total: subtotal,
              reservationExpiresAt,
              items: {
                create: normalizedItems.map((item) => {
                  const variant = variantsById.get(item.variantId);
                  if (!variant) {
                    throw new CheckoutError("One or more items are no longer available.", 409, "ITEM_UNAVAILABLE");
                  }

                  return {
                    variantId: item.variantId,
                    quantity: item.quantity,
                    priceAtPurchase: variant.price,
                  };
                }),
              },
            },
          });

          return {
            orderId: order.id,
            amount: order.total,
            customer: {
              email: user.email,
              phone: address.phone,
            },
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      );
      break;
    } catch (error) {
      if (attempt === 1 && isSerializableConflict(error)) {
        continue;
      }

      throw error;
    }
  }

  if (!orderSnapshot) {
    throw new CheckoutError("Checkout could not reserve stock safely.", 409, "STOCK_RESERVATION_CONFLICT");
  }

  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: orderSnapshot.amount,
      currency: "INR",
      receipt: orderSnapshot.orderId,
      notes: {
        localOrderId: orderSnapshot.orderId,
      },
    });

    await prisma.payment.create({
      data: {
        orderId: orderSnapshot.orderId,
        providerOrderId: razorpayOrder.id,
        amount: orderSnapshot.amount,
      },
    });

    return {
      orderId: orderSnapshot.orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: orderSnapshot.amount,
      currency: "INR",
      keyId: publicKeyId,
      reservationExpiresAt,
      customer: orderSnapshot.customer,
    };
  } catch (error) {
    await releaseReservationForOrder(
      orderSnapshot.orderId,
      "Razorpay order creation failed"
    );
    throw error;
  }
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "hex");
  const provided = Buffer.from(signature, "hex");

  if (expected.length !== provided.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, provided);
}

interface RazorpayPaymentEntity {
  id?: string;
  order_id?: string;
  amount?: number;
  status?: string;
}

interface RazorpayWebhookPayload {
  event?: string;
  created_at?: number;
  payload?: {
    payment?: {
      entity?: RazorpayPaymentEntity;
    };
  };
}

function getWebhookEventId(
  payload: RazorpayWebhookPayload,
  payment: RazorpayPaymentEntity,
  fallback: string | null
) {
  return (
    fallback ||
    `${payload.event || "unknown"}:${payment.order_id || "no-order"}:${payment.id || "no-payment"}:${payload.created_at || "no-created-at"}`
  );
}

export async function processRazorpayWebhook(
  payload: RazorpayWebhookPayload,
  rawBody: string,
  providerEventId: string | null
) {
  await releaseExpiredReservations();

  const eventType = payload.event || "unknown";
  const paymentEntity = payload.payload?.payment?.entity;

  if (!paymentEntity?.order_id) {
    throw new CheckoutError("Webhook payload missing Razorpay order id.", 400, "WEBHOOK_MISSING_ORDER");
  }

  const eventId = getWebhookEventId(payload, paymentEntity, providerEventId);
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { eventId },
    select: { id: true },
  });

  if (existingEvent) {
    return { processed: false, reason: "duplicate_event" };
  }

  try {
    return await prisma.$transaction(
      async (tx) => {
        await tx.webhookEvent.create({
          data: {
            eventId,
            eventType,
            rawPayload: payload as Prisma.InputJsonValue,
          },
        });

        const payment = await tx.payment.findUnique({
          where: { providerOrderId: paymentEntity.order_id },
          include: {
            order: {
              include: {
                items: true,
              },
            },
          },
        });

        if (!payment) {
          throw new CheckoutError("No local payment matches this Razorpay order.", 404, "PAYMENT_NOT_FOUND");
        }

        if (payment.amount !== paymentEntity.amount) {
          throw new CheckoutError("Webhook amount does not match local order amount.", 400, "AMOUNT_MISMATCH");
        }

        if (
          payment.status === PaymentStatus.captured ||
          payment.order.status === OrderStatus.paid
        ) {
          return { processed: false, reason: "already_captured" };
        }

        if (eventType === "payment.failed") {
          await releaseReservedItemsInTransaction(tx, payment.order.id);
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.failed,
              providerPaymentId: paymentEntity.id,
              signatureVerified: true,
              rawPayload: payload as Prisma.InputJsonValue,
            },
          });

          await tx.order.update({
            where: { id: payment.order.id },
            data: {
              status: OrderStatus.cancelled,
              reservationReleasedAt: new Date(),
            },
          });

          return { processed: true, reason: "payment_failed" };
        }

        if (eventType === "payment.authorized") {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.authorized,
              providerPaymentId: paymentEntity.id,
              signatureVerified: true,
              rawPayload: payload as Prisma.InputJsonValue,
            },
          });

          return { processed: true, reason: "payment_authorized" };
        }

        if (eventType !== "payment.captured") {
          return { processed: false, reason: "ignored_event" };
        }

        await capturePaidOrderInTransaction(tx, payment.order.id);

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.captured,
            providerPaymentId: paymentEntity.id,
            signatureVerified: true,
            rawPayload: payload as Prisma.InputJsonValue,
          },
        });

        await tx.order.update({
          where: { id: payment.order.id },
          data: {
            status: OrderStatus.paid,
            reservationReleasedAt: new Date(),
          },
        });

        return { processed: true, reason: "payment_captured" };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { processed: false, reason: "duplicate_event" };
    }

    throw error;
  }
}

async function releaseReservedItemsInTransaction(
  tx: Prisma.TransactionClient,
  orderId: string
) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.reservationReleasedAt || order.status !== OrderStatus.pending) {
    return;
  }

  for (const item of order.items) {
    await tx.inventory.updateMany({
      where: {
        variantId: item.variantId,
        reservedQty: { gte: item.quantity },
      },
      data: {
        reservedQty: { decrement: item.quantity },
      },
    });
  }
}

async function capturePaidOrderInTransaction(
  tx: Prisma.TransactionClient,
  orderId: string
) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new CheckoutError("Order not found for payment capture.", 404, "ORDER_NOT_FOUND");
  }

  if (order.status === OrderStatus.paid || order.reservationReleasedAt) {
    return;
  }

  for (const item of order.items) {
    const stockUpdate = await tx.inventory.updateMany({
      where: {
        variantId: item.variantId,
        stockQty: { gte: item.quantity },
        reservedQty: { gte: item.quantity },
      },
      data: {
        stockQty: { decrement: item.quantity },
        reservedQty: { decrement: item.quantity },
      },
    });

    if (stockUpdate.count !== 1) {
      throw new CheckoutError("Reserved stock could not be captured safely.", 409, "STOCK_CAPTURE_FAILED");
    }

    await tx.inventoryLog.create({
      data: {
        variantId: item.variantId,
        changeQty: -item.quantity,
        reason: InventoryChangeReason.sale,
        actorId: "system",
        note: `Order ${order.id} paid via Razorpay webhook`,
      },
    });
  }
}
