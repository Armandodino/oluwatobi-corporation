import { db } from '../src/lib/db';

async function updateProductImages() {
  const imageUpdates = [
    { sku: 'OUT-001', image: '/images/products/hammer.png' },
    { sku: 'OUT-002', image: '/images/products/hardware.png' },
    { sku: 'ELEC-001', image: '/images/products/drill.png' },
    { sku: 'VIS-001', image: '/images/products/hardware.png' },
    { sku: 'PLO-001', image: '/images/products/faucet.png' },
    { sku: 'PEIN-001', image: '/images/products/paint.png' },
    { sku: 'JAR-001', image: '/images/products/shears.png' },
    { sku: 'PORT-001', image: '/images/products/handle.png' },
  ];

  for (const update of imageUpdates) {
    try {
      await db.product.update({
        where: { sku: update.sku },
        data: { image: update.image },
      });
      console.log(`Updated product ${update.sku} with image ${update.image}`);
    } catch (error) {
      console.error(`Error updating product ${update.sku}:`, error);
    }
  }

  console.log('Done!');
}

updateProductImages();
