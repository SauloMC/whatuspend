// src/lib/validations/expense.schema.ts
import { z } from 'zod';

export const PaymentMethodEnum = z.enum([
  'CASH',
  'DEBIT_CARD',
  'CREDIT_CARD',
  'BANK_TRANSFER',
  'CRYPTO',
  'OTHER',
]);

export const CreatePersonalExpenseSchema = z.object({
  monto: z
    .number({ invalid_type_error: 'El monto debe ser un número válido' })
    .positive('El monto debe ser mayor a cero')
    .max(999999999.99, 'Monto excede el límite permitido'),
  moneda: z
    .string()
    .length(3, 'El código de moneda debe tener 3 caracteres (ej. MXN, USD)')
    .default('MXN'),
  descripcion: z
    .string()
    .min(2, 'La descripción debe tener al menos 2 caracteres')
    .max(255, 'La descripción no puede superar 255 caracteres')
    .trim(),
  fecha: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  categoriaId: z.string().uuid('ID de categoría inválido').optional().nullable(),
  metodoPago: PaymentMethodEnum.default('DEBIT_CARD'),
  esRecurrente: z.boolean().default(false),
  comprobanteUrl: z.string().url('URL inválida').optional().nullable(),
  notas: z.string().max(1000, 'Las notas no pueden exceder 1000 caracteres').optional().nullable(),
  etiquetas: z.array(z.string().trim()).default([]),
});

export type CreatePersonalExpenseInput = z.infer<typeof CreatePersonalExpenseSchema>;

export const UpdatePersonalExpenseSchema = CreatePersonalExpenseSchema.partial().extend({
  id: z.string().uuid('ID de gasto inválido'),
});

export type UpdatePersonalExpenseInput = z.infer<typeof UpdatePersonalExpenseSchema>;

export const CreateCompanyExpenseSchema = CreatePersonalExpenseSchema.extend({
  empresaId: z.string().uuid('ID de empresa inválido'),
  facturaFolio: z.string().max(100).optional().nullable(),
  departamento: z.string().max(80).optional().nullable(),
});

export type CreateCompanyExpenseInput = z.infer<typeof CreateCompanyExpenseSchema>;

