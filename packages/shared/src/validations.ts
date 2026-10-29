// packages/shared/src/validations.ts
import { z } from 'zod';

export const PaymentMethodSchema = z.enum([
  'CASH',
  'DEBIT_CARD',
  'CREDIT_CARD',
  'BANK_TRANSFER',
  'CRYPTO',
  'OTHER',
]);

export const SharedExpenseFormSchema = z.object({
  monto: z.number().positive('El monto debe ser mayor a 0'),
  moneda: z.string().length(3).default('MXN'),
  descripcion: z.string().min(2, 'Descripción mínima de 2 caracteres').max(255),
  fecha: z.string(),
  categoriaId: z.string().uuid().optional().nullable(),
  metodoPago: PaymentMethodSchema.default('DEBIT_CARD'),
  esRecurrente: z.boolean().default(false),
  notas: z.string().max(1000).optional().nullable(),
});

export type SharedExpenseFormValues = z.infer<typeof SharedExpenseFormSchema>;

