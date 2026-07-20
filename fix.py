import os
import re

files_to_fix = [
    (
        'sakhy/app/(admin)/admin/customers/[id]/page.tsx',
        r'const orders = await prisma\.order\.findMany\(\{[\s\S]*?\}\);\s*const orderAggs = await prisma\.order\.groupBy\(\{[\s\S]*?\}\);',
        '''const [orders, orderAggs] = await Promise.all([
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
  ]);'''
    ),
    (
        'sakhy/app/(storefront)/collections/[slug]/page.tsx',
        r'const \{ slug \} = await params;\s*const \{ fabric, occasion, price \} = await searchParams;',
        '''const [{ slug }, { fabric, occasion, price }] = await Promise.all([
    params,
    searchParams,
  ]);'''
    ),
    (
        'sakhy/app/api/admin/customers/[id]/route.ts',
        r'const orders = await prisma\.order\.findMany\(\{[\s\S]*?\}\);\s*const orderAggs = await prisma\.order\.groupBy\(\{[\s\S]*?\}\);',
        '''const [orders, orderAggs] = await Promise.all([
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
  ]);'''
    ),
    (
        'sakhy/app/api/admin/inventory/[variantId]/adjust/route.ts',
        r'const \{ variantId \} = await params;\s*const body = await req\.json\(\);',
        '''const [{ variantId }, body] = await Promise.all([
    params,
    req.json(),
  ]);'''
    ),
    (
        'sakhy/app/api/admin/products/[productId]/route.ts',
        r'const \{ productId \} = await context\.params;\s*const body = await req\.json\(\);',
        '''const [{ productId }, body] = await Promise.all([
    context.params,
    req.json(),
  ]);'''
    ),
    (
        'sakhy/app/api/admin/products/[productId]/variants/route.ts',
        r'const \{ productId \} = await context\.params;\s*const body = await req\.json\(\);',
        '''const [{ productId }, body] = await Promise.all([
    context.params,
    req.json(),
  ]);'''
    ),
    (
        'sakhy/app/api/admin/testimonials/[id]/route.ts',
        r'const \{ id \} = await params;\s*const body = await req\.json\(\);',
        '''const [{ id }, body] = await Promise.all([
    params,
    req.json(),
  ]);'''
    ),
    (
        'sakhy/app/api/admin/variants/[variantId]/route.ts',
        r'const \{ variantId \} = await context\.params;\s*const body = await req\.json\(\);',
        '''const [{ variantId }, body] = await Promise.all([
    context.params,
    req.json(),
  ]);'''
    ),
    (
        'sakhy/prisma/seed.ts',
        r'const adminPasswordHash = await hash\("Admin@1234", 12\);\s*const existingAdmin = await prisma\.user\.findUnique\(\{ where: \{ email: adminEmail \} \}\);',
        '''const [adminPasswordHash, existingAdmin] = await Promise.all([
    hash("Admin@1234", 12),
    prisma.user.findUnique({ where: { email: adminEmail } }),
  ]);'''
    )
]

for fpath, pattern, repl in files_to_fix:
    if not os.path.exists(fpath):
        print(f"Missing {fpath}")
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content, count = re.subn(pattern, repl, content)
    if count > 0:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {fpath}")
    else:
        print(f"Target not found in {fpath}")
