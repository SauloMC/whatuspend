// src/domain/demo/demo-store.ts
// In-Memory Fallback & Demo Store for WhatUSpend
// Allows immediate testing of all dashboard functionalities (Admin, Pro, Free)

export interface UserPersona {
  id: string;
  nombre: string;
  email: string;
  avatarUrl: string;
  plan: 'FREE' | 'PRO_PERSONAL' | 'PRO_BUSINESS';
  role: 'OWNER' | 'ADMIN' | 'COLLABORATOR' | 'VIEWER';
  moneda: string;
}

export interface DemoExpense {
  id: string;
  usuarioId: string;
  categoriaId?: string;
  categoriaNombre?: string;
  categoriaColor?: string;
  monto: number;
  moneda: string;
  descripcion: string;
  fecha: string;
  metodoPago: 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CRYPTO' | 'OTHER';
  esRecurrente: boolean;
  comprobanteUrl?: string;
  notas?: string;
}

export interface DemoCompany {
  id: string;
  usuarioId: string;
  nombre: string;
  rfcTaxId: string;
  giro: string;
  monedaBase: string;
  logoUrl?: string;
  createdAt: string;
}

export interface DemoCompanyExpense {
  id: string;
  empresaId: string;
  registradoPor: string;
  categoriaId?: string;
  categoriaNombre?: string;
  categoriaColor?: string;
  monto: number;
  moneda: string;
  descripcion: string;
  fecha: string;
  metodoPago: 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CRYPTO' | 'OTHER';
  facturaFolio?: string;
  departamento?: string;
  comprobanteUrl?: string;
  notas?: string;
}

export interface DemoCategory {
  id: string;
  usuarioId?: string;
  empresaId?: string;
  nombre: string;
  tipo: 'EXPENSE' | 'INCOME';
  color: string;
  icono: string;
  esSistema: boolean;
}

export interface DemoSubscription {
  id: string;
  usuarioId: string;
  proveedor: string;
  monto: number;
  moneda: string;
  frecuencia: string;
  proximaFecha: string;
  activa: boolean;
}

export interface DemoGoal {
  id: string;
  usuarioId: string;
  nombre: string;
  montoObjetivo: number;
  montoActual: number;
  moneda: string;
  fechaMeta: string;
  color: string;
}

export interface DemoAlert {
  id: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  severidad: 'INFO' | 'WARNING' | 'CRITICAL';
  montoImpacto: number;
  fecha: string;
}

export const TEST_PERSONAS: Record<'admin' | 'pro' | 'free', UserPersona> = {
  admin: {
    id: 'user-admin-001',
    nombre: 'Alejandro Morales (Admin / Dueño)',
    email: 'admin@whatuspend.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    plan: 'PRO_BUSINESS',
    role: 'OWNER',
    moneda: 'MXN',
  },
  pro: {
    id: 'user-pro-002',
    nombre: 'Sofía Rivas (Usuario Pro)',
    email: 'sofia.pro@whatuspend.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    plan: 'PRO_PERSONAL',
    role: 'COLLABORATOR',
    moneda: 'MXN',
  },
  free: {
    id: 'user-free-003',
    nombre: 'Mateo Gómez (Usuario Gratuito)',
    email: 'mateo.free@whatuspend.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    plan: 'FREE',
    role: 'VIEWER',
    moneda: 'MXN',
  },
};

