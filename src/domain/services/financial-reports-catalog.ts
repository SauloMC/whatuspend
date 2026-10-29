// src/domain/services/financial-reports-catalog.ts
import { ReportFormat, ReportType } from '@prisma/client';

export type ReportTier = 'FREE' | 'PRO';
export type ReportCategory =
  | 'Flujo & Liquidez'
  | 'Contabilidad & Estados Financieros'
  | 'Patrimonio & Riqueza'
  | 'Control de Fugas & Presupuesto'
  | 'Gestión Empresarial & Costos';

export interface FinancialReportMetadata {
  id: ReportType;
  nombre: string;
  categoria: ReportCategory;
  tier: ReportTier;
  descripcionCorta: string;
  fundamentoExperto: string;
  metricasClave: string[];
  formatosSoportados: ReportFormat[];
  icono: string;
}

export const FINANCIAL_REPORTS_CATALOG: FinancialReportMetadata[] = [
  // =========================================================================
  // 5 REPORTES VERSIÓN FREE (Salud Financiera Personal Esencial)
  // =========================================================================
  {
    id: 'ESTADO_INGRESOS_GASTOS_BASICO',
    nombre: 'Estado de Ingresos vs Gastos del Periodo',
    categoria: 'Flujo & Liquidez',
    tier: 'FREE',
    descripcionCorta: 'Resumen mensual de entradas y salidas con saldo neto remanente.',
    fundamentoExperto: 'Principio fundamental de finanzas personales: saber si tu flujo de caja mensual es positivo antes de comprometer nuevos gastos.',
    metricasClave: ['Ingresos Totales', 'Gastos Totales', 'Superávit / Déficit', 'Promedio Diario de Gasto'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'wallet',
  },
  {
    id: 'DISTRIBUCION_CATEGORIAS',
    nombre: 'Distribución y Concentración de Gastos',
    categoria: 'Control de Fugas & Presupuesto',
    tier: 'FREE',
    descripcionCorta: 'Desglose porcentual y visual de gastos por rubro (Alimentación, Vivienda, Ocio, etc.).',
    fundamentoExperto: 'Permite identificar si una sola categoría está absorbiendo más del 30-40% del presupuesto mensual disponible.',
    metricasClave: ['% por Categoría', 'Categoría de Mayor Impacto', 'Gasto Promedio por Rubro'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'pie-chart',
  },
  {
    id: 'AUDITORIA_FUGAS_GASTOS_HORMIGA',
    nombre: 'Auditoría de Gastos Hormiga & Fugas Detectadas',
    categoria: 'Control de Fugas & Presupuesto',
    tier: 'FREE',
    descripcionCorta: 'Consolidación de micro-consumos (< $120 MXN) y su proyección anualizada de fuga de capital.',
    fundamentoExperto: 'Los gastos hormiga no planificados representan típicamente entre el 8% y el 15% del ingreso neto de una persona.',
    metricasClave: ['Monto Acumulado en Micro-gastos', 'Proyección de Fuga Anual', 'Ahorro Potencial Sugerido'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'alert-triangle',
  },
  {
    id: 'PROYECCION_METAS_AHORRO',
    nombre: 'Progreso y Amortización de Metas de Ahorro',
    categoria: 'Patrimonio & Riqueza',
    tier: 'FREE',
    descripcionCorta: 'Seguimiento de objetivos financieros (auto, fondo de emergencia, viaje) con fecha estimada.',
    fundamentoExperto: 'Metodología SMART para metas financieras: cuantificar el faltante y dividirlo en ahorro semanal realizable.',
    metricasClave: ['% de Cumplimiento', 'Monto Faltante', 'Ahorro Semanal Necesario', 'Meses Restantes'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'target',
  },
  {
    id: 'CALENDARIO_VENCIMIENTO_GASTOS',
    nombre: 'Calendario de Vencimientos de Pagos y Suscripciones',
    categoria: 'Flujo & Liquidez',
    tier: 'FREE',
    descripcionCorta: 'Cronograma semanal de fechas de corte y pagos fijos para evitar recargos e intereses.',
    fundamentoExperto: 'Elimina el costo oculto de cargos moratorios y comisiones por sobregiro en tarjetas de crédito y servicios.',
    metricasClave: ['Próximos 7 y 30 días de pagos', 'Gasto Fijo Comprometido', 'Alertas de Corte'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'calendar',
  },

  // =========================================================================
  // 15 REPORTES VERSIÓN PRO (Contabilidad, Empresas, Ratios & Patrimonio)
  // =========================================================================
  {
    id: 'ESTADO_DE_RESULTADOS',
    nombre: 'Estado de Resultados Integral (P&L)',
    categoria: 'Contabilidad & Estados Financieros',
    tier: 'PRO',
    descripcionCorta: 'P&L corporativo y personal estructurado: Ingresos brutos, costo operativo, margen y utilidad neta.',
    fundamentoExperto: 'Norma Internacional de Información Financiera (NIIF/IFRS). El reporte maestro para evaluar si una empresa o profesional es rentable.',
    metricasClave: ['Ingresos Brutos', 'Margen Bruto', 'Gastos de Operación (OpEx)', 'EBITDA / Utilidad Neta'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'file-text',
  },
  {
    id: 'BALANCE_GENERAL',
    nombre: 'Balance General (Estado de Situación Financiera)',
    categoria: 'Contabilidad & Estados Financieros',
    tier: 'PRO',
    descripcionCorta: 'Fotografía patrimonial: Activos circulantes y fijos frente a Pasivos y Patrimonio Neto.',
    fundamentoExperto: 'Ecuación contable fundamental: Activo = Pasivo + Capital. Muestra la verdadera solidez de tu negocio o familia.',
    metricasClave: ['Activo Total', 'Pasivo a Corto y Largo Plazo', 'Capital Contable / Patrimonio Neto'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'scale',
  },
  {
    id: 'ESTADO_FLUJO_EFECTIVO',
    nombre: 'Estado de Flujos de Efectivo (Cash Flow Statement)',
    categoria: 'Contabilidad & Estados Financieros',
    tier: 'PRO',
    descripcionCorta: 'Desglose del origen y aplicación de efectivo: Actividades de Operación, Inversión y Financiamiento.',
    fundamentoExperto: 'Principio contable: Las empresas quiebran por falta de liquidez, no por falta de ventas. Muestra la caja real disponible.',
    metricasClave: ['Flujo Operativo Neto', 'Flujo de Inversión', 'Flujo de Financiamiento', 'Posición Final de Caja'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'activity',
  },
  {
    id: 'RATIOS_LIQUIDEZ_SOLVENCIA',
    nombre: 'Executive Dashboard de Ratios Financieros',
    categoria: 'Contabilidad & Estados Financieros',
    tier: 'PRO',
    descripcionCorta: 'Indicadores clave de solvencia: Razón Corriente (Current Ratio), Prueba Ácida (Quick Ratio) y Runway.',
    fundamentoExperto: 'Permite saber exactamente cuántos meses de supervivencia tiene la empresa o familia sin percibir un solo peso de ingreso.',
    metricasClave: ['Current Ratio', 'Quick Ratio', 'Runway (Meses de Caja)', 'Apalancamiento Financiero'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'gauge',
  },
  {
    id: 'REGLA_PRESUPUESTO_50_30_20',
    nombre: 'Auditoría Presupuestal 50/30/20 (Elizabeth Warren)',
    categoria: 'Control de Fugas & Presupuesto',
    tier: 'PRO',
    descripcionCorta: 'Evaluación estricta: 50% Necesidades Básicas, 30% Deseos/Estilo de Vida, 20% Ahorro e Inversión.',
    fundamentoExperto: 'El estándar de oro de finanzas personales para evitar el estancamiento patrimonial y el sobregasto en estilo de vida.',
    metricasClave: ['% en Necesidades (Max 50%)', '% en Deseos (Max 30%)', '% en Ahorro (Min 20%)', 'Diagnóstico de Desviación'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'sliders',
  },
  {
    id: 'TASA_AHORRO_LIBERTAD_FINANCIERA',
    nombre: 'Tasa de Ahorro Real & Proyección FIRE (Regla del 4%)',
    categoria: 'Patrimonio & Riqueza',
    tier: 'PRO',
    descripcionCorta: 'Cálculo de tasa neta de ahorro y proyección matemática de años hasta la Independencia Financiera.',
    fundamentoExperto: 'Modelo matemático Trinity Study: correlaciona tu tasa de ahorro actual con el número de años para vivir de tus rentas.',
    metricasClave: ['Tasa de Ahorro (%)', 'Años Estimados a Jubilación', 'Patrimonio FIRE Objetivo (25x Gasto Anual)'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'flame',
  },
  {
    id: 'CONCILIACION_FISCAL_DEDUCIBLES',
    nombre: 'Conciliación Fiscal de Gastos Deducibles con Folio / Factura',
    categoria: 'Contabilidad & Estados Financieros',
    tier: 'PRO',
    descripcionCorta: 'Listado contable de gastos con folios fiscales, RFC de emisor y comprobantes adjuntos.',
    fundamentoExperto: 'Preparado para entrega directa al despacho contable en auditorías y declaraciones fiscales periódicas (SAT / IRS).',
    metricasClave: ['Total Gastos Deducibles', 'IVA / Tax Acreditable', 'Gastos sin Comprobante (Riesgo)'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'receipt',
  },
  {
    id: 'COSTO_TOTAL_SUSCRIPCIONES_ANUALIZADO',
    nombre: 'Auditoría de Suscripciones & Pagos Fantasma',
    categoria: 'Control de Fugas & Presupuesto',
    tier: 'PRO',
    descripcionCorta: 'Desglose anualizado de cobros recurrentes de software, entretenimiento y membresías con índice de rentabilidad.',
    fundamentoExperto: 'El "Subscription Creep" drena en promedio $3,000 a $12,000 MXN anuales en servicios infrautilizados o duplicados.',
    metricasClave: ['Gasto Anual Comprometido', 'Costo Diario de Suscripciones', 'Servicios Duplicados Detectados'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'repeat',
  },
  {
    id: 'ESTADO_PATRIMONIAL_NET_WORTH',
    nombre: 'Evolución Histórica del Patrimonio Neto (Net Worth)',
    categoria: 'Patrimonio & Riqueza',
    tier: 'PRO',
    descripcionCorta: 'Crecimiento de riqueza neta (Activos - Deudas) comparado mes a mes con curva de tendencia.',
    fundamentoExperto: 'El único KPI definitivo de riqueza real. El ingreso mide velocidad; el patrimonio neto mide aceleración y seguridad.',
    metricasClave: ['Patrimonio Neto Actual', 'Crecimiento MoM / YoY', 'Ratio Deuda / Patrimonio'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'trending-up',
  },
  {
    id: 'GASTOS_POR_DEPARTAMENTO_CENTRO_COSTOS',
    nombre: 'Desglose por Centros de Costo y Departamentos',
    categoria: 'Gestión Empresarial & Costos',
    tier: 'PRO',
    descripcionCorta: 'Distribución de gastos de empresa agrupados por área: Marketing, Operaciones, Ventas, TI, Administración.',
    fundamentoExperto: 'Permite a directores generales y gerentes identificar qué división está desbordando su presupuesto asignado.',
    metricasClave: ['Gasto por Departamento', '% del Presupuesto Operativo', 'Variación Mensual por Área'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'building',
  },
  {
    id: 'ANALISIS_VARIACION_PRESUPUESTAL',
    nombre: 'Análisis de Variación Presupuestal (Budget vs Actual)',
    categoria: 'Control de Fugas & Presupuesto',
    tier: 'PRO',
    descripcionCorta: 'Comparativa entre presupuesto proyectado vs gasto real ejecutado con semáforos de tolerancia.',
    fundamentoExperto: 'Control presupuestario de gestión: detecta desvíos de partida antes de que comprometan el flujo de caja del negocio.',
    metricasClave: ['Presupuestado vs Real', 'Variación Absoluta ($)', 'Variación Porcentual (%)', 'Alertas Rojas'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'check-square',
  },
  {
    id: 'RENTABILIDAD_UNITARIA_Y_MARGENES',
    nombre: 'Margen de Contribución & Punto de Equilibrio (Break-Even)',
    categoria: 'Gestión Empresarial & Costos',
    tier: 'PRO',
    descripcionCorta: 'Cálculo de costos fijos vs variables y monto exacto de ventas requerido para no operar con pérdidas.',
    fundamentoExperto: 'Herramienta vital para fijación de precios, contratación de personal y viabilidad de nuevos proyectos empresariales.',
    metricasClave: ['Costos Fijos Totales', 'Margen de Contribución Promedio', 'Punto de Equilibrio en Facturación'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'crosshair',
  },
  {
    id: 'DIAGNOSTICO_ENDEUDAMIENTO_DTI',
    nombre: 'Diagnóstico de Endeudamiento & Capacidad Crediticia (DTI)',
    categoria: 'Flujo & Liquidez',
    tier: 'PRO',
    descripcionCorta: 'Debt-to-Income Ratio y semáforo de capacidad de pago según estándares de banca hipotecaria y comercial.',
    fundamentoExperto: 'Si tu servicio mensual de deuda supera el 35-40% de tu ingreso neto, te encuentras en zona de estrés financiero de alto riesgo.',
    metricasClave: ['Ratio DTI (%)', 'Carga Financiera Mensual', 'Capacidad Máxima de Crédito Seguro'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'credit-card',
  },
  {
    id: 'SIMULADOR_FISCAL_PROYECTADO',
    nombre: 'Proyección de Obligaciones Fiscales & Retenciones',
    categoria: 'Contabilidad & Estados Financieros',
    tier: 'PRO',
    descripcionCorta: 'Simulación estimada de impuestos a pagar al cierre del trimestre/año con base en facturación y deducciones.',
    fundamentoExperto: 'Evita sorpresas fiscales reservando la provisión de impuestos correcta de manera mensual.',
    metricasClave: ['Provisión Fiscal Estimada', 'Tasa Impositiva Efectiva', 'Deducciones Aplicadas'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'calculator',
  },
  {
    id: 'INFORME_EJECUTIVO_CONSEJO_ADMINISTRACION',
    nombre: 'Informe Ejecutivo para Consejo de Administración / Inversores',
    categoria: 'Gestión Empresarial & Costos',
    tier: 'PRO',
    descripcionCorta: 'Dossier institucional consolidado en PDF de alta fidelidad con KPIs de rentabilidad, caja y proyecciones.',
    fundamentoExperto: 'Documento directivo de nivel C-Suite / Board of Directors para rendición de cuentas, rondas de capital o préstamos bancarios.',
    metricasClave: ['Resumen Ejecutivo', 'Matriz de KPIs Financieros', 'Evolución de Caja', 'Conclusiones y Riesgos'],
    formatosSoportados: [ReportFormat.PDF, ReportFormat.EXCEL],
    icono: 'briefcase',
  },
];

