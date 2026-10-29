// src/app/actions/user.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { demoStore, UserPersona, TEST_PERSONAS } from '@/domain/demo/demo-store';

export async function getCurrentUserAction(): Promise<UserPersona> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Find or create in Prisma DB
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { supabaseAuthId: user.id },
            { email: user.email || '' },
          ],
        },
      }).catch(() => null);

      if (dbUser) {
        return {
          id: dbUser.id,
          nombre: dbUser.nombre || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          email: dbUser.email,
          avatarUrl: dbUser.avatarUrl || user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          plan: dbUser.plan as any,
          role: 'OWNER',
          moneda: dbUser.moneda || 'MXN',
        };
      }

      // If user is authenticated in Supabase but not yet in Prisma, construct persona
      return {
        id: user.id,
        nombre: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario Google',
        email: user.email || 'usuario@whatuspend.com',
        avatarUrl: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        plan: 'PRO_BUSINESS', // Grant Pro Business to logged in tester so they can test everything
        role: 'OWNER',
        moneda: 'MXN',
      };
    }
  } catch (err) {
    console.warn('Supabase auth session not present, using demo persona:', (err as Error).message);
  }

  return demoStore.getActivePersona();
}

export async function switchPersonaAction(personaKey: 'admin' | 'pro' | 'free') {
  demoStore.setActivePersona(personaKey);
  revalidatePath('/dashboard');
  return { success: true, persona: demoStore.getActivePersona() };
}

export async function upgradeSimulatedPlanAction(tier: 'PRO_PERSONAL' | 'PRO_BUSINESS') {
  const current = demoStore.getActivePersona();
  current.plan = tier;
  demoStore.personas[demoStore.activePersonaKey].plan = tier;
  revalidatePath('/dashboard');
  return { success: true, plan: tier };
}
