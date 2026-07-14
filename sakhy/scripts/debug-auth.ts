import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // load DIRECT_URL / DATABASE_URL

import { hash } from "bcryptjs";

async function main() {
  const { prisma } = await import("../lib/prisma.js");

  const passwordHash = await hash("Admin@1234", 12);
  console.log("Generated hash:", passwordHash.substring(0, 10) + "...");

  const updated = await prisma.user.update({
    where: { email: "admin@sakhy.local" },
    data: { passwordHash },
    select: { id: true, email: true, role: true },
  });

  console.log("Updated user:", updated);
  await prisma.$disconnect();
}

main();
