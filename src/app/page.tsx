// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { AsyncReportModal } from '@/components/reports/async-report-modal';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { formatCurrency } from '@/lib/utils';
import {
  FileText,
  AlertCircle,
  TrendingDown,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  Wallet,
  Check,
} from 'lucide-react';

export default function HomePage() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'business'>('personal');

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20">
      {/* 1. Header & Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700 text-sm font-semibold text-zinc-100 shadow-sm">
              W
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-foreground">WhatUSpend</span>
              <span className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                Finanzas
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#funciones" className="hover:text-foreground transition">Funcionalidades</a>
            <a href="#reportes" className="hover:text-foreground transition">Reportes</a>
            <a href="#planes" className="hover:text-foreground transition">Planes</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-secondary transition shadow-sm"
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Ver reportes</span>
            </button>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
            >
              <span>Acceder</span>
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/50 px-3.5 py-1 text-xs text-muted-foreground mb-8 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Reportes contables con procesamiento en segundo plano
            </div>

            <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl text-foreground">
              Claridad y control sobre tus gastos personales y de empresa
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
              Registra consumos, detecta gastos duplicados o inusuales y obtén reportes financieros listos para contabilidad en PDF y Excel.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
              <div className="w-full sm:w-auto">
                <GoogleSignInButton label="Continuar con Google" redirectTo="/dashboard" />
              </div>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground hover:bg-secondary transition shadow-sm"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Explorar catálogo de 20 reportes</span>
              </button>
            </div>
          </div>

          {/* Interactive Live Preview Card */}
          <div className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground">Espacio:</span>
                  <div className="flex rounded-lg bg-secondary p-1 border border-border/50">
                    <button
                      onClick={() => setActiveTab('personal')}
                      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        activeTab === 'personal'
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      <span>Personal</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('business')}
                      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        activeTab === 'business'
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      <span>Empresa</span>
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Balance del periodo</span>
                  <p className="text-2xl font-semibold text-foreground tracking-tight">
                    {activeTab === 'personal' ? formatCurrency(14250) : formatCurrency(94300)}
                  </p>
                </div>
              </div>

              {/* Differentiating Feature #1: Spending Alert */}
              <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 sm:p-5">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-foreground">Variación en Restaurantes y Cafeterías</h4>
                      <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-500">
                        +38% respecto al mes anterior
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      El gasto en este rubro superó el promedio de los últimos 60 días por $1,420 MXN. Ajustar dos salidas semanales te permitiría retener aproximadamente $1,000 MXN mensuales.
                    </p>
                  </div>
                </div>
              </div>

              {/* KPIs Grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-medium">Suscripciones activas</span>
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xl font-semibold text-foreground">6 servicios</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Próximo cargo estimado en 3 días</p>
                </div>

                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-medium">Fondo de reserva</span>
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xl font-semibold text-foreground">45% completado</p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary w-[45%]" />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background/50 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-muted-foreground mb-2">
                      <span className="text-xs font-medium">Reportes contables</span>
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-xl font-semibold text-foreground">20 formatos</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Generación y descarga en PDF y Excel</p>
                  </div>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <span>Generar reporte</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Pricing Section */}
        <section id="planes" className="py-20 border-t border-border bg-secondary/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">Planes y suscripciones</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Inicia sin costo para tu gestión personal diaria o contrata el plan Pro para funciones empresariales y fiscales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <div className="rounded-2xl border border-border bg-card p-7 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">Gratuito</h3>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Uso personal
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Para control básico de ingresos y gastos individuales.</p>
                  <p className="text-3xl font-semibold text-foreground mt-6 tracking-tight">$0</p>
                  <ul className="mt-6 space-y-3 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-foreground shrink-0" />
                      <span>Registro de gastos personales</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-foreground shrink-0" />
                      <span>Dashboard de balance mensual</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-foreground shrink-0" />
                      <span>5 reportes financieros esenciales</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-foreground shrink-0" />
                      <span>Exportación en PDF y Excel</span>
                    </li>
                  </ul>
                </div>
                <a
                  href="/dashboard"
                  className="mt-8 block text-center rounded-xl border border-border py-2.5 text-xs font-medium hover:bg-secondary transition"
                >
                  Comenzar gratis
                </a>
              </div>

              {/* Pro Personal */}
              <div className="relative rounded-2xl border-2 border-primary bg-card p-7 flex flex-col justify-between shadow-md">
                <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-0.5 text-[11px] font-medium text-primary-foreground">
                  Recomendado
                </span>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">Pro Personal</h3>
                    <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-medium text-primary">
                      Individual
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Para quienes buscan optimizar su capacidad de ahorro.</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-foreground tracking-tight">$4.99</span>
                    <span className="text-xs text-muted-foreground">USD / mes ($99 MXN)</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-foreground">Todo lo incluido en el plan Gratuito</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Detección automática de cobros recurrentes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Simulador de metas de ahorro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-foreground">Acceso a los 20 reportes financieros</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Sin publicidad</span>
                    </li>
                  </ul>
                </div>
                <a
                  href="/dashboard"
                  className="mt-8 block text-center rounded-xl bg-primary py-2.5 text-xs font-medium text-primary-foreground shadow-sm hover:opacity-90 transition"
                >
                  Probar 14 días
                </a>
              </div>

              {/* Pro Business */}
              <div className="rounded-2xl border border-border bg-card p-7 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">Pro Empresa</h3>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Corporativo
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Para microempresas, despachos y equipos de trabajo.</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-foreground tracking-tight">$14.99</span>
                    <span className="text-xs text-muted-foreground">USD / mes ($299 MXN)</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-foreground shrink-0" />
                      <span className="text-foreground">Múltiples empresas independientes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-foreground shrink-0" />
                      <span>Hasta 10 colaboradores con roles y permisos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-foreground shrink-0" />
                      <span>Registro de folios fiscales y comprobantes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-foreground shrink-0" />
                      <span>Centros de costo por departamento</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-foreground shrink-0" />
                      <span>Sin publicidad</span>
                    </li>
                  </ul>
                </div>
                <a
                  href="/dashboard"
                  className="mt-8 block text-center rounded-xl border border-border py-2.5 text-xs font-medium hover:bg-secondary transition"
                >
                  Contactar ventas
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p>© 2026 WhatUSpend. Todos los derechos reservados.</p>
      </footer>

      {/* 5. Asynchronous Report Generator Modal */}
      <AsyncReportModal
        userId="demo-user-12345"
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