const INITIAL_CATEGORIES: DemoCategory[] = [
  { id: 'cat-1', nombre: 'Alimentación & Supermercado', tipo: 'EXPENSE', color: '#EF4444', icono: 'shopping-cart', esSistema: true },
  { id: 'cat-2', nombre: 'Restaurantes & Cafeterías', tipo: 'EXPENSE', color: '#F97316', icono: 'utensils', esSistema: true },
  { id: 'cat-3', nombre: 'Transporte & Gasolina', tipo: 'EXPENSE', color: '#F59E0B', icono: 'car', esSistema: true },
  { id: 'cat-4', nombre: 'Vivienda & Servicios', tipo: 'EXPENSE', color: '#10B981', icono: 'home', esSistema: true },
  { id: 'cat-5', nombre: 'Suscripciones & Streaming', tipo: 'EXPENSE', color: '#6366F1', icono: 'tv', esSistema: true },
  { id: 'cat-6', nombre: 'Salud & Farmacia', tipo: 'EXPENSE', color: '#EC4899', icono: 'heart-pulse', esSistema: true },
  { id: 'cat-7', nombre: 'Tecnología & Licencias', tipo: 'EXPENSE', color: '#3B82F6', icono: 'laptop', esSistema: true },
  { id: 'cat-8', nombre: 'Marketing & Publicidad', tipo: 'EXPENSE', color: '#8B5CF6', icono: 'megaphone', esSistema: true },
  { id: 'cat-9', nombre: 'Nómina & Honorarios', tipo: 'EXPENSE', color: '#06B6D4', icono: 'users', esSistema: true },
  { id: 'cat-10', nombre: 'Ingresos & Ventas', tipo: 'INCOME', color: '#10B981', icono: 'trending-up', esSistema: true },
];

const INITIAL_COMPANIES: DemoCompany[] = [
  {
    id: 'comp-apex-01',
    usuarioId: 'user-admin-001',
    nombre: 'Apex Technologies S.A.S.',
    rfcTaxId: 'ATE210315AB1',
    giro: 'Desarrollo de Software & Cloud',
    monedaBase: 'MXN',
    createdAt: '2026-01-15',
  },
  {
    id: 'comp-sierra-02',
    usuarioId: 'user-admin-001',
    nombre: 'Café & Tostaduría La Sierra S.A. de C.V.',
    rfcTaxId: 'CTS190822K92',
    giro: 'Alimentos, Bebidas y Gastronomía',
    monedaBase: 'MXN',
    createdAt: '2026-03-10',
  },
];

const INITIAL_COMPANY_EXPENSES: DemoCompanyExpense[] = [
  {
    id: 'cexp-1',
    empresaId: 'comp-apex-01',
    registradoPor: 'user-admin-001',
    categoriaId: 'cat-7',
    categoriaNombre: 'Tecnología & Licencias',
    categoriaColor: '#3B82F6',
    monto: 14500.0,
    moneda: 'MXN',
    descripcion: 'Infraestructura AWS Cloud (Producción us-east-2)',
    fecha: '2026-10-24',
    metodoPago: 'CREDIT_CARD',
    facturaFolio: 'AWS-2026-9812A',
    departamento: 'TI / Operaciones',
    notas: 'Servidores EC2, Aurora PostgreSQL y almacenamiento S3',
  },
  {
    id: 'cexp-2',
    empresaId: 'comp-apex-01',
    registradoPor: 'user-admin-001',
    categoriaId: 'cat-8',
    categoriaNombre: 'Marketing & Publicidad',
    categoriaColor: '#8B5CF6',
    monto: 8200.0,
    moneda: 'MXN',
    descripcion: 'Campaña Google Ads B2B Q4',
    fecha: '2026-10-21',
    metodoPago: 'CREDIT_CARD',
    facturaFolio: 'SAT-MKT-33019',
    departamento: 'Marketing',
    notas: 'Captación de leads para sector corporativo',
  },
  {
    id: 'cexp-3',
    empresaId: 'comp-apex-01',
    registradoPor: 'user-admin-001',
    categoriaId: 'cat-9',
    categoriaNombre: 'Nómina & Honorarios',
    categoriaColor: '#06B6D4',
    monto: 45000.0,
    moneda: 'MXN',
    descripcion: 'Honorarios Servicios de Consultoría Contable',
    fecha: '2026-10-18',
    metodoPago: 'BANK_TRANSFER',
    facturaFolio: 'HON-4491-DEL',
    departamento: 'Administración',
    notas: 'Dictamen fiscal y auditoría preliminar',
  },
  {
    id: 'cexp-4',
    empresaId: 'comp-sierra-02',
    registradoPor: 'user-admin-001',
    categoriaId: 'cat-1',
    categoriaNombre: 'Alimentación & Supermercado',
    categoriaColor: '#EF4444',
    monto: 18400.0,
    moneda: 'MXN',
    descripcion: 'Lote de Café Verde Arábica Coatepec 200kg',
    fecha: '2026-10-20',
    metodoPago: 'BANK_TRANSFER',
    facturaFolio: 'FAC-LOTE-209',
    departamento: 'Producción & Almacén',
    notas: 'Materia prima directa para tostado de especialidad',
  },
];

