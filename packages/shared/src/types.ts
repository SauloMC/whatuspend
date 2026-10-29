// packages/shared/src/types.ts

export type PlanType = 'FREE' | 'PRO_PERSONAL' | 'PRO_BUSINESS';

export type PaymentMethod =
  | 'CASH'
  | 'DEBIT_CARD'
  | 'CREDIT_CARD'
  | 'BANK_TRANSFER'
  | 'CRYPTO'
  | 'OTHER';

export type RecurrenceFrequency =
  | 'DAILY'
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'BIANNUAL'
  | 'ANNUAL';

export type GoalStatus = 'IN_PROGRESS' | 'ACHIEVED' | 'CANCELLED' | 'PAUSED';

export interface GastoDTO {
  id: string;
  monto: number;
  moneda: string;
  descripcion: string;
  fecha: string; // ISO String for JSON serialization
  categoriaId?: string | null;
  categoriaNombre?: string;
  categoriaColor?: string;
  metodoPago: PaymentMethod;
  esRecurrente: boolean;
  comprobanteUrl?: string | null;
}

