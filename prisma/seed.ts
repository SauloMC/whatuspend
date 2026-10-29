// prisma/seed.ts
import { PrismaClient, CategoryType, PaymentMethod, RecurrenceFrequency, GoalStatus, PlanType } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { nombre: 'Alimentación & Supermercado', tipo: CategoryType.EXPENSE, color: '#EF4444', icono: 'shopping-cart' },
  { nombre: 'Restaurantes & Cafeterías', tipo: CategoryType.EXPENSE, color: '#F97316', icono: 'utensils' },
  { nombre: 'Transporte & Gasolina', tipo: CategoryType.EXPENSE, color: '#F59E0B', icono: 'car' },
  { nombre: 'Vivienda & Servicios', tipo: CategoryType.EXPENSE, color: '#10B981', icono: 'home' },
  { nombre: 'Suscripciones & Streaming', tipo: CategoryType.EXPENSE, color: '#6366F1', icono: 'tv' },
  { nombre: 'Salud & Bienestar', tipo: CategoryType.EXPENSE, color: '#EC4899', icono: 'heart-pulse' },
  { nombre: 'Educación & Cursos', tipo: CategoryType.EXPENSE, color: '#3B82F6', icono: 'book-open' },
  { nombre: 'Entretenimiento & Ocio', tipo: CategoryType.EXPENSE, color: '#8B5CF6', icono: 'gamepad-2' },
  { nombre: 'Salario & Ingresos Activos', tipo: CategoryType.INCOME, color: '#10B981', icono: 'banknote' },
  { nombre: 'Inversiones & Dividendos', tipo: CategoryType.INCOME, color: '#06B6D4', icono: 'trending-up' },
];