const INITIAL_PERSONAL_EXPENSES: DemoExpense[] = [
  {
    id: 'pexp-1',
    usuarioId: 'user-admin-001',
    categoriaId: 'cat-1',
    categoriaNombre: 'Alimentación & Supermercado',
    categoriaColor: '#EF4444',
    monto: 3450.0,
    moneda: 'MXN',
    descripcion: 'Despensa quincenal Costco y frutas frescas',
    fecha: '2026-10-27',
    metodoPago: 'CREDIT_CARD',
    esRecurrente: false,
    notas: 'Compra quincenal para el hogar',
  },
  {
    id: 'pexp-2',
    usuarioId: 'user-admin-001',
    categoriaId: 'cat-3',
    categoriaNombre: 'Transporte & Gasolina',
    categoriaColor: '#F59E0B',
    monto: 980.0,
    moneda: 'MXN',
    descripcion: 'Carga de gasolina Premium Mobil',
    fecha: '2026-10-26',
    metodoPago: 'DEBIT_CARD',
    esRecurrente: false,
  },
  {
    id: 'pexp-3',
    usuarioId: 'user-admin-001',
    categoriaId: 'cat-2',
    categoriaNombre: 'Restaurantes & Cafeterías',
    categoriaColor: '#F97316',
    monto: 850.0,
    moneda: 'MXN',
    descripcion: 'Cena con familia en restaurante italiano',
    fecha: '2026-10-25',
    metodoPago: 'CREDIT_CARD',
    esRecurrente: false,
  },
  {
    id: 'pexp-4',
    usuarioId: 'user-admin-001',
    categoriaId: 'cat-6',
    categoriaNombre: 'Salud & Farmacia',
    categoriaColor: '#EC4899',
    monto: 430.0,
    moneda: 'MXN',
    descripcion: 'Medicamentos recetados y vitaminas',
    fecha: '2026-10-23',
    metodoPago: 'DEBIT_CARD',
    esRecurrente: false,
  },
  {
    id: 'pexp-5',
    usuarioId: 'user-admin-001',
    categoriaId: 'cat-5',
    categoriaNombre: 'Suscripciones & Streaming',
    categoriaColor: '#6366F1',
    monto: 219.0,
    moneda: 'MXN',
    descripcion: 'Mensualidad Netflix 4K Plan Familiar',
    fecha: '2026-10-22',
    metodoPago: 'DEBIT_CARD',
    esRecurrente: true,
  },
  {
    id: 'pexp-6',
    usuarioId: 'user-admin-001',
    categoriaId: 'cat-2',
    categoriaNombre: 'Restaurantes & Cafeterías',
    categoriaColor: '#F97316',
    monto: 110.0,
    moneda: 'MXN',
    descripcion: 'Café latte y croissant matutino',
    fecha: '2026-10-21',
    metodoPago: 'CASH',
    esRecurrente: false,
  },
  // Gastos Sofía (Pro)
  {
    id: 'pexp-sofia-1',
    usuarioId: 'user-pro-002',
    categoriaId: 'cat-1',
    categoriaNombre: 'Alimentación & Supermercado',
    categoriaColor: '#EF4444',
    monto: 2100.0,
    moneda: 'MXN',
    descripcion: 'Supermercado semanal',
    fecha: '2026-10-28',
    metodoPago: 'DEBIT_CARD',
    esRecurrente: false,
  },
  {
    id: 'pexp-sofia-2',
    usuarioId: 'user-pro-002',
    categoriaId: 'cat-5',
    categoriaNombre: 'Suscripciones & Streaming',
    categoriaColor: '#6366F1',
    monto: 169.0,
    moneda: 'MXN',
    descripcion: 'Spotify Dúo Premium',
    fecha: '2026-10-20',
    metodoPago: 'CREDIT_CARD',
    esRecurrente: true,
  },
  // Gastos Mateo (Free)
  {
    id: 'pexp-mateo-1',
    usuarioId: 'user-free-003',
    categoriaId: 'cat-1',
    categoriaNombre: 'Alimentación & Supermercado',
    categoriaColor: '#EF4444',
    monto: 950.0,
    moneda: 'MXN',
    descripcion: 'Comestibles semanales',
    fecha: '2026-10-27',
    metodoPago: 'CASH',
    esRecurrente: false,
  },
];

