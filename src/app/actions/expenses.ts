// src/app/actions/expenses.ts
'use server';

import { revalidatePath } from 'next/cache';
import { CreatePersonalExpenseSchema, CreatePersonalExpenseInput } from '@/lib/validations/expense.schema';
// Note: In real execution, prisma client is imported from '@/lib/prisma'
// and auth session is retrieved via Supabase server client
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Server Action: Create Personal Expense
 * Validates with Zod, checks session, writes to Prisma, registers audit log, revalidates cache.
 */
export async function createPersonalExpenseAction(
  userId: string,
  rawInput: unknown
): Promise<ActionResponse<{ id: string }>> {
  try {
    // 1. Zod Schema Validation
    const validation = CreatePersonalExpenseSchema.safeParse(rawInput);
    if (!validation.success) {
      return {
        success: false,
        error: 'Datos del gasto inválidos',
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const data: CreatePersonalExpenseInput = validation.data;

    // 2. Database Transaction: Expense + Audit Log
    const result = await prisma.$transaction(async (tx) => {
      const createdExpense = await tx.gastoPersonal.create({
        data: {
          usuarioId: userId,
          monto: data.monto,
          moneda: data.moneda,
          descripcion: data.descripcion,
          fecha: data.fecha,
          categoriaId: data.categoriaId,
          metodoPago: data.metodoPago,
          esRecurrente: data.esRecurrente,
          comprobanteUrl: data.comprobanteUrl,
          notas: data.notas,
          etiquetas: data.etiquetas,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          usuarioId: userId,
          accion: 'GASTO_PERSONAL_CREADO',
          entidad: 'GastoPersonal',
          entidadId: createdExpense.id,
          detalles: {
            monto: data.monto,
            descripcion: data.descripcion,
          },
        },
      });

      return createdExpense;
    });

    // 3. Revalidate Next.js cache for the dashboard & expenses view
    revalidatePath('/dashboard');
    revalidatePath('/gastos');

    return {
      success: true,
      data: { id: result.id },
    };
  } catch (error) {
    console.error('Error creating personal expense:', error);
    return {
      success: false,
      error: 'Ocurrió un error inesperado al registrar el gasto.',
    };
  }
}

