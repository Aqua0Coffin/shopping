import os, re

# Replacements: (file_path, find_pattern, replace_pattern)
reps = [
    (
        'sakhy/app/(storefront)/cart/page.tsx',
        r'// eslint-disable-next-line @next/next/no-img-element\n\s*<img\n\s*src={item\.image}\n\s*alt={item\.name}\n\s*className="w-full h-full object-cover"\n\s*/>',
        r'<Image src={item.image} alt={item.name} fill className="object-cover" sizes="100px" />'
    ),
    (
        'sakhy/app/(storefront)/collections/page.tsx',
        r'// eslint-disable-next-line @next/next/no-img-element\n\s*<img\n\s*src={image}\n\s*alt={category\.name}\n\s*className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"\n\s*/>',
        r'<Image src={image} alt={category.name} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />'
    ),
    (
        'sakhy/app/(storefront)/page.tsx',
        r'// eslint-disable-next-line @next/next/no-img-element\n\s*<img\n\s*src={image}\n\s*alt={category\.name}\n\s*className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"\n\s*/>',
        r'<Image src={image} alt={category.name} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />'
    ),
    (
        'sakhy/components/admin/ImageUploader.tsx',
        r'\{/\* eslint-disable-next-line @next/next/no-img-element \*/\}\n\s*<img src=\{url\} alt="Uploaded" className="w-full h-full object-cover" />',
        r'<Image src={url} alt="Uploaded" fill className="object-cover" sizes="100px" />'
    ),
    (
        'sakhy/components/admin/TestimonialList.tsx',
        r'// eslint-disable-next-line @next/next/no-img-element\n\s*<img\n\s*src=\{t\.imageUrl\}\n\s*alt=\{t\.customerName\}\n\s*className="w-8 h-8 rounded-full object-cover border border-gold/20 mb-1"\n\s*/>',
        r'<div className="relative w-8 h-8 rounded-full overflow-hidden border border-gold/20 mb-1"><Image src={t.imageUrl} alt={t.customerName} fill className="object-cover" sizes="32px" /></div>'
    ),
    (
        'sakhy/components/admin/VariantList.tsx',
        r'// eslint-disable-next-line @next/next/no-img-element\n\s*<img src=\{v\.images\[0\]\} alt=\{v\.color\} className="w-16 h-16 object-cover border border-gold/20" />',
        r'<div className="relative w-16 h-16 border border-gold/20"><Image src={v.images[0]} alt={v.color} fill className="object-cover" sizes="64px" /></div>'
    ),
    (
        'sakhy/components/storefront/ProductInteractive.tsx',
        r'// eslint-disable-next-line @next/next/no-img-element\n\s*<img\n\s*src=\{activeImages\[activeImageIdx\]\}\n\s*alt=\{\`\$\{product\.name\} — \$\{selectedVariant\.color\}\`\}\n\s*className="w-full h-full object-cover transition-all duration-500"\n\s*/>',
        r'<Image src={activeImages[activeImageIdx]} alt={`${product.name} — ${selectedVariant.color}`} fill className="object-cover transition-all duration-500" sizes="(max-width: 768px) 100vw, 50vw" priority />'
    ),
    (
        'sakhy/components/storefront/ProductInteractive.tsx',
        r'\{/\* eslint-disable-next-line @next/next/no-img-element \*/\}\n\s*<img\n\s*src=\{img\}\n\s*alt=\{\`Thumbnail \$\{idx \+ 1\}\`\}\n\s*className="w-full h-full object-cover"\n\s*/>',
        r'<Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="80px" />'
    ),
    (
        'sakhy/components/ui/ProductCard.tsx',
        r'// eslint-disable-next-line @next/next/no-img-element\n\s*<img\n\s*src=\{image\}\n\s*alt=\{\`\$\{product\.name\} - \$\{variant\?\.color \|\| "Default"\}\`\}\n\s*className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"\n\s*loading="lazy"\n\s*/>',
        r'<Image src={image} alt={`${product.name} - ${variant?.color || "Default"}`} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />'
    )
]

for path, pattern, replacement in reps:
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace image tags
    content, count = re.subn(pattern, replacement, content)
    if count > 0:
        # Check if Image is imported
        if 'import Image ' not in content:
            # find first import
            import_idx = content.find('import ')
            if import_idx != -1:
                content = content[:import_idx] + 'import Image from "next/image";\n' + content[import_idx:]
            else:
                content = 'import Image from "next/image";\n' + content
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {count} instances in {path}")
