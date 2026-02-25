// Icon Generator Script
// Run with: node generate-icons.js
// Requires: npm install canvas

const fs = require('fs');
const path = require('path');

// Check if canvas is available
let Canvas;
try {
  Canvas = require('canvas');
} catch (e) {
  console.log('⚠️  Canvas module not found. Install with: npm install canvas');
  console.log('📝 Alternative: Open icon-generator.html in your browser and save icons manually');
  process.exit(0);
}

const { createCanvas } = Canvas;

// Icon sizes
const sizes = [16, 48, 128];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate each icon size
sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Shield icon
  ctx.fillStyle = 'white';
  ctx.beginPath();
  const centerX = size / 2;
  const centerY = size / 2;
  const shieldSize = size * 0.6;
  
  ctx.moveTo(centerX, centerY - shieldSize / 2);
  ctx.lineTo(centerX + shieldSize / 2, centerY - shieldSize / 4);
  ctx.lineTo(centerX + shieldSize / 2, centerY + shieldSize / 4);
  ctx.lineTo(centerX, centerY + shieldSize / 2);
  ctx.lineTo(centerX - shieldSize / 2, centerY + shieldSize / 4);
  ctx.lineTo(centerX - shieldSize / 2, centerY - shieldSize / 4);
  ctx.closePath();
  ctx.fill();

  // Checkmark
  ctx.strokeStyle = '#667eea';
  ctx.lineWidth = size / 16;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(centerX - shieldSize / 6, centerY);
  ctx.lineTo(centerX - shieldSize / 12, centerY + shieldSize / 6);
  ctx.lineTo(centerX + shieldSize / 4, centerY - shieldSize / 6);
  ctx.stroke();

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const filename = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filename, buffer);
  console.log(`✅ Generated: icon${size}.png`);
});

console.log('\n🎉 All icons generated successfully!');
console.log(`📁 Location: ${iconsDir}`);
