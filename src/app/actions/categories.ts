// src/app/actions/categories.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { demoStore, DemoCategory } from '@/domain/demo/demo-store';

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const CreateCategorySchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(80),
  tipo: z.enum(['EXPENSE', 'INCOME']).default('EXPENSE'),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Color hexadecimal inválido').default('#3B82F6'),
  icono: z.string().min(1).default('tag'),
  empresaId: z.string().optional().nullable(),
});

/**
 * Server Action: Get Categories
 */
export async function getCategoriesAction(
  userId?: string,
  empresaId?: string
): Promise<ActionResponse<DemoCategory[]>> {
  try {
    const dbCategories = await prisma.categoria.findMany({
      where: {
        OR: [
          { esSistema: true },
          ...(userId ? [{ usuarioId: userId }] : []),
          ...(empresaId ? [{ empresaId }] : []),
        ],
      },
      orderBy: { nombre: 'asc' },
    }).catch(() => null);

    if (dbCategories && dbCategories.length > 0) {
      const mapped: DemoCategory[] = dbCategories.map((c) => ({
        id: c.id,
        usuarioId: c.usuarioId || undefined,
        empresaId: c.empresaId || undefined,
        nombre: c.nombre,
        tipo: c.tipo as 'EXPENSE' | 'INCOME',
        color: c.color,
        icono: c.icono,
        esSistema: c.esSistema,
      }));
      return { success: true, data: mapped };
    }

    return { success: true, data: demoStore.getCategories() };
  } catch (err) {
    console.warn('Fallback to demo store for getCategories:', (err as Error).message);
    return { success: true, data: demoStore.getCategories() };
  }
}

/**
 * Server Action: Create Category
 */
export async function createCategoryAction(
  userId: string,
  rawInput: unknown
): Promise<ActionResponse<{ id: string }>> {
  try {
    const validation = CreateCategorySchema.safeParse(rawInput);
    if (!validation.success) {
      return {
        success: false,
        error: 'Datos de la categoría inválidos',
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const data = validation.data;

    // Try Prisma DB
    const dbResult = await prisma.categoria.create({
      data: {
        usuarioId: data.empresaId ? null : userId,
        empresaId: data.empresaId || null,
        nombre: data.nombre,
        tipo: data.tipo as any,
        color: data.color,
        icono: data.icono,
        esSistema: false,
      },
    }).catch(() => null);

    if (dbResult) {
      revalidatePath('/dashboard');
      return { success: true, data: { id: dbResult.id } };
    }

    const fallback = demoStore.addCategory({
      usuarioId: data.empresaId ? undefined : userId,
      empresaId: data.empresaId || undefined,
      nombre: data.nombre,
      tipo: data.tipo,
      color: data.color,
      icono: data.icono,
    });

    revalidatePath('/dashboard');
    return { success: true, data: { id: fallback.id } };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: 'Error al registrar la categoría.',
    };
  }
}

/**
 * Server Action: Delete Category
 */
export async function deleteCategoryAction(
  categoryId: string,
  userId: string
): Promise<ActionResponse<{ deleted: boolean }>> {
  try {
    const dbDeleted = await prisma.categoria.delete({
      where: {
        id: categoryId,
        esSistema: false, // Guard against deleting system categories
      },
    }).catch(() => null);

    if (dbDeleted) {
      revalidatePath('/dashboard');
      return { success: true, data: { deleted: true } };
    }

    const removed = demoStore.deleteCategory(categoryId);
    revalidatePath('/dashboard');
    return { success: true, data: { deleted: removed } };
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      error: 'Error al eliminar la categoría.',
    };
  }
}
