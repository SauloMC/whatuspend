// src/app/actions/companies.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { demoStore, DemoCompany, DemoCompanyExpense } from '@/domain/demo/demo-store';
import { PaymentMethodEnum } from '@/lib/validations/expense.schema';

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// Validation Schemas
const CreateCompanySchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
  rfcTaxId: z.string().min(8, 'RFC o ID Fiscal inválido').max(20).toUpperCase(),
  giro: z.string().min(3, 'El giro debe tener al menos 3 caracteres').max(120),
  monedaBase: z.string().length(3).default('MXN'),
});

const CreateCompanyExpenseSchema = z.object({
  monto: z.number().positive('El monto debe ser mayor a cero'),
  moneda: z.string().length(3).default('MXN'),
  descripcion: z.string().min(2, 'La descripción es obligatoria').max(255),
  fecha: z.string().or(z.date()).transform((val) => new Date(val)),
  categoriaId: z.string().optional().nullable(),
  metodoPago: PaymentMethodEnum.default('BANK_TRANSFER'),
  facturaFolio: z.string().max(100).optional().nullable(),
  departamento: z.string().max(80).optional().nullable(),
  notas: z.string().max(1000).optional().nullable(),
});

/**
 * Server Action: Get Companies
 */
export async function getCompaniesAction(userId: string): Promise<ActionResponse<DemoCompany[]>> {
  try {
    const dbCompanies = await prisma.empresa.findMany({
      where: {
        OR: [
          { usuarioId: userId },
          { miembros: { some: { usuarioId: userId } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => null);

    if (dbCompanies && dbCompanies.length > 0) {
      const mapped: DemoCompany[] = dbCompanies.map((c) => ({
        id: c.id,
        usuarioId: c.usuarioId,
        nombre: c.nombre,
        rfcTaxId: c.rfcTaxId || '',
        giro: c.giro,
        monedaBase: c.monedaBase,
        logoUrl: c.logoUrl || undefined,
        createdAt: c.createdAt.toISOString().split('T')[0],
      }));
      return { success: true, data: mapped };
    }

    return { success: true, data: demoStore.getCompanies(userId) };
  } catch (err) {
    console.warn('Fallback to demo store for getCompanies:', (err as Error).message);
    return { success: true, data: demoStore.getCompanies(userId) };
  }
}

/**
 * Server Action: Create Company
 */
export async function createCompanyAction(
  userId: string,
  rawInput: unknown
): Promise<ActionResponse<{ id: string }>> {
  try {
    const validation = CreateCompanySchema.safeParse(rawInput);
    if (!validation.success) {
      return {
        success: false,
        error: 'Datos de la empresa inválidos',
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const data = validation.data;

    // Try Prisma DB
    const dbResult = await prisma.empresa.create({
      data: {
        usuarioId: userId,
        nombre: data.nombre,
        rfcTaxId: data.rfcTaxId,
        giro: data.giro,
        monedaBase: data.monedaBase,
      },
    }).catch(() => null);

    if (dbResult) {
      revalidatePath('/dashboard');
      return { success: true, data: { id: dbResult.id } };
    }

    // Fallback to demo store
    const fallback = demoStore.addCompany({
      usuarioId: userId,
      nombre: data.nombre,
      rfcTaxId: data.rfcTaxId,
      giro: data.giro,
      monedaBase: data.monedaBase,
    });

    revalidatePath('/dashboard');
    return { success: true, data: { id: fallback.id } };
  } catch (error) {
    console.error('Error creating company:', error);
    return {
      success: false,
      error: 'Error al registrar la empresa.',
    };
  }
}

/**
 * Server Action: Delete Company
 */
export async function deleteCompanyAction(
  companyId: string,
  userId: string
): Promise<ActionResponse<{ deleted: boolean }>> {
  try {
    const dbDeleted = await prisma.empresa.delete({
      where: { id: companyId },
    }).catch(() => null);

    if (dbDeleted) {
      revalidatePath('/dashboard');
      return { success: true, data: { deleted: true } };
    }

    const removed = demoStore.deleteCompany(companyId);
    revalidatePath('/dashboard');
    return { success: true, data: { deleted: removed } };
  } catch (error) {
    console.error('Error deleting company:', error);
    return {
      success: false,
      error: 'Error al eliminar la empresa.',
    };
  }
}

/**
 * Server Action: Get Company Expenses
 */
export async function getCompanyExpensesAction(
  companyId: string
): Promise<ActionResponse<DemoCompanyExpense[]>> {
  try {
    const dbExpenses = await prisma.gastoEmpresa.findMany({
      where: { empresaId: companyId },
      include: { categoria: true },
      orderBy: { fecha: 'desc' },
      take: 100,
    }).catch(() => null);

    if (dbExpenses && dbExpenses.length > 0) {
      const mapped: DemoCompanyExpense[] = dbExpenses.map((e) => ({
        id: e.id,
        empresaId: e.empresaId,
        registradoPor: e.registradoPor,
        categoriaId: e.categoriaId || undefined,
        categoriaNombre: e.categoria?.nombre,
        categoriaColor: e.categoria?.color,
        monto: Number(e.monto),
        moneda: e.moneda,
        descripcion: e.descripcion,
        fecha: e.fecha.toISOString().split('T')[0],
        metodoPago: e.metodoPago as any,
        facturaFolio: e.facturaFolio || undefined,
        departamento: e.departamento || undefined,
        comprobanteUrl: e.comprobanteUrl || undefined,
        notas: e.notas || undefined,
      }));
      return { success: true, data: mapped };
    }

    return { success: true, data: demoStore.getCompanyExpenses(companyId) };
  } catch (err) {
    console.warn('Fallback to demo store for getCompanyExpenses:', (err as Error).message);
    return { success: true, data: demoStore.getCompanyExpenses(companyId) };
  }
}

/**
 * Server Action: Create Company Expense
 */
export async function createCompanyExpenseAction(
  userId: string,
  companyId: string,
  rawInput: unknown
): Promise<ActionResponse<{ id: string }>> {
  try {
    const validation = CreateCompanyExpenseSchema.safeParse(rawInput);
    if (!validation.success) {
      return {
        success: false,
        error: 'Datos del gasto empresarial inválidos',
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const data = validation.data;

    // Try Prisma DB
    const dbResult = await prisma.gastoEmpresa.create({
      data: {
        empresaId: companyId,
        registradoPor: userId,
        monto: data.monto,
        moneda: data.moneda,
        descripcion: data.descripcion,
        fecha: data.fecha,
        categoriaId: data.categoriaId,
        metodoPago: data.metodoPago as any,
        facturaFolio: data.facturaFolio,
        departamento: data.departamento,
        notas: data.notas,
      },
    }).catch(() => null);

    if (dbResult) {
      revalidatePath('/dashboard');
      return { success: true, data: { id: dbResult.id } };
    }

    // Fallback demo store
    const fallback = demoStore.addCompanyExpense({
      empresaId: companyId,
      registradoPor: userId,
      categoriaId: data.categoriaId || undefined,
      monto: data.monto,
      moneda: data.moneda,
      descripcion: data.descripcion,
      fecha: (data.fecha instanceof Date ? data.fecha : new Date(data.fecha)).toISOString().split('T')[0],
      metodoPago: data.metodoPago as any,
      facturaFolio: data.facturaFolio || undefined,
      departamento: data.departamento || undefined,
      notas: data.notas || undefined,
    });

    revalidatePath('/dashboard');
    return { success: true, data: { id: fallback.id } };
  } catch (error) {
    console.error('Error creating company expense:', error);
    return {
      success: false,
      error: 'Error al registrar el gasto empresarial.',
    };
  }
}

/**
 * Server Action: Delete Company Expense
 */
export async function deleteCompanyExpenseAction(
  expenseId: string,
  companyId: string
): Promise<ActionResponse<{ deleted: boolean }>> {
  try {
    const dbDeleted = await prisma.gastoEmpresa.delete({
      where: { id: expenseId },
    }).catch(() => null);

    if (dbDeleted) {
      revalidatePath('/dashboard');
      return { success: true, data: { deleted: true } };
    }

    const removed = demoStore.deleteCompanyExpense(expenseId);
    revalidatePath('/dashboard');
    return { success: true, data: { deleted: removed } };
  } catch (error) {
    console.error('Error deleting company expense:', error);
    return {
      success: false,
      error: 'Error al eliminar el gasto de la empresa.',
    };
  }
}
