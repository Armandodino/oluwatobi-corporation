import { db } from '../src/lib/db';

// Taux de change: 1 EUR ≈ 655.957 FCFA
// On arrondit les prix pour qu'ils soient plus "ronds" en FCFA

async function updatePricesToFCFA() {
  const priceUpdates = [
    // Outillage à main
    { sku: 'OUT-001', price: 19500, salePrice: null },      // Marteau - 29.99€ → 19 500 FCFA
    { sku: 'OUT-002', price: 13000, salePrice: 10000 },     // Jeu tournevis - 19.99€ → 13 000 FCFA, promo 10 000 FCFA
    { sku: 'OUT-003', price: 10500, salePrice: null },      // Pince coupante - 15.99€ → 10 500 FCFA
    { sku: 'OUT-004', price: 16500, salePrice: null },      // Clé à molette - 24.99€ → 16 500 FCFA
    { sku: 'OUT-005', price: 12500, salePrice: null },      // Niveau à bulle - 18.99€ → 12 500 FCFA

    // Outillage électrique
    { sku: 'ELEC-001', price: 98000, salePrice: 85000 },    // Perceuse-visseuse - 149.99€ → 98 000 FCFA, promo 85 000 FCFA
    { sku: 'ELEC-002', price: 59000, salePrice: null },     // Meuleuse - 89.99€ → 59 000 FCFA
    { sku: 'ELEC-003', price: 52000, salePrice: null },     // Ponceuse - 79.99€ → 52 000 FCFA
    { sku: 'ELEC-004', price: 85000, salePrice: null },     // Scie circulaire - 129.99€ → 85 000 FCFA

    // Visserie
    { sku: 'VIS-001', price: 23000, salePrice: null },      // Kit visserie - 34.99€ → 23 000 FCFA
    { sku: 'VIS-002', price: 12500, salePrice: null },      // Boulons - 18.99€ → 12 500 FCFA
    { sku: 'VIS-003', price: 8500, salePrice: null },       // Chevilles - 12.99€ → 8 500 FCFA

    // Quincaillerie portes
    { sku: 'PORT-001', price: 19500, salePrice: null },     // Poignée porte - 29.99€ → 19 500 FCFA
    { sku: 'PORT-002', price: 52000, salePrice: null },     // Serrure 3 points - 79.99€ → 52 000 FCFA
    { sku: 'PORT-003', price: 16500, salePrice: null },     // Charnières piano - 24.99€ → 16 500 FCFA

    // Plomberie
    { sku: 'PLO-001', price: 98000, salePrice: 78000 },     // Robinet mitigeur - 149.99€ → 98 000 FCFA, promo 78 000 FCFA
    { sku: 'PLO-002', price: 6000, salePrice: null },       // Tuyau PVC - 8.99€ → 6 000 FCFA
    { sku: 'PLO-003', price: 2500, salePrice: null },       // Joints flex - 3.99€ → 2 500 FCFA

    // Électricité
    { sku: 'ELEC-005', price: 3500, salePrice: null },      // Prise 2P+T - 4.99€ → 3 500 FCFA
    { sku: 'ELEC-006', price: 5500, salePrice: null },      // Interrupteur - 7.99€ → 5 500 FCFA
    { sku: 'ELEC-007', price: 39000, salePrice: null },     // Câble 100m - 59.99€ → 39 000 FCFA

    // Peinture
    { sku: 'PEIN-001', price: 33000, salePrice: 26000 },    // Peinture 10L - 49.99€ → 33 000 FCFA, promo 26 000 FCFA
    { sku: 'PEIN-002', price: 6000, salePrice: null },      // Rouleau - 8.99€ → 6 000 FCFA
    { sku: 'PEIN-003', price: 8500, salePrice: null },      // Set pinceaux - 12.99€ → 8 500 FCFA

    // Jardin
    { sku: 'JAR-001', price: 16500, salePrice: null },      // Sécateur - 24.99€ → 16 500 FCFA
    { sku: 'JAR-002', price: 19500, salePrice: null },      // Tuyau arrosage - 29.99€ → 19 500 FCFA
    { sku: 'JAR-003', price: 23000, salePrice: null },      // Pelle - 34.99€ → 23 000 FCFA
  ];

  for (const update of priceUpdates) {
    try {
      await db.product.update({
        where: { sku: update.sku },
        data: {
          price: update.price,
          salePrice: update.salePrice,
        },
      });
      console.log(`✓ Updated ${update.sku}: ${update.price} FCFA${update.salePrice ? ` (promo: ${update.salePrice} FCFA)` : ''}`);
    } catch (error) {
      console.error(`✗ Error updating ${update.sku}:`, error);
    }
  }

  console.log('\n✅ All prices updated to FCFA!');
}

updatePricesToFCFA();
