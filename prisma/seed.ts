import { PrismaClient, Role, OrderStatus, ReservationStatus, PaymentStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Categories ──────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "homme" },
      update: {},
      create: { name: "Homme", slug: "homme", description: "Montres pour homme", imageUrl: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&q=80", sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: "femme" },
      update: {},
      create: { name: "Femme", slug: "femme", description: "Montres pour femme", imageUrl: "https://images.unsplash.com/photo-1612902456551-b6a23b7c6de1?w=500&q=80", sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: "sport" },
      update: {},
      create: { name: "Sport", slug: "sport", description: "Montres sportives", imageUrl: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500&q=80", sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: "luxe" },
      update: {},
      create: { name: "Luxe", slug: "luxe", description: "Collection haute horlogerie", imageUrl: "https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=500&q=80", sortOrder: 4 },
    }),
  ]);

  const [homme, femme, sport, luxe] = categories;
  console.log("✅ Categories seeded");

  // ─── Admin User ───────────────────────────────────────────────────────────
  const adminEmail = process.env["ADMIN_EMAIL"] ?? "admin@chronocraft.com";
  const adminPassword = process.env["ADMIN_PASSWORD"] ?? "Admin@123456";
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      role: Role.ADMIN,
      emailVerified: true,
      profile: {
        create: { firstName: "Admin", lastName: "ChronoCraft", phone: "+212 600 000 001" },
      },
    },
  });
  console.log(`✅ Admin user: ${adminEmail}`);

  // ─── Demo Customer ────────────────────────────────────────────────────────
  const customerHash = await bcrypt.hash("Demo@1234567", 12);
  const customer = await prisma.user.upsert({
    where: { email: "demo@client.com" },
    update: {},
    create: {
      email: "demo@client.com",
      passwordHash: customerHash,
      role: Role.CUSTOMER,
      emailVerified: true,
      profile: {
        create: { firstName: "Youssef", lastName: "Benali", phone: "+212 612 345 678" },
      },
      addresses: {
        create: {
          label: "Domicile",
          firstName: "Youssef",
          lastName: "Benali",
          phone: "+212 612 345 678",
          street: "12 Rue des Orangers",
          city: "Casablanca",
          postalCode: "20000",
          country: "Morocco",
          isDefault: true,
        },
      },
    },
  });
  console.log(`✅ Demo customer: demo@client.com / Demo@1234567`);

  // ─── Products ─────────────────────────────────────────────────────────────
  const productsData = [
    {
      name: "Royal Chronograph Gold",
      slug: "royal-chronograph-gold",
      description: "Un chronographe doré au design intemporel. Boîtier en acier inoxydable plaqué or, verre saphir anti-rayures. Mouvement automatique suisse. Étanche 50m.",
      price: 699,
      comparePrice: 799,
      sku: "RCG-001",
      stock: 12,
      brand: "Royal",
      movement: "Automatique",
      caseSize: "42mm",
      caseMaterial: "Acier Inoxydable",
      waterResist: "50m",
      strapMaterial: "Cuir véritable",
      badge: "sale",
      isFeatured: true,
      categoryId: homme!.id,
      images: [
        "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80",
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
      ],
    },
    {
      name: "Aventurier Noir Titane",
      slug: "aventurier-noir-titane",
      description: "Montre masculine en titane noir avec un design audacieux et moderne. Lunette en céramique et cadran texturé.",
      price: 749,
      comparePrice: null,
      sku: "ANT-002",
      stock: 8,
      brand: "Aventurier",
      movement: "Automatique",
      caseSize: "44mm",
      caseMaterial: "Titane",
      waterResist: "100m",
      strapMaterial: "Titane",
      badge: "new",
      isFeatured: true,
      categoryId: homme!.id,
      images: [
        "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80",
        "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80",
      ],
    },
    {
      name: "Prestige Tourbillon",
      slug: "prestige-tourbillon",
      description: "Montre tourbillon avec complication horlogère visible. Cadran squelette en or rose, boîtier saphir et mouvement manufacture 72h de réserve de marche.",
      price: 799,
      comparePrice: null,
      sku: "PT-003",
      stock: 3,
      brand: "Prestige",
      movement: "Tourbillon Manuel",
      caseSize: "43mm",
      caseMaterial: "Or Rose 18K",
      waterResist: "30m",
      strapMaterial: "Cuir d'alligator",
      badge: "hot",
      isFeatured: true,
      categoryId: luxe!.id,
      images: [
        "https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=800&q=80",
        "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=800&q=80",
      ],
    },
    {
      name: "Élégance Rose Diamant",
      slug: "elegance-rose-diamant",
      description: "Montre dame ornée de diamants véritables sur le cadran et le boîtier. Bracelet en acier inoxydable rosé et verre saphir bombé.",
      price: 649,
      comparePrice: 799,
      sku: "ERD-004",
      stock: 6,
      brand: "Élégance",
      movement: "Quartz Suisse",
      caseSize: "34mm",
      caseMaterial: "Acier Rosé",
      waterResist: "30m",
      strapMaterial: "Acier Rosé",
      badge: "hot",
      isFeatured: true,
      categoryId: femme!.id,
      images: [
        "https://images.unsplash.com/photo-1612902456551-b6a23b7c6de1?w=800&q=80",
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80",
      ],
    },
    {
      name: "Navigator GMT Bleu",
      slug: "navigator-gmt-bleu",
      description: "Montre GMT avec double fuseau horaire et lunette bidirectionnelle bleue et noire. Idéale pour les voyageurs fréquents.",
      price: 599,
      comparePrice: 749,
      sku: "NGB-005",
      stock: 9,
      brand: "Navigator",
      movement: "Automatique",
      caseSize: "42mm",
      caseMaterial: "Acier Inoxydable 904L",
      waterResist: "100m",
      strapMaterial: "Acier Jubilé",
      badge: "sale",
      isFeatured: false,
      categoryId: sport!.id,
      images: [
        "https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=800&q=80",
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
      ],
    },
    {
      name: "Monaco Carbon Racing",
      slug: "monaco-carbon-racing",
      description: "Chronographe inspiré de l'univers de la course automobile. Boîtier carré en fibre de carbone, cadran tachymétrique.",
      price: 699,
      comparePrice: null,
      sku: "MCR-006",
      stock: 5,
      brand: "Monaco",
      movement: "Automatique",
      caseSize: "39mm carré",
      caseMaterial: "Fibre de Carbone",
      waterResist: "100m",
      strapMaterial: "Cuir perforé",
      badge: null,
      isFeatured: false,
      categoryId: sport!.id,
      images: [
        "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&q=80",
        "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80",
      ],
    },
    {
      name: "Perle Dorée Femme",
      slug: "perle-doree-femme",
      description: "Montre féminine avec cadran nacré et bracelet en acier doré. Chiffres romains délicats et aiguilles dorées ultra-fines.",
      price: 449,
      comparePrice: 599,
      sku: "PDF-007",
      stock: 14,
      brand: "Perle",
      movement: "Quartz",
      caseSize: "32mm",
      caseMaterial: "Acier Doré",
      waterResist: "30m",
      strapMaterial: "Cuir de veau",
      badge: "sale",
      isFeatured: false,
      categoryId: femme!.id,
      images: [
        "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80",
        "https://images.unsplash.com/photo-1612902456551-b6a23b7c6de1?w=800&q=80",
      ],
    },
    {
      name: "Commandant Militaire",
      slug: "commandant-militaire",
      description: "Montre militaire robuste avec cadran vert olive et bracelet NATO. Résistante aux conditions extrêmes avec éclairage tritium.",
      price: 499,
      comparePrice: 649,
      sku: "CM-008",
      stock: 18,
      brand: "Commandant",
      movement: "Quartz Suisse",
      caseSize: "44mm",
      caseMaterial: "Acier PVD",
      waterResist: "200m",
      strapMaterial: "NATO tissu",
      badge: "sale",
      isFeatured: false,
      categoryId: sport!.id,
      images: [
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
        "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80",
      ],
    },
    {
      name: "Executive Platine",
      slug: "executive-platine",
      description: "Le summum du luxe masculin. Cadran guilloché, aiguilles en or blanc et mouvement manufacture. Une pièce d'exception.",
      price: 759,
      comparePrice: null,
      sku: "EP-009",
      stock: 2,
      brand: "Executive",
      movement: "Manufacture",
      caseSize: "41mm",
      caseMaterial: "Or Blanc 18K",
      waterResist: "50m",
      strapMaterial: "Alligator",
      badge: null,
      isFeatured: true,
      categoryId: luxe!.id,
      images: [
        "https://images.unsplash.com/photo-1526045431048-f857369baa09?w=800&q=80",
        "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80",
      ],
    },
    {
      name: "Capitaine Marine",
      slug: "capitaine-marine",
      description: "Montre nautique avec lunette compas et cadran bleu océan. Étanche 200m, parfaite pour la navigation et les sports nautiques.",
      price: 549,
      comparePrice: 699,
      sku: "CM2-010",
      stock: 11,
      brand: "Capitaine",
      movement: "Automatique",
      caseSize: "43mm",
      caseMaterial: "Acier Inoxydable 316L",
      waterResist: "200m",
      strapMaterial: "Caoutchouc marin",
      badge: "sale",
      isFeatured: false,
      categoryId: sport!.id,
      images: [
        "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80",
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
      ],
    },
    {
      name: "Sultan Or Arabe",
      slug: "sultan-or-arabe",
      description: "Montre de luxe avec cadran en chiffres arabes orientaux dorés. Boîtier en or 18K avec gravures traditionnelles marocaines. Pièce collector.",
      price: 779,
      comparePrice: 799,
      sku: "SOA-011",
      stock: 4,
      brand: "Sultan",
      movement: "Manufacture",
      caseSize: "40mm",
      caseMaterial: "Or Jaune 18K",
      waterResist: "30m",
      strapMaterial: "Cuir d'autruche",
      badge: "hot",
      isFeatured: true,
      categoryId: luxe!.id,
      images: [
        "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=800&q=80",
        "https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=800&q=80",
      ],
    },
    {
      name: "Gentleman Cuir Noir",
      slug: "gentleman-cuir-noir",
      description: "Montre dress watch élégante avec cadran noir minimaliste et aiguilles dauphine. Le compagnon parfait du costume trois pièces.",
      price: 349,
      comparePrice: null,
      sku: "GCN-012",
      stock: 20,
      brand: "Gentleman",
      movement: "Quartz",
      caseSize: "40mm",
      caseMaterial: "Acier Inoxydable",
      waterResist: "30m",
      strapMaterial: "Cuir de veau noir",
      badge: null,
      isFeatured: false,
      categoryId: homme!.id,
      images: [
        "https://images.unsplash.com/photo-1619134778706-7015533a6150?w=800&q=80",
        "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
      ],
    },
  ];

  const products: Array<{ id: string }> = [];
  for (const p of productsData) {
    const { images, ...productData } = p;
    const created = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {
        price: productData.price,
        comparePrice: productData.comparePrice ?? null,
      },
      create: {
        ...productData,
        price: productData.price,
        comparePrice: productData.comparePrice ?? undefined,
        images: {
          create: images.map((url, i) => ({
            url,
            alt: productData.name,
            sortOrder: i,
            isPrimary: i === 0,
          })),
        },
      },
    });
    products.push(created);
  }
  console.log(`✅ ${products.length} products seeded`);

  // ─── Demo Order ───────────────────────────────────────────────────────────
  const customerAddr = await prisma.address.findFirst({
    where: { userId: customer.id },
  });

  const firstProduct = products[0];
  const thirdProduct = products[2];

  if (firstProduct && thirdProduct && customerAddr) {
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber: "ORD-2024-0001" },
    });

    if (!existingOrder) {
      const order = await prisma.order.create({
        data: {
          orderNumber: "ORD-2024-0001",
          userId: customer.id,
          addressId: customerAddr.id,
          status: OrderStatus.DELIVERED,
          subtotal: 2499,
          shippingCost: 0,
          discount: 0,
          total: 2499,
          deliveredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          items: {
            create: {
              productId: firstProduct.id,
              productName: "Royal Chronograph Gold",
              productSlug: "royal-chronograph-gold",
              imageUrl: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80",
              quantity: 1,
              unitPrice: 2499,
              total: 2499,
            },
          },
          payment: {
            create: {
              userId: customer.id,
              amount: 2499,
              currency: "MAD",
              method: PaymentMethod.CARD,
              status: PaymentStatus.DEPOSIT_PAID,
              paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            },
          },
        },
      });

      await prisma.customerProfile.update({
        where: { userId: customer.id },
        data: { totalSpent: 2499, orderCount: 1 },
      });

      console.log(`✅ Demo order: ${order.orderNumber}`);
    }

    // Demo pending reservation
    const existingReservation = await prisma.reservation.findFirst({
      where: { userId: customer.id, productId: thirdProduct.id },
    });

    if (!existingReservation) {
      await prisma.reservation.create({
        data: {
          userId: customer.id,
          productId: thirdProduct.id,
          status: ReservationStatus.PENDING,
          notes: "Je souhaite réserver cette pièce pour l'examiner en boutique.",
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });
      console.log("✅ Demo reservation seeded");
    }
  }

  // ─── Welcome Notification ─────────────────────────────────────────────────
  const existingNotif = await prisma.notification.findFirst({
    where: { userId: customer.id },
  });
  if (!existingNotif) {
    await prisma.notification.create({
      data: {
        userId: customer.id,
        type: "SYSTEM",
        title: "Bienvenue chez ChronoCraft",
        message: "Votre compte a été créé avec succès. Découvrez notre collection de montres de luxe.",
      },
    });
  }

  console.log("\n🎉 Database seeded successfully!");
  console.log("─────────────────────────────────────────");
  console.log(`  Admin:    ${adminEmail} / ${adminPassword}`);
  console.log("  Customer: demo@client.com / Demo@1234567");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
