// src/app/actions/expenses.ts
'use server';

import { revalidatePath } from 'next/cache';
import { CreatePersonalExpenseSchema, CreatePersonalExpenseInput } from '@/lib/validations/expense.schema';
import prisma from '@/lib/prisma';
import { demoStore, DemoExpense } from '@/domain/demo/demo-store';

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Server Action: Get Personal Expenses
 */
export async function getPersonalExpensesAction(userId: string): Promise<ActionResponse<DemoExpense[]>> {
  try {
    // Attempt Prisma query
    const dbExpenses = await prisma.gastoPersonal.findMany({
      where: { usuarioId: userId },
      include: { categoria: true },
      orderBy: { fecha: 'desc' },
      take: 100,
    }).catch(() => null);

    if (dbExpenses && dbExpenses.length > 0) {
      const mapped: DemoExpense[] = dbExpenses.map((e) => ({
        id: e.id,
        usuarioId: e.usuarioId,
        categoriaId: e.categoriaId || undefined,
        categoriaNombre: e.categoria?.nombre,
        categoriaColor: e.categoria?.color,
        monto: Number(e.monto),
        moneda: e.moneda,
        descripcion: e.descripcion,
        fecha: e.fecha.toISOString().split('T')[0],
        metodoPago: e.metodoPago as any,
        esRecurrente: e.esRecurrente,
        comprobanteUrl: e.comprobanteUrl || undefined,
        notas: e.notas || undefined,
      }));
      return { success: true, data: mapped };
    }

    // Fallback to demo store
    const fallbackExpenses = demoStore.getPersonalExpenses(userId);
    return { success: true, data: fallbackExpenses };
  } catch (err) {
    console.warn('Fallback to demo store for getPersonalExpenses:', (err as Error).message);
    return { success: true, data: demoStore.getPersonalExpenses(userId) };
  }
}

/**
 * Server Action: Create Personal Expense
 */
export async function createPersonalExpenseAction(
  userId: string,
  rawInput: unknown
): Promise<ActionResponse<{ id: string }>> {
  try {
    // 1. Zod Validation
    const validation = CreatePersonalExpenseSchema.safeParse(rawInput);
    if (!validation.success) {
      return {
        success: false,
        error: 'Datos del gasto inválidos',
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const data: CreatePersonalExpenseInput = validation.data;

    // 2. Try Prisma database write
    const dbResult = await prisma.$transaction(async (tx) => {
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
    }).catch(() => null);

    if (dbResult) {
      revalidatePath('/dashboard');
      return { success: true, data: { id: dbResult.id } };
    }

    // 3. Fallback: Save to in-memory store so it reflects immediately
    const fallbackCreated = demoStore.addPersonalExpense({
      usuarioId: userId,
      monto: data.monto,
      moneda: data.moneda,
      descripcion: data.descripcion,
      fecha: (data.fecha instanceof Date ? data.fecha : new Date(data.fecha)).toISOString().split('T')[0],
      categoriaId: data.categoriaId || undefined,
      metodoPago: data.metodoPago as any,
      esRecurrente: data.esRecurrente,
      notas: data.notas || undefined,
    });

    revalidatePath('/dashboard');
    return { success: true, data: { id: fallbackCreated.id } };
  } catch (error) {
    console.error('Error in createPersonalExpenseAction:', error);
    return {
      success: false,
      error: 'Error al procesar el registro del gasto.',
    };
  }
}

/**
 * Server Action: Delete Personal Expense
 */
export async function deletePersonalExpenseAction(
  expenseId: string,
  userId: string
): Promise<ActionResponse<{ deleted: boolean }>> {
  try {
    // 1. Try Prisma delete
    const dbDeleted = await prisma.gastoPersonal.delete({
      where: { id: expenseId },
    }).catch(() => null);

    if (dbDeleted) {
      revalidatePath('/dashboard');
      return { success: true, data: { deleted: true } };
    }

    // 2. Fallback to demo store
    const removed = demoStore.deletePersonalExpense(expenseId);
    revalidatePath('/dashboard');
    return { success: true, data: { deleted: removed } };
  } catch (error) {
    console.error('Error in deletePersonalExpenseAction:', error);
    return {
      success: false,
      error: 'Error al eliminar el gasto.',
    };
  }
}
