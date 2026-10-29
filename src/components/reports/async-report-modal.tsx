// src/components/reports/async-report-modal.tsx
'use client';

import React, { useState } from 'react';
import { requestAsyncReportAction } from '@/app/actions/reports';
import { useReportRealtime } from '@/features/reports/hooks/use-report-realtime';
import {
  FINANCIAL_REPORTS_CATALOG,
  FinancialReportMetadata,
} from '@/domain/services/financial-reports-catalog';
import { ReportFormat, ReportType } from '@prisma/client';

interface AsyncReportModalProps {
  userId: string;
  empresaId?: string;
  userPlan?: 'FREE' | 'PRO_PERSONAL' | 'PRO_BUSINESS';
  isOpen: boolean;
  onClose: () => void;
}

export function AsyncReportModal({
  userId,
  empresaId,
  userPlan = 'FREE',
  isOpen,
  onClose,
}: AsyncReportModalProps) {
  const [selectedReportId, setSelectedReportId] = useState<ReportType>('ESTADO_INGRESOS_GASTOS_BASICO');
  const [formato, setFormato] = useState<ReportFormat>(ReportFormat.PDF);
  const [enviarEmail, setEnviarEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'FREE' | 'PRO'>('ALL');

  const { activeJob, trackJob, isCompletedToastVisible, dismissToast } = useReportRealtime(userId);

  if (!isOpen && !activeJob && !isCompletedToastVisible) return null;

  const currentReportMetadata = FINANCIAL_REPORTS_CATALOG.find((r) => r.id === selectedReportId) || FINANCIAL_REPORTS_CATALOG[0];
  const isProReport = currentReportMetadata.tier === 'PRO';
  const isLockedForUser = isProReport && userPlan === 'FREE';

  const filteredReports = FINANCIAL_REPORTS_CATALOG.filter((r) => {
    if (activeTabFilter === 'FREE') return r.tier === 'FREE';
    if (activeTabFilter === 'PRO') return r.tier === 'PRO';
    return true;
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedForUser) {
      alert('Este reporte avanzado está disponible exclusivamente en el plan PRO. Mejora tu plan para acceder.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      const result = await requestAsyncReportAction(userId, {
        tipo: selectedReportId,
        formato,
        empresaId: empresaId || null,
        fechaInicio: firstDay,
        fechaFin: lastDay,
        enviarNotificacionEmail: enviarEmail,
        categoriaIds: [],
        incluirComprobantes: false,
      });

      if (result.success && result.jobId) {
        trackJob(result.jobId);
        onClose(); // Close modal immediately - user is free to navigate!
      } else {
        alert(result.error || 'Ocurrió un error al encolar el reporte.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 1. Modal Dialog for 20 Financial Reports */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-card border border-border shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-card">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-foreground">Catálogo de Salud Financiera</h3>
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    20 Reportes Expertos
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  5 Reportes en versión FREE + 15 Reportes de alta dirección, contabilidad y ratios en versión PRO.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
              >
                ✕
              </button>
            </div>

            {/* Body: Split Layout (List + Detail Inspector) */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
              
              {/* Left Column: Report List (7 cols) */}
              <div className="md:col-span-7 border-r border-border flex flex-col overflow-hidden bg-background/50">
                
                {/* Filter Tabs */}
                <div className="p-3 border-b border-border flex gap-2">
                  <button
                    onClick={() => setActiveTabFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeTabFilter === 'ALL' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Todos (20)
                  </button>
                  <button
                    onClick={() => setActiveTabFilter('FREE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeTabFilter === 'FREE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Plan FREE (5)
                  </button>
                  <button
                    onClick={() => setActiveTabFilter('PRO')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeTabFilter === 'PRO' ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    Plan PRO (15) ✨
                  </button>
                </div>

                {/* Scrollable list */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {filteredReports.map((report) => {
                    const isSelected = report.id === selectedReportId;
                    const isFree = report.tier === 'FREE';

                    return (
                      <button
                        key={report.id}
                        type="button"
                        onClick={() => setSelectedReportId(report.id)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border/60 bg-card hover:bg-secondary/70'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{report.nombre}</span>
                            {isFree ? (
                              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                                FREE
                              </span>
                            ) : (
                              <span className="rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400">
                                PRO ✨
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {report.descripcionCorta}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground/60">{report.categoria}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Selected Report Inspection & Generation Form (5 cols) */}
              <div className="md:col-span-5 p-6 flex flex-col justify-between overflow-y-auto bg-card">
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {currentReportMetadata.categoria}
                      </span>
                      {currentReportMetadata.tier === 'FREE' ? (
                        <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                          Incluido en FREE
                        </span>
                      ) : (
                        <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                          Exclusivo PRO
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-foreground mt-1">
                      {currentReportMetadata.nombre}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {currentReportMetadata.descripcionCorta}
                    </p>
                  </div>

                  {/* Expert rationale card */}
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 space-y-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                      💡 Fundamento Experto
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {currentReportMetadata.fundamentoExperto}
                    </p>
                  </div>

                  {/* Key Metrics */}
                  <div>
                    <span className="text-xs font-semibold text-foreground">Métricas que calcula:</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {currentReportMetadata.metricasClave.map((m, i) => (
                        <span
                          key={i}
                          className="rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Format selector */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-2">Formato de Descarga</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormato(ReportFormat.PDF)}
                        className={`rounded-xl py-2.5 text-xs font-semibold border transition ${
                          formato === ReportFormat.PDF
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        📄 PDF Ejecutivo
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormato(ReportFormat.EXCEL)}
                        className={`rounded-xl py-2.5 text-xs font-semibold border transition ${
                          formato === ReportFormat.EXCEL
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        📊 Excel (.xlsx)
                      </button>
                    </div>
                  </div>

                  {/* Email checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="reportEmailCheck"
                      checked={enviarEmail}
                      onChange={(e) => setEnviarEmail(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                    />
                    <label htmlFor="reportEmailCheck" className="text-xs text-muted-foreground cursor-pointer">
                      Avisarme por correo con enlace temporal
                    </label>
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="pt-6 border-t border-border mt-6">
                  {isLockedForUser ? (
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                        <p className="text-xs font-semibold text-amber-300">
                          Reporte disponible en WhatUSpend PRO
                        </p>
                      </div>
                      <a
                        href="/#planes"
                        onClick={onClose}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-500 py-3 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:opacity-90 transition"
                      >
                        Desbloquear 15 Reportes PRO →
                      </a>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:opacity-90 transition disabled:opacity-50"
                    >
                      {isSubmitting ? 'Iniciando generación...' : 'Generar en Segundo Plano (HTTP 200)'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Realtime Progress Notification Pill */}
      {activeJob && activeJob.estado !== 'COMPLETED' && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 rounded-2xl bg-card border border-border p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4">
          <div className="relative flex h-8 w-8 items-center justify-center">
            <span className="animate-spin text-primary">⚙️</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold text-foreground">Generando reporte contable...</p>
              <span className="text-[10px] font-mono font-bold text-primary">{activeJob.progreso}%</span>
            </div>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${Math.max(10, activeJob.progreso)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Puedes continuar navegando sin interrupción.</p>
          </div>
        </div>
      )}

      {/* 3. Success Toast with Instant Download Button */}
      {isCompletedToastVisible && activeJob?.archivoUrl && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/30 p-4 shadow-2xl text-white backdrop-blur-md animate-in slide-in-from-bottom-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 text-lg">
            ✓
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-200">¡Tu reporte está listo!</h4>
            <p className="text-[11px] text-emerald-300/80">{activeJob.archivoNombre || 'Archivo compilado exitosamente'}</p>
          </div>
          <a
            href={activeJob.archivoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismissToast}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-emerald-950 shadow-md hover:bg-emerald-400 transition"
          >
            <span>⬇</span> Descargar
          </a>
          <button
            onClick={dismissToast}
            className="text-xs text-emerald-400/60 hover:text-emerald-200 transition p-1"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
