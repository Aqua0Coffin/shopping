/**
 * SAKHY — Prisma Seed
 * Seeds the 4 reference products from index.html (₹12,800–₹65,000 range)
 * plus their categories, variants, and initial inventory records.
 *
 * Run: npx prisma db seed
 * (or: npx tsx prisma/seed.ts)
 */

import { PrismaClient, ProductStatus, InventoryChangeReason } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


// ── HELPERS ───────────────────────────────────────────────────────────
/** Convert ₹ amount to paise (1 INR = 100 paise) */
const inr = (rupees: number) => Math.round(rupees * 100);

async function main() {
  console.log("🌱 Seeding Sakhy database...\n");

  // ── CATEGORIES ────────────────────────────────────────────────────
  const [catBridal, catFestive, catEveryday] = await Promise.all([
    prisma.category.upsert({
      where: { slug: "bridal" },
      update: {},
      create: {
        name: "Bridal",
        slug: "bridal",
        description: "Exquisite sarees crafted for your most important day — rich silks, heavy zari, and heirloom motifs.",
      },
    }),
    prisma.category.upsert({
      where: { slug: "festive" },
      update: {},
      create: {
        name: "Festive",
        slug: "festive",
        description: "Vibrant, celebratory weaves for pujas, weddings, and joyful occasions.",
      },
    }),
    prisma.category.upsert({
      where: { slug: "everyday" },
      update: {},
      create: {
        name: "Everyday",
        slug: "everyday",
        description: "Lightweight, breathable weaves that move with you through every moment of the day.",
      },
    }),
  ]);

  console.log("✓ Categories seeded");

  // ── PRODUCTS & VARIANTS ───────────────────────────────────────────
  const productsData = [
    {
      name: "Bridal Red Zari",
      slug: "bridal-red-zari",
      description:
        "A masterpiece in deep crimson Kanjivaram silk, adorned with intricate gold zari work throughout the body and a rich temple-border pallu. Woven by master artisans in Kanchipuram, Tamil Nadu — a saree worthy of your most cherished day.",
      categoryId: catBridal.id,
      fabricType: "Kanjivaram Silk",
      occasion: "Bridal",
      status: ProductStatus.published,
      basePrice: inr(48500),
      variants: [
        {
          sku: "SKU-BRZ-RED-001",
          color: "Deep Crimson",
          blouseIncluded: true,
          borderType: "Temple Border",
          price: inr(48500),
          images: [],
          weightGrams: 800,
          stock: 10,
          lowStockThreshold: 3,
        },
        {
          sku: "SKU-BRZ-GLD-001",
          color: "Crimson with Gold",
          blouseIncluded: true,
          borderType: "Broad Zari Border",
          price: inr(52000),
          images: [],
          weightGrams: 850,
          stock: 5,
          lowStockThreshold: 2,
        },
      ],
    },
    {
      name: "Royal Navy Brocade",
      slug: "royal-navy-brocade",
      description:
        "A regal Banarasi silk saree in deep navy, woven with gold brocade motifs inspired by Mughal garden patterns. The contrast of navy and gold creates a timeless festive look that commands presence in any celebration.",
      categoryId: catFestive.id,
      fabricType: "Banarasi Silk",
      occasion: "Festive",
      status: ProductStatus.published,
      basePrice: inr(32000),
      variants: [
        {
          sku: "SKU-RNB-NVY-001",
          color: "Royal Navy",
          blouseIncluded: false,
          borderType: "Mughal Brocade Border",
          price: inr(32000),
          images: [],
          weightGrams: 750,
          stock: 10,
          lowStockThreshold: 3,
        },
        {
          sku: "SKU-RNB-BLK-001",
          color: "Midnight Black",
          blouseIncluded: false,
          borderType: "Mughal Brocade Border",
          price: inr(34500),
          images: [],
          weightGrams: 755,
          stock: 8,
          lowStockThreshold: 3,
        },
      ],
    },
    {
      name: "Forest Mist Sheer",
      slug: "forest-mist-sheer",
      description:
        "A graceful Chanderi cotton-silk saree in muted sage green, sheer as morning mist. Its delicate texture and subtle shimmer make it ideal for office wear, daytime events, or relaxed celebrations where comfort meets elegance.",
      categoryId: catEveryday.id,
      fabricType: "Chanderi Cotton Silk",
      occasion: "Everyday",
      status: ProductStatus.published,
      basePrice: inr(12800),
      variants: [
        {
          sku: "SKU-FMS-SGR-001",
          color: "Sage Green",
          blouseIncluded: false,
          borderType: "Thin Zari Border",
          price: inr(12800),
          images: [],
          weightGrams: 400,
          stock: 15,
          lowStockThreshold: 5,
        },
        {
          sku: "SKU-FMS-IVY-001",
          color: "Ivory Mist",
          blouseIncluded: false,
          borderType: "Thin Zari Border",
          price: inr(13500),
          images: [],
          weightGrams: 400,
          stock: 12,
          lowStockThreshold: 5,
        },
      ],
    },
    {
      name: "Violet Peacock",
      slug: "violet-peacock",
      description:
        "An extraordinarily rare Paithani silk saree hand-woven in Yeola, Maharashtra. The deep violet ground showcases the iconic peacock-eye motif in pure gold and silver zari — each saree taking over a month to weave. A limited-edition collector's piece.",
      categoryId: catFestive.id,
      fabricType: "Paithani Silk",
      occasion: "Bridal",
      status: ProductStatus.published,
      basePrice: inr(65000),
      variants: [
        {
          sku: "SKU-VPC-VIO-001",
          color: "Violet",
          blouseIncluded: true,
          borderType: "Peacock-Eye Paithani Border",
          price: inr(65000),
          images: [],
          weightGrams: 900,
          stock: 3,
          lowStockThreshold: 1,
        },
      ],
    },
  ];

  for (const p of productsData) {
    const { variants, ...productData } = p;

    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    });

    for (const v of variants) {
      const { stock, lowStockThreshold, ...variantData } = v;

      const variant = await prisma.productVariant.upsert({
        where: { sku: variantData.sku },
        update: {},
        create: { ...variantData, productId: product.id },
      });

      // Seed inventory
      await prisma.inventory.upsert({
        where: { variantId: variant.id },
        update: {},
        create: {
          variantId: variant.id,
          stockQty: stock,
          reservedQty: 0,
          lowStockThreshold,
        },
      });

      // Initial inventory log
      const existing = await prisma.inventoryLog.findFirst({
        where: { variantId: variant.id, reason: InventoryChangeReason.restock },
      });
      if (!existing) {
        await prisma.inventoryLog.create({
          data: {
            variantId: variant.id,
            changeQty: stock,
            reason: InventoryChangeReason.restock,
            actorId: "system",
            note: "Initial seed stock",
          },
        });
      }
    }

    console.log(`  ✓ ${product.name} — ${variants.length} variant(s)`);
  }

  // ── SEED ADMIN USER (local dev only) ─────────────────────────────
  // Dev admin credentials are seeded with bcrypt so NextAuth credentials login works.
  // Email: admin@sakhy.local | Password: Admin@1234
  const adminEmail = "admin@sakhy.local";
  const [adminPasswordHash, existingAdmin] = await Promise.all([
    hash("Admin@1234", 12),
    prisma.user.findUnique({ where: { email: adminEmail } }),
  ]);
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: "admin",
      },
    });
    console.log(`  ✓ Dev admin user created: ${adminEmail} (password: Admin@1234)`);
  } else if (!existingAdmin.passwordHash || existingAdmin.passwordHash === "CHANGE_ME_BEFORE_PROD") {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: { passwordHash: adminPasswordHash, role: "admin" },
    });
    console.log(`  ✓ Dev admin credentials refreshed: ${adminEmail} (password: Admin@1234)`);
  }

  // ── SEED TESTIMONIALS ────────────────────────────────────────────
  const testimonialsData = [
    {
      customerName: "Priya Ramachandran",
      quote: "My bridal Kanjivaram from Sakhy was everything I dreamed of. The weight, the lustre, the gold zari — it felt like wearing a piece of history on the most important day of my life.",
      location: "Chennai, Tamil Nadu",
      sortOrder: 1,
    },
    {
      customerName: "Kavitha Iyer",
      quote: "Three generations of women in my family have worn Sakhy sarees. The quality has never wavered — each piece tells a story of extraordinary skill and devotion.",
      location: "Mumbai, Maharashtra",
      sortOrder: 2,
    },
    {
      customerName: "Ananya Desai",
      quote: "The consultation was like stepping into another era. They understood my aesthetic perfectly and guided me to a Paithani that made my mother weep with joy at the wedding.",
      location: "Pune, Maharashtra",
      sortOrder: 3,
    },
  ];

  for (const t of testimonialsData) {
    // Check if testimonial already exists to maintain idempotency
    const existing = await prisma.testimonial.findFirst({
      where: { customerName: t.customerName },
    });
    if (!existing) {
      await prisma.testimonial.create({ data: t });
    }
  }
  console.log("  ✓ Seeded testimonials");

  console.log("\n✅ Seed complete!\n");
  console.log("Products seeded:");
  console.log("  • Bridal Red Zari      (Kanjivaram Silk)      ₹48,500");
  console.log("  • Royal Navy Brocade   (Banarasi Silk)        ₹32,000");
  console.log("  • Forest Mist Sheer    (Chanderi Cotton Silk) ₹12,800");
  console.log("  • Violet Peacock       (Paithani Silk)        ₹65,000");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
