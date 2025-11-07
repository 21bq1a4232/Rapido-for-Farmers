const fs = require('fs');
const path = require('path');

// Minimal 1x1 green PNG in base64 (valid PNG file)
const greenPixel = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg==';

// Create larger green PNG for icons (actual size doesn't matter for placeholders)
const createIcon = (size, filename) => {
  const assetsDir = path.join(__dirname, 'assets');

  // For simplicity, we'll use the same small PNG for all
  // Expo will scale them appropriately
  const buffer = Buffer.from(greenPixel, 'base64');
  fs.writeFileSync(path.join(assetsDir, filename), buffer);
  console.log(`✅ Created ${filename} (${buffer.length} bytes)`);
};

console.log('📦 Generating placeholder assets...\n');

try {
  createIcon(1024, 'icon.png');
  createIcon(2048, 'splash.png');
  createIcon(1024, 'adaptive-icon.png');
  createIcon(48, 'favicon.png');
  createIcon(96, 'notification-icon.png');

  console.log('\n✅ All placeholder assets created successfully!');
  console.log('\n💡 These are minimal placeholders. Replace with custom icons later.');
  console.log('   You can design custom icons at: canva.com or figma.com\n');
} catch (error) {
  console.error('❌ Error creating assets:', error.message);
  process.exit(1);
}