async function main() {
  console.log('🌱 Starting database seeding for WhatUSpend...');

  // 1. Seed System Default Categories
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.categoria.upsert({
      where: {
        id: '00000000-0000-0000-0000-000000000000', // Dummy to trigger create or check existence
      },
      update: {},
      create: {
        nombre: cat.nombre,
        tipo: cat.tipo,
        color: cat.color,
        icono: cat.icono,
        esSistema: true,
      },
    }).catch(async () => {
      // If dummy ID fails, check by name and system flag
      const existing = await prisma.categoria.findFirst({
        where: { nombre: cat.nombre, esSistema: true },
      });
      if (!existing) {
        await prisma.categoria.create({
          data: {
            nombre: cat.nombre,
            tipo: cat.tipo,
            color: cat.color,
            icono: cat.icono,
            esSistema: true,
          },
        });
      }
    });
  }
  console.log('✅ Default system categories seeded.');

  // 2. Seed Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@whatuspend.com' },
    update: {},
    create: {
      supabaseAuthId: 'demo-supabase-uuid-123456',
      nombre: 'Carlos Mendoza',
      email: 'demo@whatuspend.com',
      plan: PlanType.PRO_PERSONAL,
      idioma: 'es',
      moneda: 'MXN',
    },
  });
  console.log(`✅ Demo user created: ${demoUser.email} (ID: ${demoUser.id})`);

  // Fetch food category
  const foodCategory = await prisma.categoria.findFirst({
    where: { nombre: 'Restaurantes & Cafeterías', esSistema: true },
  });

  const subsCategory = await prisma.categoria.findFirst({
    where: { nombre: 'Suscripciones & Streaming', esSistema: true },
  });

  // 3. Seed Subscriptions
  const netflixSub = await prisma.suscripcion.create({
    data: {
      usuarioId: demoUser.id,
      categoriaId: subsCategory?.id,
      proveedor: 'Netflix 4K',
      monto: 219.00,
      moneda: 'MXN',
      frecuencia: RecurrenceFrequency.MONTHLY,
      proximaFecha: new Date('2026-11-15'),
      activa: true,
      esDetectadaAuto: false,
    },
  });

  const spotifySub = await prisma.suscripcion.create({
    data: {
      usuarioId: demoUser.id,
      categoriaId: subsCategory?.id,
      proveedor: 'Spotify Duo',
      monto: 169.00,
      moneda: 'MXN',
      frecuencia: RecurrenceFrequency.MONTHLY,
      proximaFecha: new Date('2026-11-20'),
      activa: true,
      esDetectadaAuto: true,
    },
  });
  console.log('✅ Seeded demo subscriptions: Netflix & Spotify.');

  // 4. Seed Personal Expenses
  const now = new Date();
  const expensesToSeed = [
    { desc: 'Almuerzo ejecutivo en bistró', monto: 350.00, catId: foodCategory?.id, method: PaymentMethod.CREDIT_CARD, daysAgo: 1 },
    { desc: 'Café Starbucks matutino', monto: 95.00, catId: foodCategory?.id, method: PaymentMethod.DEBIT_CARD, daysAgo: 2 },
    { desc: 'Cena con amigos Taquería', monto: 480.00, catId: foodCategory?.id, method: PaymentMethod.CASH, daysAgo: 3 },
    { desc: 'Supermercado quincenal', monto: 2450.00, catId: null, method: PaymentMethod.CREDIT_CARD, daysAgo: 4 },
    { desc: 'Recarga gasolina Magna', monto: 900.00, catId: null, method: PaymentMethod.CREDIT_CARD, daysAgo: 5 },
  ];

  for (const exp of expensesToSeed) {
    const expDate = new Date(now);
    expDate.setDate(now.getDate() - exp.daysAgo);

    await prisma.gastoPersonal.create({
      data: {
        usuarioId: demoUser.id,
        categoriaId: exp.catId,
        monto: exp.monto,
        moneda: 'MXN',
        descripcion: exp.desc,
        fecha: expDate,
        metodoPago: exp.method,
        esRecurrente: false,
      },
    });
  }
  console.log('✅ Seeded 5 realistic demo personal expenses.');

  // 5. Seed Financial Goal
  await prisma.metaFinanciera.create({
    data: {
      usuarioId: demoUser.id,
      nombre: 'Fondo de Emergencia (6 meses)',
      montoObjetivo: 60000.00,
      montoActual: 24500.00,
      moneda: 'MXN',
      fechaMeta: new Date('2027-04-30'),
      icono: 'shield-check',
      color: '#10B981',
      estado: GoalStatus.IN_PROGRESS,
    },
  });
  console.log('✅ Seeded financial goal.');

  // 6. Seed Money Leak Radar Alert
  await prisma.alertaFuga.create({
    data: {
      usuarioId: demoUser.id,
      categoriaId: foodCategory?.id,
      titulo: 'Gasto elevado en Restaurantes & Cafeterías',
      mensaje: 'Has gastado un 38% más en comidas fuera de casa este mes comparado con el promedio de los últimos 60 días ($1,420 MXN adicionales).',
      severidad: 'WARNING',
      montoImpacto: 1420.00,
      leida: false,
    },
  });
  console.log('✅ Seeded Money Leak Radar alert.');

  // 7. Seed Demo Companies (B2B)
  const apexCompany = await prisma.empresa.create({
    data: {
      usuarioId: demoUser.id,
      nombre: 'Apex Technologies S.A.S.',
      rfcTaxId: 'ATE210315AB1',
      giro: 'Desarrollo de Software & Cloud',
      monedaBase: 'MXN',
    },
  });

  const techCat = await prisma.categoria.findFirst({
    where: { nombre: { contains: 'Tecnología' } },
  });

  await prisma.gastoEmpresa.create({
    data: {
      empresaId: apexCompany.id,
      registradoPor: demoUser.id,
      categoriaId: techCat?.id,
      monto: 14500.00,
      moneda: 'MXN',
      descripcion: 'Infraestructura Cloud AWS Producción',
      fecha: new Date(),
      metodoPago: PaymentMethod.BANK_TRANSFER,
      facturaFolio: 'AWS-2026-9812A',
      departamento: 'TI / Operaciones',
      notas: 'Servidores EC2 y Base de Datos PostgreSQL',
    },
  });
  console.log('✅ Seeded demo company & business expenses.');

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

