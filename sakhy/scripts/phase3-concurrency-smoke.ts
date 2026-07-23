import "dotenv/config";
import Razorpay from "razorpay";
import { prisma } from "../lib/prisma";

const originalAddResources = Razorpay.prototype.addResources;
Razorpay.prototype.addResources = function patchedAddResources() {
  originalAddResources.call(this);
  this.orders.create = async (params: { receipt?: string; amount?: number }) => ({
    id: `rzp_order_mock_${params.receipt}`,
    amount: params.amount,
  });
};

async function main() {
  process.env.RAZORPAY_KEY_ID = "rzp_test_mock";
  process.env.RAZORPAY_KEY_SECRET = "mock_secret";
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = "rzp_test_mock";

  const suffix = Date.now().toString();
  const category = await prisma.category.create({
    data: {
      name: `Phase 3 Concurrent ${suffix}`,
      slug: `phase-3-concurrent-${suffix}`,
    },
  });
  const product = await prisma.product.create({
    data: {
      name: `Phase 3 Concurrent Product ${suffix}`,
      slug: `phase-3-concurrent-product-${suffix}`,
      categoryId: category.id,
      fabricType: "Concurrent Silk",
      status: "published",
      basePrice: 100000,
    },
  });
  const variant = await prisma.productVariant.create({
    data: {
      productId: product.id,
      sku: `CONCURRENT-${suffix}`,
      color: "Gold",
      price: 100000,
      images: [],
    },
  });
  await prisma.inventory.create({
    data: {
      variantId: variant.id,
      stockQty: 1,
      reservedQty: 0,
    },
  });

  const { POST } = await import("../app/api/checkout/initiate/route");

  const body = (email: string) =>
    JSON.stringify({
      customer: {
        email,
        line1: "Concurrency Test House",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600001",
        phone: "9876543210",
      },
      items: [{ variantId: variant.id, quantity: 1 }],
    });

  const makeRequest = (email: string) =>
    new Request("http://localhost:3000/api/checkout/initiate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": `phase3-concurrent-${suffix}`,
      },
      body: body(email),
    });

  const responses = await Promise.all([
    POST(makeRequest(`phase3-concurrent-a-${suffix}@example.test`)),
    POST(makeRequest(`phase3-concurrent-b-${suffix}@example.test`)),
  ]);
  const results = await Promise.all(
    responses.map(async (res) => ({
      status: res.status,
      body: await res.json(),
    }))
  );

  const successCount = results.filter((result) => result.status === 201).length;
  const stockConflictCount = results.filter(
    (result) =>
      result.status === 409 &&
      result.body.code === "INSUFFICIENT_STOCK" &&
      String(result.body.error).includes("only 0 available")
  ).length;
  const inventory = await prisma.inventory.findUniqueOrThrow({
    where: { variantId: variant.id },
  });

  if (successCount !== 1) {
    throw new Error(`Expected exactly one success, got ${JSON.stringify(results)}`);
  }
  if (stockConflictCount !== 1) {
    throw new Error(`Expected exactly one clean out-of-stock response, got ${JSON.stringify(results)}`);
  }
  if (inventory.stockQty !== 1 || inventory.reservedQty !== 1) {
    throw new Error(`Expected one reservation and no stock decrement, got ${JSON.stringify(inventory)}`);
  }

  console.log(
    `phase3-concurrency ok: statuses=${results
      .map((result) => `${result.status}:${result.body.code || "created"}`)
      .join(", ")} stockQty=${inventory.stockQty} reservedQty=${inventory.reservedQty}`
  );
}

main()
  .finally(async () => {
    await prisma.payment.deleteMany({
      where: { providerOrderId: { startsWith: "rzp_order_mock_" } },
    });
    await prisma.orderItem.deleteMany({
      where: { variant: { sku: { startsWith: "CONCURRENT-" } } },
    });
    await prisma.order.deleteMany({
      where: {
        user: {
          email: { startsWith: "phase3-concurrent-" },
        },
      },
    });
    await prisma.address.deleteMany({
      where: {
        user: {
          email: { startsWith: "phase3-concurrent-" },
        },
      },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: "phase3-concurrent-" } },
    });
    await prisma.inventory.deleteMany({
      where: { variant: { sku: { startsWith: "CONCURRENT-" } } },
    });
    await prisma.productVariant.deleteMany({
      where: { sku: { startsWith: "CONCURRENT-" } },
    });
    await prisma.product.deleteMany({
      where: { slug: { startsWith: "phase-3-concurrent-product-" } },
    });
    await prisma.category.deleteMany({
      where: { slug: { startsWith: "phase-3-concurrent-" } },
    });
    await prisma.rateLimitBucket.deleteMany({
      where: { key: { startsWith: "checkout:initiate:phase3-concurrent-" } },
    });
    await prisma.$disconnect();
  });
