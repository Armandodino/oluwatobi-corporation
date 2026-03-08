import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Seed database with initial data
export async function GET() {
  try {
    // First, create or update admin user
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@oluwatobi-ci.com' },
    });

    let admin;
    if (existingAdmin) {
      admin = await db.user.update({
        where: { email: 'admin@oluwatobi-ci.com' },
        data: {
          password: 'Oluwatobi@@',
          name: 'Administrateur',
          role: 'admin',
        },
      });
    } else {
      admin = await db.user.create({
        data: {
          email: 'admin@oluwatobi-ci.com',
          name: 'Administrateur',
          password: 'Oluwatobi@@',
          role: 'admin',
        },
      });
    }

    // Create categories
    const categories = await Promise.all([
      db.category.upsert({
        where: { slug: 'outillage-main' },
        update: {},
        create: {
          name: 'Outillage à main',
          slug: 'outillage-main',
          description: 'Outils manuels pour tous vos travaux',
        },
      }),
      db.category.upsert({
        where: { slug: 'outillage-electrique' },
        update: {},
        create: {
          name: 'Outillage électrique',
          slug: 'outillage-electrique',
          description: 'Perceuses, ponceuses, meuleuses et plus',
        },
      }),
      db.category.upsert({
        where: { slug: 'visserie-boulonnerie' },
        update: {},
        create: {
          name: 'Visserie et boulonnerie',
          slug: 'visserie-boulonnerie',
          description: 'Vis, boulons, écrous et rondelles',
        },
      }),
      db.category.upsert({
        where: { slug: 'quincaillerie-portes' },
        update: {},
        create: {
          name: 'Quincaillerie de portes',
          slug: 'quincaillerie-portes',
          description: 'Poignées, serrures, charnières et accessoires',
        },
      }),
      db.category.upsert({
        where: { slug: 'plomberie' },
        update: {},
        create: {
          name: 'Plomberie',
          slug: 'plomberie',
          description: 'Tuyaux, robinets et accessoires de plomberie',
        },
      }),
      db.category.upsert({
        where: { slug: 'electricite' },
        update: {},
        create: {
          name: 'Électricité',
          slug: 'electricite',
          description: 'Prises, interrupteurs et matériel électrique',
        },
      }),
      db.category.upsert({
        where: { slug: 'peinture' },
        update: {},
        create: {
          name: 'Peinture et décoration',
          slug: 'peinture',
          description: 'Peintures, pinceaux et accessoires',
        },
      }),
      db.category.upsert({
        where: { slug: 'jardin' },
        update: {},
        create: {
          name: 'Jardin',
          slug: 'jardin',
          description: 'Outils de jardin et arrosage',
        },
      }),
    ]);

    // Create products
    const productsData = [
      // Outillage à main
      {
        name: 'Marteau tête fibres 500g',
        slug: 'marteau-tete-fibres-500g',
        description: 'Marteau professionnel avec tête en fibres composite pour reduced vibration. Manche en fibre de verre ergonomique.',
        price: 29.99,
        sku: 'OUT-001',
        stock: 45,
        categoryId: categories[0].id,
        featured: true,
        brand: 'Stanley',
        weight: 0.6,
      },
      {
        name: 'Jeu de tournevis 6 pièces',
        slug: 'jeu-tournevis-6-pieces',
        description: 'Set complet de tournevis plat et cruciforme avec manches ergonomiques antidérapants.',
        price: 19.99,
        salePrice: 14.99,
        sku: 'OUT-002',
        stock: 78,
        categoryId: categories[0].id,
        featured: true,
        brand: 'Wera',
      },
      {
        name: 'Pince coupante diagonale 180mm',
        slug: 'pince-coupante-diagonale-180mm',
        description: 'Pince coupante de précision pour câbles électriques et fils de fer.',
        price: 15.99,
        sku: 'OUT-003',
        stock: 120,
        categoryId: categories[0].id,
        brand: 'Knipex',
      },
      {
        name: 'Clé à molette 250mm',
        slug: 'cle-a-molette-250mm',
        description: 'Clé ajustable professionnelle avec mâchoires trempées.',
        price: 24.99,
        sku: 'OUT-004',
        stock: 56,
        categoryId: categories[0].id,
        brand: 'Bahco',
      },
      {
        name: 'Niveau à bulle 60cm',
        slug: 'niveau-a-bulle-60cm',
        description: 'Niveau de précision avec 3 fioles et profil aluminium renforcé.',
        price: 18.99,
        sku: 'OUT-005',
        stock: 34,
        categoryId: categories[0].id,
        brand: 'Stanley',
      },
      // Outillage électrique
      {
        name: 'Perceuse-visseuse sans fil 18V',
        slug: 'perceuse-visseuse-sans-fil-18v',
        description: 'Perceuse-visseuse professionnelle avec batterie lithium 2Ah et chargeur rapide. Couple de 50Nm.',
        price: 149.99,
        salePrice: 129.99,
        sku: 'ELEC-001',
        stock: 15,
        categoryId: categories[1].id,
        featured: true,
        brand: 'Makita',
        weight: 1.8,
      },
      {
        name: 'Meuleuse d\'angle 125mm 720W',
        slug: 'meuleuse-angle-125mm-720w',
        description: 'Meuleuse professionnelle avec démarrage progressif et poignée anti-vibrations.',
        price: 89.99,
        sku: 'ELEC-002',
        stock: 22,
        categoryId: categories[1].id,
        brand: 'Bosch',
        weight: 2.1,
      },
      {
        name: 'Ponceuse excentrique 125mm',
        slug: 'ponceuse-excentrique-125mm',
        description: 'Ponceuse avec système d\'aspiration des poussières et 6 vitesses variables.',
        price: 79.99,
        sku: 'ELEC-003',
        stock: 18,
        categoryId: categories[1].id,
        brand: 'Makita',
      },
      {
        name: 'Scie circulaire 185mm 1400W',
        slug: 'scie-circulaire-185mm-1400w',
        description: 'Scie circulaire avec guide parallèle et réglage de profondeur et d\'inclinaison.',
        price: 129.99,
        sku: 'ELEC-004',
        stock: 12,
        categoryId: categories[1].id,
        brand: 'Bosch',
      },
      // Visserie
      {
        name: 'Kit visserie 1000 pièces',
        slug: 'kit-visserie-1000-pieces',
        description: 'Coffret complet de vis à bois et métaux avec organisateur.',
        price: 34.99,
        sku: 'VIS-001',
        stock: 89,
        categoryId: categories[2].id,
        featured: true,
        brand: 'Spax',
      },
      {
        name: 'Boulons HM M8 x 50 (50 pcs)',
        slug: 'boulons-hm-m8x50-50pcs',
        description: 'Boulons tête hexagonale en acier zingué, grade 8.8.',
        price: 18.99,
        sku: 'VIS-002',
        stock: 156,
        categoryId: categories[2].id,
        brand: 'Würth',
      },
      {
        name: 'Chevilles universelles M6-M10 (100 pcs)',
        slug: 'chevilles-universelles-m6-m10-100pcs',
        description: 'Chevilles expansives pour béton, brique et parpaing.',
        price: 12.99,
        sku: 'VIS-003',
        stock: 200,
        categoryId: categories[2].id,
      },
      // Quincaillerie portes
      {
        name: 'Poignée de porte contemporaine',
        slug: 'poignee-porte-contemporaine',
        description: 'Poignée en acier inoxydable brossé avec rosaces carrées. Livrée avec visserie.',
        price: 29.99,
        sku: 'PORT-001',
        stock: 67,
        categoryId: categories[3].id,
        featured: true,
        brand: 'Hoppe',
      },
      {
        name: 'Serrure à mortaiser 3 points',
        slug: 'serrure-mortaiser-3-points',
        description: 'Serrure de sécurité avec 3 points de verrouillage et cylindre européen.',
        price: 79.99,
        sku: 'PORT-002',
        stock: 23,
        categoryId: categories[3].id,
        brand: 'Vachette',
      },
      {
        name: 'Charnières piano 100cm',
        slug: 'charnieres-piano-100cm',
        description: 'Charnière continue en acier zingué pour portes et trappes.',
        price: 24.99,
        sku: 'PORT-003',
        stock: 45,
        categoryId: categories[3].id,
      },
      // Plomberie
      {
        name: 'Robinet mitigeur cuisine',
        slug: 'robinet-mitigeur-cuisine',
        description: 'Mitigeur haut de gamme avec douchette extractible et finition chromée.',
        price: 149.99,
        salePrice: 119.99,
        sku: 'PLO-001',
        stock: 18,
        categoryId: categories[4].id,
        featured: true,
        brand: 'Grohe',
      },
      {
        name: 'Tuyau PVC évacuation 40mm (2m)',
        slug: 'tuyau-pvc-evacuation-40mm-2m',
        description: 'Tuyau PVC pour évacuation eaux usées, résistant et durable.',
        price: 8.99,
        sku: 'PLO-002',
        stock: 150,
        categoryId: categories[4].id,
      },
      {
        name: 'Joint flex 1/2 pouce (5 pcs)',
        slug: 'joint-flex-1-2-pouce-5pcs',
        description: 'Joints fibre pour raccords hydrauliques.',
        price: 3.99,
        sku: 'PLO-003',
        stock: 300,
        categoryId: categories[4].id,
      },
      // Électricité
      {
        name: 'Prise de courant 2P+T avec terre',
        slug: 'prise-courant-2p-t-terre',
        description: 'Prise murale avec obturateurs de sécurité, norme NF.',
        price: 4.99,
        sku: 'ELEC-005',
        stock: 250,
        categoryId: categories[5].id,
        brand: 'Legrand',
      },
      {
        name: 'Interrupteur va-et-vient',
        slug: 'interrupteur-va-et-vient',
        description: 'Interrupteur double pour montage va-et-vient.',
        price: 7.99,
        sku: 'ELEC-006',
        stock: 180,
        categoryId: categories[5].id,
        brand: 'Legrand',
      },
      {
        name: 'Câble électrique 2.5mm² (100m)',
        slug: 'cable-electrique-2-5mm-100m',
        description: 'Câble rigide pour installations électriques domestiques.',
        price: 59.99,
        sku: 'ELEC-007',
        stock: 35,
        categoryId: categories[5].id,
        brand: 'Nexans',
      },
      // Peinture
      {
        name: 'Peinture acrylique blanche 10L',
        slug: 'peinture-acrylique-blanche-10l',
        description: 'Peinture intérieure haute couvrance, lessivable. Rendement 12m²/L.',
        price: 49.99,
        salePrice: 39.99,
        sku: 'PEIN-001',
        stock: 42,
        categoryId: categories[6].id,
        featured: true,
        brand: 'Dulux Valentine',
      },
      {
        name: 'Rouleau à peinture 25cm',
        slug: 'rouleau-peinture-25cm',
        description: 'Rouleau en microfibre pour finitions lisses.',
        price: 8.99,
        sku: 'PEIN-002',
        stock: 120,
        categoryId: categories[6].id,
      },
      {
        name: 'Pinceau set 5 pièces',
        slug: 'pinceau-set-5-pieces',
        description: 'Set de pinceaux en soie de porc de différentes tailles.',
        price: 12.99,
        sku: 'PEIN-003',
        stock: 85,
        categoryId: categories[6].id,
      },
      // Jardin
      {
        name: 'Sécateur à lames franches',
        slug: 'secateur-lames-franches',
        description: 'Sécateur professionnel avec lame en acier trempé et ressort de rappel.',
        price: 24.99,
        sku: 'JAR-001',
        stock: 67,
        categoryId: categories[7].id,
        brand: 'Fiskars',
      },
      {
        name: 'Tuyau arrosage 20m',
        slug: 'tuyau-arrosage-20m',
        description: 'Tuyau flexible 3 couches avec raccords rapides inclus.',
        price: 29.99,
        sku: 'JAR-002',
        stock: 34,
        categoryId: categories[7].id,
      },
      {
        name: 'Pelle ronde manche fibres',
        slug: 'pelle-ronde-manche-fibres',
        description: 'Pelle robuste avec manche en fibre de verre antidérapant.',
        price: 34.99,
        sku: 'JAR-003',
        stock: 28,
        categoryId: categories[7].id,
      },
    ];

    let createdCount = 0;
    for (const productData of productsData) {
      const existing = await db.product.findUnique({
        where: { sku: productData.sku },
      });
      
      if (!existing) {
        await db.product.create({ data: productData });
        createdCount++;
      }
    }

    return NextResponse.json({
      message: 'Base de données initialisée avec succès',
      admin: {
        email: 'admin@oluwatobi-ci.com',
        password: 'Oluwatobi@@',
      },
      categories: categories.length,
      productsCreated: createdCount,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'initialisation' }, { status: 500 });
  }
}