const INITIAL_SUBSCRIPTIONS: DemoSubscription[] = [
  { id: 'sub-1', usuarioId: 'user-admin-001', proveedor: 'Netflix 4K', monto: 219.0, moneda: 'MXN', frecuencia: 'MONTHLY', proximaFecha: '2026-11-22', activa: true },
  { id: 'sub-2', usuarioId: 'user-admin-001', proveedor: 'Spotify Duo', monto: 169.0, moneda: 'MXN', frecuencia: 'MONTHLY', proximaFecha: '2026-11-20', activa: true },
  { id: 'sub-3', usuarioId: 'user-admin-001', proveedor: 'Amazon Prime', monto: 99.0, moneda: 'MXN', frecuencia: 'MONTHLY', proximaFecha: '2026-11-05', activa: true },
  { id: 'sub-4', usuarioId: 'user-admin-001', proveedor: 'GitHub Copilot', monto: 200.0, moneda: 'MXN', frecuencia: 'MONTHLY', proximaFecha: '2026-11-14', activa: true },
];

const INITIAL_GOALS: DemoGoal[] = [
  { id: 'goal-1', usuarioId: 'user-admin-001', nombre: 'Fondo de Emergencia (6 meses)', montoObjetivo: 60000.0, montoActual: 32500.0, moneda: 'MXN', fechaMeta: '2027-04-30', color: '#10B981' },
  { id: 'goal-2', usuarioId: 'user-admin-001', nombre: 'Enganche Apartamento', montoObjetivo: 180000.0, montoActual: 54000.0, moneda: 'MXN', fechaMeta: '2027-12-31', color: '#3B82F6' },
];

const INITIAL_ALERTS: DemoAlert[] = [
  {
    id: 'alt-1',
    usuarioId: 'user-admin-001',
    titulo: 'Micro-fuga recurrente en Cafeterías',
    mensaje: 'Has realizado 11 compras en cafeterías este mes sumando $1,210 MXN ($390 más que tu promedio habitual).',
    severidad: 'WARNING',
    montoImpacto: 390.0,
    fecha: '2026-10-28',
  },
  {
    id: 'alt-2',
    usuarioId: 'user-admin-001',
    titulo: 'Suscripción inactiva detectada',
    mensaje: 'Tu suscripción a Amazon Prime se cobró el 5 de octubre pero no se registra actividad de streaming vinculada.',
    severidad: 'INFO',
    montoImpacto: 99.0,
    fecha: '2026-10-15',
  },
];

// In-Memory store instance (persisted in Node process memory during dev session)
class DemoStoreState {
  public personas = { ...TEST_PERSONAS };
  public categories: DemoCategory[] = [...INITIAL_CATEGORIES];
  public companies: DemoCompany[] = [...INITIAL_COMPANIES];
  public companyExpenses: DemoCompanyExpense[] = [...INITIAL_COMPANY_EXPENSES];
  public personalExpenses: DemoExpense[] = [...INITIAL_PERSONAL_EXPENSES];
  public subscriptions: DemoSubscription[] = [...INITIAL_SUBSCRIPTIONS];
  public goals: DemoGoal[] = [...INITIAL_GOALS];
  public alerts: DemoAlert[] = [...INITIAL_ALERTS];

