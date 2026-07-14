import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Dynamically import prisma after env is loaded
(async () => {
  const { prisma } = await import("@/lib/prisma");

  const keys = [
    "auth:admin-login-fail:127.0.0.1",
    "auth:admin-login-fail:::1",
  ];

  for (const key of keys) {
    const bucket = await prisma.rateLimitBucket.findUnique({ where: { key } });
    console.log("Bucket for", key, "=>", bucket);
    if (bucket) {
      console.log("Deleting bucket", key);
      await prisma.rateLimitBucket.deleteMany({ where: { key } });
      console.log("Deleted.");
    }
  }

  await prisma.$disconnect();
})();
