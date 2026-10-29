// src/domain/services/report-sample-data.ts
import { ReportType } from '@prisma/client';

export interface SampleReportData {
  titulo: string;
  periodo: string;
  resumenEjecutivo: string;
  columnas: string[];
  filas: Array<Record<string, string | number>>;
  totales: Record<string, string | number>;
  conclusionExperto: string;
}

export const SAMPLE_REPORTS_DATA: Partial<Record<ReportType, SampleReportData>> = {
  ESTADO_INGRESOS_GASTOS_BASICO: {
    titulo: 'Estado de Ingresos vs Gastos del Periodo (Ejemplo)',
    periodo: 'Último mes (Datos de demostración)',
    resumenEjecutivo: 'Superávit mensual neto de $17,300 MXN con una tasa de retención del 36.4%.',
    columnas: ['Concepto', 'Tipo', 'Monto (MXN)', '% del Ingreso'],
    filas: [
      { Concepto: 'Salario / Ingresos Principales', Tipo: 'Ingreso', 'Monto (MXN)': '$35,000.00', '% del Ingreso': '73.7%' },
      { Concepto: 'Ingresos Freelance / Consultoría', Tipo: 'Ingreso', 'Monto (MXN)': '$12,500.00', '% del Ingreso': '26.3%' },
      { Concepto: 'Vivienda (Renta & Mantenimiento)', Tipo: 'Gasto', 'Monto (MXN)': '-$14,000.00', '% del Ingreso': '29.5%' },
      { Concepto: 'Supermercado & Alimentación', Tipo: 'Gasto', 'Monto (MXN)': '-$6,200.00', '% del Ingreso': '13.1%' },
      { Concepto: 'Transporte & Gasolina', Tipo: 'Gasto', 'Monto (MXN)': '-$3,400.00', '% del Ingreso': '7.2%' },
      { Concepto: 'Servicios (Luz, Agua, Internet)', Tipo: 'Gasto', 'Monto (MXN)': '-$2,100.00', '% del Ingreso': '4.4%' },
      { Concepto: 'Salidas, Restaurantes y Ocio', Tipo: 'Gasto', 'Monto (MXN)': '-$4,500.00', '% del Ingreso': '9.5%' },
    ],
    totales: {
      'Ingresos Totales': '$47,500.00 MXN',
      'Gastos Totales': '$30,200.00 MXN',
      'Flujo Neto Remanente': '+$17,300.00 MXN',
    },
    conclusionExperto: 'Tu flujo de caja es saludable. Se recomienda destinar al menos el 50% del remanente al fondo de emergencia hasta cubrir 6 meses de gastos fijos ($181,200 MXN).',
  },

  ESTADO_DE_RESULTADOS: {
    titulo: 'Estado de Resultados Integral — P&L (Ejemplo Pro)',
    periodo: 'Trimestre en curso (Datos de demostración)',
    resumenEjecutivo: 'Margen bruto del 71.9% y utilidad neta final de $34,230 MXN (18.5% sobre ventas).',
    columnas: ['Partida Contable', 'Monto (MXN)', '% de Ventas'],
    filas: [
      { 'Partida Contable': 'Ingresos Netos por Facturación', 'Monto (MXN)': '$185,400.00', '% de Ventas': '100.0%' },
      { 'Partida Contable': 'Costo de los Servicios / Ventas (COGS)', 'Monto (MXN)': '-$52,000.00', '% de Ventas': '28.1%' },
      { 'Partida Contable': 'UTILIDAD BRUTA', 'Monto (MXN)': '$133,400.00', '% de Ventas': '71.9%' },
      { 'Partida Contable': 'Gastos Operativos: Nómina y Honorarios', 'Monto (MXN)': '-$45,000.00', '% de Ventas': '24.3%' },
      { 'Partida Contable': 'Gastos Operativos: Marketing & Pauta Digital', 'Monto (MXN)': '-$18,000.00', '% de Ventas': '9.7%' },
      { 'Partida Contable': 'Gastos Operativos: Servidores, Software & TI', 'Monto (MXN)': '-$6,500.00', '% de Ventas': '3.5%' },
      { 'Partida Contable': 'Gastos Operativos: Arrendamiento de Oficinas', 'Monto (MXN)': '-$15,000.00', '% de Ventas': '8.1%' },
      { 'Partida Contable': 'UTILIDAD OPERATIVA (EBITDA)', 'Monto (MXN)': '$48,900.00', '% de Ventas': '26.4%' },
      { 'Partida Contable': 'Provisión Estimada de Impuestos (ISR 30%)', 'Monto (MXN)': '-$14,670.00', '% de Ventas': '7.9%' },
    ],
    totales: {
      'Facturación Bruta': '$185,400.00 MXN',
      'OpEx Total': '$84,500.00 MXN',
      'UTILIDAD NETA': '$34,230.00 MXN (18.5%)',
    },
    conclusionExperto: 'Estructura operativa equilibrada. El gasto en marketing (9.7%) muestra un buen retorno de inversión sobre el margen de contribución.',
  },

  BALANCE_GENERAL: {
    titulo: 'Balance General — Situación Financiera (Ejemplo Pro)',
    periodo: 'Al cierre del mes (Datos de demostración)',
    resumenEjecutivo: 'Activo Total de $246,500 MXN respaldando un Patrimonio Neto de $204,000 MXN (Apalancamiento de 17.2%).',
    columnas: ['Clasificación', 'Cuenta', 'Saldo (MXN)'],
    filas: [
      { Clasificación: 'Activo Circulante', Cuenta: 'Bancos & Efectivo Disponible', 'Saldo (MXN)': '$84,500.00' },
      { Clasificación: 'Activo Circulante', Cuenta: 'Cuentas por Cobrar a Clientes (30d)', 'Saldo (MXN)': '$42,000.00' },
      { Clasificación: 'Activo Circulante', Cuenta: 'Inventario / Mercancías', 'Saldo (MXN)': '$25,000.00' },
      { Clasificación: 'Activo Fijo', Cuenta: 'Equipos de Cómputo & Servidores', 'Saldo (MXN)': '$65,000.00' },
      { Clasificación: 'Activo Fijo', Cuenta: 'Mobiliario & Instalaciones', 'Saldo (MXN)': '$30,000.00' },
      { Clasificación: 'Pasivo Corto Plazo', Cuenta: 'Proveedores por Pagar', 'Saldo (MXN)': '-$28,000.00' },
      { Clasificación: 'Pasivo Corto Plazo', Cuenta: 'Tarjetas Corporativas & Créditos', 'Saldo (MXN)': '-$14,500.00' },
    ],
    totales: {
      'Activos Totales': '$246,500.00 MXN',
      'Pasivos Totales': '$42,500.00 MXN',
      'PATRIMONIO NETO': '$204,000.00 MXN',
    },
    conclusionExperto: 'Ratio de liquidez corriente de 3.56x (excelente solvencia para cubrir pasivos de corto plazo sin riesgo operativo).',
  },

  AUDITORIA_FUGAS_GASTOS_HORMIGA: {
    titulo: 'Auditoría de Gastos Hormiga & Fugas Detectadas (Ejemplo)',
    periodo: 'Últimos 30 días con proyección anualizada',
    resumenEjecutivo: '38 micropagos detectados por un total mensual de $3,400 MXN ($40,800 MXN proyectados al año).',
    columnas: ['Categoría Fuga', 'Frecuencia Mensual', 'Costo Promedio', 'Impacto Mensual', 'Proyección Anual'],
    filas: [
      { 'Categoría Fuga': 'Cafeterías & Bebidas de paso', 'Frecuencia Mensual': '24 compras', 'Costo Promedio': '$85.00', 'Impacto Mensual': '$2,040.00', 'Proyección Anual': '$24,480.00' },
      { 'Categoría Fuga': 'Comisiones bancarias / Retiros ajenos', 'Frecuencia Mensual': '6 cargos', 'Costo Promedio': '$40.00', 'Impacto Mensual': '$240.00', 'Proyección Anual': '$2,880.00' },
      { 'Categoría Fuga': 'Snacks, tiendas de conveniencia y delivery', 'Frecuencia Mensual': '8 compras', 'Costo Promedio': '$140.00', 'Impacto Mensual': '$1,120.00', 'Proyección Anual': '$13,440.00' },
    ],
    totales: {
      'Micro-gastos en 30 días': '38 transacciones',
      'Fuga Mensual': '$3,400.00 MXN',
      'FUGA ANUAL PROYECTADA': '$40,800.00 MXN',
    },
    conclusionExperto: 'Sustituir el café diario de cafetería por café preparado en casa liberaría más de $20,000 MXN anuales directos a tu meta de ahorro.',
  },

  REGLA_PRESUPUESTO_50_30_20: {
    titulo: 'Auditoría Presupuestal 50/30/20 — Elizabeth Warren (Ejemplo Pro)',
    periodo: 'Evaluación mensual sobre ingreso neto de $40,000 MXN',
    resumenEjecutivo: 'Desvío en necesidades (+6%) y estilo de vida (+4%), generando un déficit del 10% en ahorro e inversión.',
    columnas: ['Pilar', 'Meta Recomendada', 'Monto Objetivo', 'Gasto Real', '% Real', 'Estado'],
    filas: [
      { Pilar: 'Necesidades Básicas (Vivienda, Servicios, Comida)', 'Meta Recomendada': '50%', 'Monto Objetivo': '$20,000.00', 'Gasto Real': '$22,400.00', '% Real': '56.0%', Estado: 'Exceso +6%' },
      { Pilar: 'Estilo de Vida & Deseos (Salidas, Ocio, Viajes)', 'Meta Recomendada': '30%', 'Monto Objetivo': '$12,000.00', 'Gasto Real': '$13,600.00', '% Real': '34.0%', Estado: 'Exceso +4%' },
      { Pilar: 'Ahorro, Deuda & Inversión (Patrimonio)', 'Meta Recomendada': '20%', 'Monto Objetivo': '$8,000.00', 'Gasto Real': '$4,000.00', '% Real': '10.0%', Estado: 'Déficit -10%' },
    ],
    totales: {
      'Ingreso Evaluado': '$40,000.00 MXN',
      'Ahorro Actual': '$4,000.00 (10%)',
      'Ahorro Objetivo 50/30/20': '$8,000.00 (20%)',
    },
    conclusionExperto: 'Para rebalancear al estándar 50/30/20, se requiere transferir $4,000 MXN desde compras de estilo de vida hacia ahorro automático el día de pago.',
  },
};