  // Current active persona key
  public activePersonaKey: 'admin' | 'pro' | 'free' = 'admin';

  public getActivePersona(): UserPersona {
    return this.personas[this.activePersonaKey] || this.personas.admin;
  }

  public setActivePersona(key: 'admin' | 'pro' | 'free') {
    if (this.personas[key]) {
      this.activePersonaKey = key;
    }
  }

  // --- Expenses Methods ---
  public getPersonalExpenses(userId: string): DemoExpense[] {
    return this.personalExpenses.filter((e) => e.usuarioId === userId || userId === 'user-admin-001');
  }

  public addPersonalExpense(expense: Omit<DemoExpense, 'id'>): DemoExpense {
    const cat = this.categories.find((c) => c.id === expense.categoriaId);
    const newExp: DemoExpense = {
      ...expense,
      id: `pexp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      categoriaNombre: cat?.nombre,
      categoriaColor: cat?.color,
    };
    this.personalExpenses.unshift(newExp);
    return newExp;
  }

  public deletePersonalExpense(id: string): boolean {
    const initialLen = this.personalExpenses.length;
    this.personalExpenses = this.personalExpenses.filter((e) => e.id !== id);
    return this.personalExpenses.length < initialLen;
  }

  // --- Company Methods ---
  public getCompanies(userId: string): DemoCompany[] {
    return this.companies.filter((c) => c.usuarioId === userId || userId === 'user-admin-001');
  }

  public addCompany(comp: Omit<DemoCompany, 'id' | 'createdAt'>): DemoCompany {
    const newComp: DemoCompany = {
      ...comp,
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.companies.push(newComp);
    return newComp;
  }

  public deleteCompany(id: string): boolean {
    const initialLen = this.companies.length;
    this.companies = this.companies.filter((c) => c.id !== id);
    // Also delete company expenses
    this.companyExpenses = this.companyExpenses.filter((e) => e.empresaId !== id);
    return this.companies.length < initialLen;
  }

  // --- Company Expenses Methods ---
  public getCompanyExpenses(companyId: string): DemoCompanyExpense[] {
    return this.companyExpenses.filter((e) => e.empresaId === companyId);
  }

  public addCompanyExpense(expense: Omit<DemoCompanyExpense, 'id'>): DemoCompanyExpense {
    const cat = this.categories.find((c) => c.id === expense.categoriaId);
    const newExp: DemoCompanyExpense = {
      ...expense,
      id: `cexp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      categoriaNombre: cat?.nombre,
      categoriaColor: cat?.color,
    };
    this.companyExpenses.unshift(newExp);
    return newExp;
  }

  public deleteCompanyExpense(id: string): boolean {
    const initialLen = this.companyExpenses.length;
    this.companyExpenses = this.companyExpenses.filter((e) => e.id !== id);
    return this.companyExpenses.length < initialLen;
  }

  // --- Category Methods ---
  public getCategories(): DemoCategory[] {
    return this.categories;
  }

  public addCategory(cat: Omit<DemoCategory, 'id' | 'esSistema'>): DemoCategory {
    const newCat: DemoCategory = {
      ...cat,
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      esSistema: false,
    };
    this.categories.push(newCat);
    return newCat;
  }

  public deleteCategory(id: string): boolean {
    const cat = this.categories.find((c) => c.id === id);
    if (cat?.esSistema) return false; // Don't delete system default categories
    const initialLen = this.categories.length;
    this.categories = this.categories.filter((c) => c.id !== id);
    return this.categories.length < initialLen;
  }
}

// Global singleton to persist across HMR reloads in Node
const globalForDemoStore = globalThis as unknown as {
  demoStore: DemoStoreState | undefined;
};

export const demoStore = globalForDemoStore.demoStore ?? new DemoStoreState();

if (process.env.NODE_ENV !== 'production') {
  globalForDemoStore.demoStore = demoStore;
}

