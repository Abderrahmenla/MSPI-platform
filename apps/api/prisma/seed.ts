import { PrismaClient, AdminRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const products = [
  {
    sku: 'EXT-CO2-2KG',
    slug: 'extincteur-co2-2kg',
    nameAr: 'طفاية حريق ثاني أكسيد الكربون 2 كغ',
    nameFr: 'Extincteur CO2 2 kg',
    nameEn: 'CO2 Fire Extinguisher 2 kg',
    descAr:
      'طفاية حريق ثاني أكسيد الكربون مثالية للحرائق الكهربائية والمعدات الإلكترونية.',
    descFr:
      'Extincteur CO2 idéal pour les feux électriques et les équipements électroniques.',
    descEn:
      'CO2 fire extinguisher ideal for electrical fires and electronic equipment.',
    category: 'extincteurs',
    price: 89.9,
    stock: 50,
    threshold: 5,
  },
  {
    sku: 'EXT-CO2-5KG',
    slug: 'extincteur-co2-5kg',
    nameAr: 'طفاية حريق ثاني أكسيد الكربون 5 كغ',
    nameFr: 'Extincteur CO2 5 kg',
    nameEn: 'CO2 Fire Extinguisher 5 kg',
    descAr: 'طفاية حريق ثاني أكسيد الكربون 5 كغ للاستخدام الصناعي.',
    descFr:
      "Extincteur CO2 5 kg pour usage industriel et bureaux d'entreprise.",
    descEn: 'CO2 fire extinguisher 5 kg for industrial and enterprise use.',
    category: 'extincteurs',
    price: 149.9,
    stock: 30,
    threshold: 5,
  },
  {
    sku: 'EXT-ABC-6KG',
    slug: 'extincteur-poudre-abc-6kg',
    nameAr: 'طفاية حريق مسحوق ABC 6 كغ',
    nameFr: 'Extincteur poudre ABC 6 kg',
    nameEn: 'ABC Dry Powder Fire Extinguisher 6 kg',
    descAr: 'طفاية حريق مسحوق ABC تغطي حرائق الفئات A وB وC.',
    descFr: 'Extincteur poudre ABC couvrant les feux de classe A, B et C.',
    descEn: 'ABC powder extinguisher covering class A, B and C fires.',
    category: 'extincteurs',
    price: 69.9,
    stock: 80,
    threshold: 10,
  },
  {
    sku: 'DET-ION-230V',
    slug: 'detecteur-fumee-ionique-230v',
    nameAr: 'كاشف دخان أيوني 230 فولت',
    nameFr: 'Détecteur de fumée ionique 230V',
    nameEn: 'Ionic Smoke Detector 230V',
    descAr: 'كاشف دخان أيوني متوافق مع الشبكة الكهربائية 230 فولت.',
    descFr:
      'Détecteur de fumée ionique alimenté secteur 230V avec alarme sonore.',
    descEn: 'Mains-powered ionic smoke detector 230V with audible alarm.',
    category: 'detection',
    price: 34.9,
    stock: 120,
    threshold: 15,
  },
  {
    sku: 'DET-OPT-BATT',
    slug: 'detecteur-fumee-optique-batterie',
    nameAr: 'كاشف دخان بصري بطارية',
    nameFr: 'Détecteur de fumée optique à pile',
    nameEn: 'Optical Smoke Detector Battery',
    descAr: 'كاشف دخان بصري يعمل بالبطارية، سهل التركيب.',
    descFr:
      'Détecteur de fumée optique à pile, facile à installer, conforme NF.',
    descEn:
      'Battery-operated optical smoke detector, easy to install, NF compliant.',
    category: 'detection',
    price: 19.9,
    stock: 200,
    threshold: 20,
  },
  {
    sku: 'RIA-DN25-30M',
    slug: 'robinet-incendie-arme-dn25-30m',
    nameAr: 'حنفية حريق مسلحة DN25 30م',
    nameFr: 'Robinet incendie armé DN25 30 m',
    nameEn: 'Fire Hose Reel DN25 30 m',
    descAr: 'حنفية حريق مسلحة بخرطوم 30 متر وفوهة نحاسية.',
    descFr:
      'Robinet incendie armé avec tuyau semi-rigide 30 m et lance laiton.',
    descEn: 'Fire hose reel with 30 m semi-rigid hose and brass nozzle.',
    category: 'robinets-incendie',
    price: 299.0,
    stock: 20,
    threshold: 3,
  },
  {
    sku: 'COFF-RI-VITRE',
    slug: 'coffret-robinet-incendie-vitree',
    nameAr: 'خزانة حريق زجاجية',
    nameFr: 'Coffret RIA vitré',
    nameEn: 'Glass-Fronted Fire Hose Cabinet',
    descAr: 'خزانة حريق ذات واجهة زجاجية لتركيب حنفية الحريق المسلحة.',
    descFr:
      'Coffret en acier avec vitre pour installation du robinet incendie armé.',
    descEn: 'Steel cabinet with glass front for fire hose reel installation.',
    category: 'robinets-incendie',
    price: 189.0,
    stock: 15,
    threshold: 3,
  },
  {
    sku: 'SIG-ISSUE-A3',
    slug: 'panneau-issue-de-secours-a3',
    nameAr: 'لافتة مخرج الطوارئ A3',
    nameFr: 'Panneau issue de secours A3',
    nameEn: 'Emergency Exit Sign A3',
    descAr: 'لافتة مخرج الطوارئ بإضاءة ليلية مقاس A3.',
    descFr:
      'Panneau photoluminescent issue de secours format A3, norme ISO 7010.',
    descEn: 'Photoluminescent emergency exit sign A3, ISO 7010 compliant.',
    category: 'signalisation',
    price: 12.5,
    stock: 300,
    threshold: 30,
  },
  {
    sku: 'BLO-PORTE-300N',
    slug: 'bloqueur-porte-coupe-feu-300n',
    nameAr: 'إغلاق باب مقاوم للحريق 300 نيوتن',
    nameFr: 'Ferme-porte coupe-feu 300 N',
    nameEn: 'Fire Door Closer 300 N',
    descAr: 'جهاز إغلاق باب مقاوم للحريق بقوة 300 نيوتن.',
    descFr: 'Ferme-porte pour porte coupe-feu, force 300 N, conforme EN 1154.',
    descEn: 'Fire door closer 300 N, EN 1154 compliant.',
    category: 'portes-coupe-feu',
    price: 45.0,
    stock: 60,
    threshold: 8,
  },
  {
    sku: 'EXT-EAU-9L',
    slug: 'extincteur-eau-pulverisee-9l',
    nameAr: 'طفاية حريق ماء مضبب 9 لتر',
    nameFr: 'Extincteur eau pulvérisée 9 L',
    nameEn: 'Water Mist Fire Extinguisher 9 L',
    descAr: 'طفاية حريق ماء مضبب 9 لتر لحرائق الفئة A.',
    descFr: 'Extincteur eau pulvérisée 9 L pour feux de classe A.',
    descEn: 'Water mist fire extinguisher 9 L for class A fires.',
    category: 'extincteurs',
    price: 59.9,
    stock: 40,
    threshold: 5,
  },
];

async function main() {
  // ─── Admin ────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin123!', 12);

  await prisma.admin.upsert({
    where: { email: 'admin@mspi.tn' },
    update: {},
    create: {
      email: 'admin@mspi.tn',
      passwordHash,
      name: 'Super Admin',
      role: AdminRole.SUPER_ADMIN,
      active: true,
    },
  });

  // ─── Products ─────────────────────────────────────────
  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  console.log(
    `Seed complete: super_admin + ${products.length} products created`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
