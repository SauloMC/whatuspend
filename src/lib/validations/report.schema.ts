// src/lib/validations/report.schema.ts
import { z } from 'zod';

export const ReportTypeEnum = z.enum([
  // 5 Free
  'ESTADO_INGRESOS_GASTOS_BASICO',
  'DISTRIBUCION_CATEGORIAS',
  'AUDITORIA_FUGAS_GASTOS_HORMIGA',
  'PROYECCION_METAS_AHORRO',
  'CALENDARIO_VENCIMIENTO_GASTOS',
  // 15 Pro
  'ESTADO_DE_RESULTADOS',
  'BALANCE_GENERAL',
  'ESTADO_FLUJO_EFECTIVO',
  'RATIOS_LIQUIDEZ_SOLVENCIA',
  'REGLA_PRESUPUESTO_50_30_20',
  'TASA_AHORRO_LIBERTAD_FINANCIERA',
  'CONCILIACION_FISCAL_DEDUCIBLES',
  'COSTO_TOTAL_SUSCRIPCIONES_ANUALIZADO',
  'ESTADO_PATRIMONIAL_NET_WORTH',
  'GASTOS_POR_DEPARTAMENTO_CENTRO_COSTOS',
  'ANALISIS_VARIACION_PRESUPUESTAL',
  'RENTABILIDAD_UNITARIA_Y_MARGENES',
  'DIAGNOSTICO_ENDEUDAMIENTO_DTI',
  'SIMULADOR_FISCAL_PROYECTADO',
  'INFORME_EJECUTIVO_CONSEJO_ADMINISTRACION',
]);

export const ReportFormatEnum = z.enum(['PDF', 'EXCEL']);

export const RequestReportSchema = z.object({
  tipo: ReportTypeEnum.default('ESTADO_INGRESOS_GASTOS_BASICO'),
  formato: ReportFormatEnum.default('PDF'),
  empresaId: z.string().uuid('ID de empresa inválido').optional().nullable(),
  fechaInicio: z.string().or(z.date()).transform((val) => new Date(val).toISOString()),
  fechaFin: z.string().or(z.date()).transform((val) => new Date(val).toISOString()),
  categoriaIds: z.array(z.string().uuid()).optional().default([]),
  incluirComprobantes: z.boolean().default(false),
  enviarNotificacionEmail: z.boolean().default(true),
});

export type RequestReportInput = z.infer<typeof RequestReportSchema>;
