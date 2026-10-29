// src/lib/validations/report.schema.ts
import { z } from 'zod';

export const ReportTypeEnum = z.enum([
  'PERSONAL_EXPENSES',
  'COMPANY_EXPENSES',
  'ANNUAL_SUMMARY',
  'CATEGORY_BREAKDOWN',
  'LEAK_AUDIT',
]);

export const ReportFormatEnum = z.enum(['PDF', 'EXCEL']);

export const RequestReportSchema = z.object({
  tipo: ReportTypeEnum.default('PERSONAL_EXPENSES'),
  formato: ReportFormatEnum.default('PDF'),
  empresaId: z.string().uuid('ID de empresa inválido').optional().nullable(),
  fechaInicio: z.string().or(z.date()).transform((val) => new Date(val).toISOString()),
  fechaFin: z.string().or(z.date()).transform((val) => new Date(val).toISOString()),
  categoriaIds: z.array(z.string().uuid()).optional().default([]),
  incluirComprobantes: z.boolean().default(false),
  enviarNotificacionEmail: z.boolean().default(true),
});

export type RequestReportInput = z.infer<typeof RequestReportSchema>;

