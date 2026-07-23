import os

files_to_fix = [
  ('sakhy/app/(admin)/admin/orders/[id]/OrderDetailClient.tsx', [128, 162, 182]),
  ('sakhy/app/(storefront)/cart/page.tsx', [75, 84, 101]),
  ('sakhy/components/admin/TestimonialList.tsx', [93, 106, 112]),
  ('sakhy/components/admin/TestimonialsClient.tsx', [56]),
  ('sakhy/components/storefront/ProductInteractive.tsx', [122, 184, 252, 262]),
  ('sakhy/components/ui/Navbar.tsx', [47, 121])
]

for path, lines in files_to_fix:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.readlines()
    
    # We go in reverse order or just replace by line index
    for l in lines:
        line_idx = l - 1
        line_text = content[line_idx]
        if '<button' in line_text and 'type=' not in line_text:
            content[line_idx] = line_text.replace('<button', '<button type="button"')
            print(f'Fixed line {l} in {path}')
        else:
            print(f'Line {l} already has type or missing <button in {path}')

    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(content)
