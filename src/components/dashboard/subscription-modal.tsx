// src/components/dashboard/subscription-modal.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCheckoutSessionAction } from '@/app/actions/stripe';
import { upgradeSimulatedPlanAction } from '@/app/actions/user';
import { X, Check, Sparkles, ShieldCheck, Loader2, CreditCard } from 'lucide-react';

interface SubscriptionModalProps {
  currentPlan: 'FREE' | 'PRO_PERSONAL' | 'PRO_BUSINESS';
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({
  currentPlan,
  isOpen,
  onClose,
}: SubscriptionModalProps) {
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async (tier: 'PRO_PERSONAL' | 'PRO_BUSINESS') => {
    setLoadingTier(tier);
    try {
      const res = await createCheckoutSessionAction(tier);
      if (res.success && res.url) {
        if (res.url.includes('simulated_upgrade')) {
          // Development simulation: directly upgrade in state
          await upgradeSimulatedPlanAction(tier);
          setLoadingTier(null);
          onClose();
          router.refresh();
          return;
        }
        // Live Stripe redirect
        window.location.href = res.url;
      } else {
        alert(res.error || 'Error al iniciar checkout');
        setLoadingTier(null);
      }
    } catch (e) {
      console.error(e);
      setLoadingTier(null);
    }
  };

  const handleInstantSimulatedUpgrade = async (tier: 'PRO_PERSONAL' | 'PRO_BUSINESS') => {
    setLoadingTier(tier);
    await upgradeSimulatedPlanAction(tier);
    setLoadingTier(null);
    onClose();
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              Planes de Suscripción WhatUSpend
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Desbloquea los 20 reportes financieros, análisis de fugas y gestión B2B
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pro Personal */}
          <div className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all ${
            currentPlan === 'PRO_PERSONAL'
              ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
              : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
          }`}>
            {currentPlan === 'PRO_PERSONAL' && (
              <span className="absolute -top-2.5 right-4 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-950">
                Plan Actual
              </span>
            )}
            <div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="h-4 w-4" />
                <h3 className="font-semibold text-white">Pro Personal</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">Para individuos que buscan control financiero riguroso.</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">$199</span>
                <span className="text-xs text-slate-400">MXN / mes</span>
              </div>

              <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Acceso a los 20 Reportes Financieros</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Descargas ilimitadas en Excel y PDF</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Radar de Fugas de Dinero Inteligente</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Detección automática de suscripciones recurrentes</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 space-y-2">
              <button
                type="button"
                disabled={currentPlan === 'PRO_PERSONAL' || loadingTier !== null}
                onClick={() => handleCheckout('PRO_PERSONAL')}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-colors disabled:opacity-50"
              >
                {loadingTier === 'PRO_PERSONAL' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>{currentPlan === 'PRO_PERSONAL' ? 'Plan Activo' : 'Pagar con Stripe'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleInstantSimulatedUpgrade('PRO_PERSONAL')}
                className="w-full text-center text-[11px] text-slate-400 hover:text-emerald-300 py-1"
              >
                (Prueba rápida: Activar simulación Pro)
              </button>
            </div>
          </div>

          {/* Pro Business */}
          <div className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all ${
            currentPlan === 'PRO_BUSINESS'
              ? 'border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-500/10'
              : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
          }`}>
            {currentPlan === 'PRO_BUSINESS' && (
              <span className="absolute -top-2.5 right-4 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-950">
                Plan Actual
              </span>
            )}
            <div>
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldCheck className="h-4 w-4" />
                <h3 className="font-semibold text-white">Pro Business / Corporativo</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">Multi-empresa, centros de costos y auditoría SAT.</p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">$499</span>
                <span className="text-xs text-slate-400">MXN / mes</span>
              </div>

              <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Empresas ilimitadas (Multi-tenant B2B)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Gastos por departamentos y folios fiscales</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Reportes C-Suite (P&L, Balance General, Flujo)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Soporte prioritario e invitaciones a contadores</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 space-y-2">
              <button
                type="button"
                disabled={currentPlan === 'PRO_BUSINESS' || loadingTier !== null}
                onClick={() => handleCheckout('PRO_BUSINESS')}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 text-xs font-semibold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                {loadingTier === 'PRO_BUSINESS' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>{currentPlan === 'PRO_BUSINESS' ? 'Plan Activo' : 'Pagar con Stripe'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleInstantSimulatedUpgrade('PRO_BUSINESS')}
                className="w-full text-center text-[11px] text-slate-400 hover:text-amber-300 py-1"
              >
                (Prueba rápida: Activar simulación Business)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
