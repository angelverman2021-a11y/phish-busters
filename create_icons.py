from PIL import Image, ImageDraw

def create_icon(size):
    # Create image with gradient background
    img = Image.new('RGB', (size, size), color='#667eea')
    draw = ImageDraw.Draw(img)
    
    # Draw shield shape
    center = size // 2
    shield_size = int(size * 0.6)
    
    points = [
        (center, center - shield_size // 2),
        (center + shield_size // 2, center - shield_size // 4),
        (center + shield_size // 2, center + shield_size // 4),
        (center, center + shield_size // 2),
        (center - shield_size // 2, center + shield_size // 4),
        (center - shield_size // 2, center - shield_size // 4),
    ]
    
    draw.polygon(points, fill='white')
    
    # Save
    img.save(f'assets/icons/icon{size}.png')
    print(f'Created icon{size}.png')

# Generate icons
for size in [16, 48, 128]:
    create_icon(size)

print('All icons created!')
