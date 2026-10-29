// src/components/dashboard/dashboard-header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserPersona, DemoCompany } from '@/domain/demo/demo-store';
import { switchPersonaAction } from '@/app/actions/user';
import {
  Building2,
  User,
  ChevronDown,
  Sparkles,
  LogOut,
  Plus,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface DashboardHeaderProps {
  user: UserPersona;
  companies: DemoCompany[];
  selectedWorkspace: 'personal' | string; // 'personal' or companyId
  onSelectWorkspace: (workspace: 'personal' | string) => void;
  onOpenNewCompany: () => void;
  onOpenUpgradeModal: () => void;
}

export function DashboardHeader({
  user,
  companies,
  selectedWorkspace,
  onSelectWorkspace,
  onOpenNewCompany,
  onOpenUpgradeModal,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSwitchingPersona, setIsSwitchingPersona] = useState(false);

  const selectedCompany = companies.find((c) => c.id === selectedWorkspace);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out:', e);
    }
    router.push('/');
    router.refresh();
  };

  const handlePersonaSwitch = async (personaKey: 'admin' | 'pro' | 'free') => {
    setIsSwitchingPersona(true);
    await switchPersonaAction(personaKey);
    setIsSwitchingPersona(false);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Workspace Switcher */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 font-mono font-bold text-slate-950 shadow-md shadow-emerald-500/20">
              W$
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              What<span className="text-emerald-400">U</span>Spend
            </span>
          </Link>

          {/* Workspace Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-700 hover:bg-slate-800"
            >
              {selectedWorkspace === 'personal' ? (
                <>
                  <User className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Finanzas Personales</span>
                </>
              ) : (
                <>
                  <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="max-w-[140px] truncate">{selectedCompany?.nombre || 'Empresa'}</span>
                </>
              )}
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {workspaceDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setWorkspaceDropdownOpen(false)}
                />
                <div className="absolute left-0 z-20 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Espacios de Trabajo
                  </div>

                  {/* Personal option */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectWorkspace('personal');
                      setWorkspaceDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                      selectedWorkspace === 'personal'
                        ? 'bg-emerald-500/10 text-emerald-300 font-medium'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Finanzas Personales</span>
                    </div>
                    {selectedWorkspace === 'personal' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                  </button>

                  {/* Companies list */}
                  {companies.length > 0 && (
                    <div className="my-1 border-t border-slate-800/80 pt-1">
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Empresas (B2B)
                      </div>
                      {companies.map((comp) => (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => {
                            onSelectWorkspace(comp.id);
                            setWorkspaceDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                            selectedWorkspace === comp.id
                              ? 'bg-cyan-500/10 text-cyan-300 font-medium'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Building2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate">{comp.nombre}</span>
                          </div>
                          {selectedWorkspace === comp.id && <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="my-1 border-t border-slate-800/80 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setWorkspaceDropdownOpen(false);
                        onOpenNewCompany();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Registrar Nueva Empresa</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Test Persona Switcher (Allows testing Admin, Pro, Free instantly) */}
        <div className="hidden lg:flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/60 p-1">
          <span className="px-2 text-[10px] uppercase font-bold text-slate-300 tracking-wider">
            Rol de Prueba:
          </span>
          <button
            type="button"
            disabled={isSwitchingPersona}
            onClick={() => handlePersonaSwitch('admin')}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
              user.email === 'admin@whatuspend.com' || user.plan === 'PRO_BUSINESS'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Acceso total: empresas, reportes C-Suite, auditoría de fugas"
          >
            Admin (Dueño)
          </button>
          <button
            type="button"
            disabled={isSwitchingPersona}
            onClick={() => handlePersonaSwitch('pro')}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
              user.email === 'sofia.pro@whatuspend.com' || user.plan === 'PRO_PERSONAL'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Plan Pro Personal: 20 reportes, radar de fugas, simulador de metas"
          >
            Pro Personal
          </button>
          <button
            type="button"
            disabled={isSwitchingPersona}
            onClick={() => handlePersonaSwitch('free')}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
              user.plan === 'FREE'
                ? 'bg-slate-700/60 text-slate-200 border border-slate-600 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Plan Gratuito: 5 reportes esenciales, gastos personales"
          >
            Gratuito
          </button>
        </div>

        {/* Right: Plan Pill, Upgrade Button & Profile */}
        <div className="flex items-center gap-3">
          {/* Plan Badge */}
          {user.plan === 'PRO_BUSINESS' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300 border border-amber-500/20">
              <ShieldCheck className="h-3 w-3" />
              Pro Business
            </span>
          ) : user.plan === 'PRO_PERSONAL' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 border border-emerald-500/20">
              <Sparkles className="h-3 w-3" />
              Pro Personal
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/10 hover:opacity-95 transition-opacity"
            >
              <Sparkles className="h-3 w-3" />
              Mejorar a Pro
            </button>
          )}

          {/* User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 rounded-full border border-slate-800 bg-slate-900/80 p-1 pr-3 hover:border-slate-700 transition-colors"
            >
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user.nombre}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-700"
              />
              <span className="hidden sm:inline text-xs font-medium text-slate-200 max-w-[120px] truncate">
                {user.nombre}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl">
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-semibold text-white truncate">{user.nombre}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenUpgradeModal();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Planes y Facturación</span>
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
