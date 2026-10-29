// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { AsyncReportModal } from '@/components/reports/async-report-modal';
import { formatCurrency } from '@/lib/utils';

export default function HomePage() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'business'>('personal');

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* 1. Header & Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 font-bold text-white shadow-md shadow-primary/25">
              W
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-foreground">WhatUSpend</span>
              <span className="ml-2 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                SaaS v1.0
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#radar" className="hover:text-foreground transition">Radar de Fugas</a>
            <a href="#recurrentes" className="hover:text-foreground transition">Suscripciones</a>
            <a href="#metas" className="hover:text-foreground transition">Metas</a>
            <a href="#reportes" className="hover:text-foreground transition">Reportes Async</a>
            <a href="#planes" className="hover:text-foreground transition">Planes</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition shadow-sm"
            >
              <span>📑</span> Exportar Demo
            </button>
            <a
              href="/dashboard"
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-md shadow-primary/25 hover:opacity-90 transition"
            >
              Entrar al Dashboard →
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground mb-8 backdrop-blur-sm shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Nuevo: Reportes Asíncronos vía WebSockets & Email
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
              Toma el control absoluto de tus gastos personales y de tu empresa con{' '}
              <span className="bg-gradient-to-r from-primary via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                WhatUSpend
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground">
              Detecta fugas invisibles de dinero, identifica cobros recurrentes olvidados, proyecta metas
              inteligentes y descarga reportes contables sin bloquear tu navegación.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="/dashboard"
                className="rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:opacity-95 transition"
              >
                Comenzar Gratis (Sin tarjeta)
              </a>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-secondary transition shadow-sm"
              >
                Probar Generación de Reporte Async
              </button>
            </div>
          </div>

          {/* Interactive Live Preview Card */}
          <div className="mx-auto mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Espacio:</span>
                  <div className="flex rounded-xl bg-secondary p-1">
                    <button
                      onClick={() => setActiveTab('personal')}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                        activeTab === 'personal' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                      }`}
                    >
                      Finanzas Personales
                    </button>
                    <button
                      onClick={() => setActiveTab('business')}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                        activeTab === 'business' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                      }`}
                    >
                      Modo Empresa (PRO)
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Balance mensual</span>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {activeTab === 'personal' ? formatCurrency(14250) : formatCurrency(94300)}
                  </p>
                </div>
              </div>

              {/* Differentiating Feature #1: Money Leak Radar */}
              <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 text-lg">
                    🚨
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-amber-400">Radar de Fugas de Dinero Activo</h4>
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                        +38% incremento
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Gastaste un <strong className="text-foreground">38% más en Restaurantes & Cafeterías</strong> este
                      mes ($1,420 MXN adicionales respecto a tu promedio). Podrías ahorrar aprox.{' '}
                      <strong className="text-emerald-400">$1,000 MXN</strong> reduciendo 2 salidas no planificadas.
                    </p>
                  </div>
                </div>
              </div>

              {/* KPIs Grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-border bg-background/50 p-4">
                  <span className="text-xs text-muted-foreground">Suscripciones Activas</span>
                  <p className="text-lg font-bold text-foreground mt-1">6 detectadas</p>
                  <span className="text-[11px] text-muted-foreground">Próximo cobro: Netflix en 3 días</span>
                </div>

                <div className="rounded-2xl border border-border bg-background/50 p-4">
                  <span className="text-xs text-muted-foreground">Meta: Fondo de Emergencia</span>
                  <p className="text-lg font-bold text-foreground mt-1">45% completado</p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[45%]" />
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background/50 p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground">Exportación Asíncrona</span>
                    <p className="text-xs font-semibold text-foreground mt-1">HTTP 200 Inmediato + WebSocket Push</p>
                  </div>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="mt-2 text-xs font-semibold text-primary hover:underline text-left"
                  >
                    Abrir Generador de Reporte →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Pricing Section */}
        <section id="planes" className="py-20 border-t border-border/60 bg-card/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Planes Transparentes y Escalables</h2>
              <p className="mt-4 text-sm text-muted-foreground">
                Comienza gratis para tus gastos diarios o sube a PRO para gestionar tu empresa y acceder a IA.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="rounded-3xl border border-border bg-card p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-foreground">FREE</h3>
                  <p className="text-xs text-muted-foreground mt-1">Para personas que inician a ordenar sus finanzas.</p>
                  <p className="text-3xl font-extrabold text-foreground mt-6">$0 <span className="text-xs font-normal text-muted-foreground">/ siempre</span></p>
                  <ul className="mt-6 space-y-3 text-xs text-muted-foreground">
                    <li>✓ Registro ilimitado de gastos personales</li>
                    <li>✓ Dashboard financiero básico</li>
                    <li>✓ Exportación PDF y Excel estándar</li>
                    <li>✓ Hasta 10 categorías</li>
                    <li>✓ Radar de fugas básico</li>
                    <li className="text-muted-foreground/60">✗ Sin modo multiempresa</li>
                    <li className="text-muted-foreground/60">✗ 2 Banners no intrusivos</li>
                  </ul>
                </div>
                <a href="/dashboard" className="mt-8 block text-center rounded-xl border border-border py-2.5 text-xs font-semibold hover:bg-secondary transition">
                  Empezar Gratis
                </a>
              </div>

              {/* Pro Personal */}
              <div className="relative rounded-3xl border-2 border-primary bg-card p-8 flex flex-col justify-between shadow-xl">
                <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                  Más Popular
                </span>
                <div>
                  <h3 className="text-lg font-bold text-foreground">PRO PERSONAL</h3>
                  <p className="text-xs text-muted-foreground mt-1">Para usuarios que quieren maximizar su ahorro.</p>
                  <p className="text-3xl font-extrabold text-foreground mt-6">$4.99 <span className="text-xs font-normal text-muted-foreground">USD / mes ($99 MXN)</span></p>
                  <ul className="mt-6 space-y-3 text-xs text-muted-foreground">
                    <li>✓ Todo lo del plan Free</li>
                    <li>✓ Radar de Fugas de Dinero en tiempo real</li>
                    <li>✓ Detección automática de suscripciones</li>
                    <li>✓ Metas inteligentes con simulador de escenarios</li>
                    <li>✓ Categorías y etiquetas ilimitadas</li>
                    <li>✓ IA Financiera con recomendaciones y resúmenes</li>
                    <li>✓ <strong>100% Libre de anuncios</strong></li>
                  </ul>
                </div>
                <a href="/dashboard" className="mt-8 block text-center rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-md shadow-primary/25 hover:opacity-90 transition">
                  Prueba 14 días gratis
                </a>
              </div>

              {/* Pro Business */}
              <div className="rounded-3xl border border-border bg-card p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-foreground">PRO BUSINESS</h3>
                  <p className="text-xs text-muted-foreground mt-1">Para PyMEs, agencias y negocios en crecimiento.</p>
                  <p className="text-3xl font-extrabold text-foreground mt-6">$14.99 <span className="text-xs font-normal text-muted-foreground">USD / mes ($299 MXN)</span></p>
                  <ul className="mt-6 space-y-3 text-xs text-muted-foreground">
                    <li>✓ Todo lo de Pro Personal</li>
                    <li>✓ <strong>Empresas Ilimitadas</strong> (Multi-empresa)</li>
                    <li>✓ Hasta 10 colaboradores con roles (Admin, Colaborador)</li>
                    <li>✓ Control de folios fiscales y comprobantes</li>
                    <li>✓ Reportes ejecutivos para contabilidad en ZIP</li>
                    <li>✓ Soporte prioritario 24/7</li>
                    <li>✓ <strong>100% Libre de anuncios</strong></li>
                  </ul>
                </div>
                <a href="/dashboard" className="mt-8 block text-center rounded-xl border border-border py-2.5 text-xs font-semibold hover:bg-secondary transition">
                  Contactar / Probar Business
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p>© 2026 WhatUSpend. Todos los derechos reservados. Diseñado con Clean Architecture, Next.js 15 y Supabase.</p>
      </footer>

      {/* 5. Asynchronous Report Generator Dialog & Notification Pill */}
      <AsyncReportModal
        userId="demo-user-12345"
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}

