import os

files_to_fix = [
    ('sakhy/app/(storefront)/care-guide/page.tsx', 5, 'export default function CareGuidePage() {'),
    ('sakhy/app/(storefront)/collections/[slug]/page.tsx', 99, 'export default async function CategoryPage({ params, searchParams }: PageProps) {'),
    ('sakhy/app/(storefront)/heritage/page.tsx', 5, 'export default function HeritagePage() {'),
    ('sakhy/app/(storefront)/page.tsx', 63, 'export default async function HomePage() {'),
    ('sakhy/app/(storefront)/shipping/page.tsx', 5, 'export default function ShippingPage() {'),
    ('sakhy/components/ui/Button.tsx', 35, 'export default function Button({'),
    ('sakhy/components/ui/Button.tsx', 24, 'export default function Button({'),
    ('sakhy/components/ui/Navbar.tsx', 28, 'export default function Navbar({'),
    ('sakhy/components/ui/PriceTag.tsx', 19, 'export default function PriceTag({')
]

for fpath, l, func_decl in files_to_fix:
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    line_idx = l - 1
    
    start_line = lines[line_idx]
    
    open_brace = 0
    close_brace = 0
    end_idx = line_idx
    for i in range(line_idx, len(lines)):
        open_brace += lines[i].count('{') + lines[i].count('[')
        close_brace += lines[i].count('}') + lines[i].count(']')
        if open_brace > 0 and open_brace == close_brace:
            end_idx = i
            break
            
    if end_idx == line_idx and open_brace == 0:
        continue
        
    extracted = lines[line_idx:end_idx+1]
    
    lines = lines[:line_idx] + lines[end_idx+1:]
    
    for i, line in enumerate(lines):
        if line.startswith(func_decl) or func_decl in line:
            lines = lines[:i] + extracted + ['\n'] + lines[i:]
            break

    with open(fpath, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print(f"Hoisted in {fpath}")
