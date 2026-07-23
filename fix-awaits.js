const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'sakhy/app/(admin)/admin/customers/[id]/page.tsx',
    target: `  const orders = await prisma.order.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      _count: { select: { items: true } },
      payment: { select: { status: true } },
    },
  });

  const orderAggs = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: id, status: { not: "cancelled" } },
    _sum: { total: true },
  });`,
    replacement: `  const [orders, orderAggs] = await Promise.all([
    prisma.order.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        _count: { select: { items: true } },
        payment: { select: { status: true } },
      },
    }),
    prisma.order.groupBy({
      by: ["userId"],
      where: { userId: id, status: { not: "cancelled" } },
      _sum: { total: true },
    })
  ]);`
  },
  {
    file: 'sakhy/app/(storefront)/collections/[slug]/page.tsx',
    target: `  const { slug } = await params;
  const { fabric, occasion, price } = await searchParams;`,
    replacement: `  const [{ slug }, { fabric, occasion, price }] = await Promise.all([
    params,
    searchParams,
  ]);`
  },
  {
    file: 'sakhy/app/api/admin/customers/[id]/route.ts',
    target: `  const orders = await prisma.order.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      _count: { select: { items: true } },
      payment: { select: { status: true, providerPaymentId: true } },
    },
  });

  const orderAggs = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: id, status: { not: "cancelled" } },
    _sum: { total: true },
  });`,
    replacement: `  const [orders, orderAggs] = await Promise.all([
    prisma.order.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        _count: { select: { items: true } },
        payment: { select: { status: true, providerPaymentId: true } },
      },
    }),
    prisma.order.groupBy({
      by: ["userId"],
      where: { userId: id, status: { not: "cancelled" } },
      _sum: { total: true },
    })
  ]);`
  },
  {
    file: 'sakhy/app/api/admin/inventory/[variantId]/adjust/route.ts',
    target: `  const { variantId } = await params;

  const body = await req.json();`,
    replacement: `  const [{ variantId }, body] = await Promise.all([
    params,
    req.json(),
  ]);`
  },
  {
    file: 'sakhy/app/api/admin/products/[productId]/route.ts',
    target: `  const { productId } = await context.params;
  const body = await req.json();`,
    replacement: `  const [{ productId }, body] = await Promise.all([
    context.params,
    req.json(),
  ]);`
  },
  {
    file: 'sakhy/app/api/admin/products/[productId]/variants/route.ts',
    target: `  const { productId } = await context.params;
  const body = await req.json();`,
    replacement: `  const [{ productId }, body] = await Promise.all([
    context.params,
    req.json(),
  ]);`
  },
  {
    file: 'sakhy/app/api/admin/testimonials/[id]/route.ts',
    target: `  const { id } = await params;
  const body = await req.json();`,
    replacement: `  const [{ id }, body] = await Promise.all([
    params,
    req.json(),
  ]);`
  },
  {
    file: 'sakhy/app/api/admin/variants/[variantId]/route.ts',
    target: `  const { variantId } = await context.params;
  const body = await req.json();`,
    replacement: `  const [{ variantId }, body] = await Promise.all([
    context.params,
    req.json(),
  ]);`
  },
  {
    file: 'sakhy/prisma/seed.ts',
    target: `  const adminPasswordHash = await hash("Admin@1234", 12);
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });`,
    replacement: `  const [adminPasswordHash, existingAdmin] = await Promise.all([
    hash("Admin@1234", 12),
    prisma.user.findUnique({ where: { email: adminEmail } }),
  ]);`
  }
];

for (const rep of replacements) {
  const p = path.join(process.cwd(), rep.file);
  if (!fs.existsSync(p)) {
    console.log('Missing:', p);
    continue;
  }
  let content = fs.readFileSync(p, 'utf8');
  let targetNormalized = rep.target.replace(/\\r\\n/g, '\\n'); // In case literal backslashes
  targetNormalized = targetNormalized.replace(/\\r/g, '').replace(/\\n/g, '\\n');
  
  // Just unify line endings for matching
  let uContent = content.replace(/\\r\\n/g, '\\n');
  let uTarget = rep.target.replace(/\\r\\n/g, '\\n');
  
  if (uContent.includes(uTarget)) {
    uContent = uContent.replace(uTarget, rep.replacement.replace(/\\r\\n/g, '\\n'));
    fs.writeFileSync(p, uContent, 'utf8');
    console.log('Fixed:', rep.file);
  } else {
    console.log('Target not found in', rep.file);
  }
}
