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
import {
  FileText,
  Table,
  X,
  Download,
  Check,
  Loader2,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

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

  const currentReportMetadata =
    FINANCIAL_REPORTS_CATALOG.find((r) => r.id === selectedReportId) ||
    FINANCIAL_REPORTS_CATALOG[0];
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
      alert('Este reporte está disponible en el plan Pro.');
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
        onClose();
      } else {
        alert(result.error || 'No se pudo generar el reporte.');
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
      {/* 1. Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <div>
                <h3 className="text-base font-semibold text-foreground">Reportes financieros</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Formatos de análisis contable y financiero exportables en PDF o Excel.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
              
              {/* Left Column: Report List */}
              <div className="md:col-span-7 border-r border-border flex flex-col overflow-hidden bg-background/40">
                {/* Filter Tabs */}
                <div className="p-3 border-b border-border flex gap-1.5">
                  <button
                    onClick={() => setActiveTabFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeTabFilter === 'ALL'
                        ? 'bg-secondary text-foreground font-semibold shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Todos (20)
                  </button>
                  <button
                    onClick={() => setActiveTabFilter('FREE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeTabFilter === 'FREE'
                        ? 'bg-secondary text-foreground font-semibold shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Gratuitos (5)
                  </button>
                  <button
                    onClick={() => setActiveTabFilter('PRO')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activeTabFilter === 'PRO'
                        ? 'bg-secondary text-foreground font-semibold shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Pro (15)
                  </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                  {filteredReports.map((report) => {
                    const isSelected = report.id === selectedReportId;
                    const isFree = report.tier === 'FREE';

                    return (
                      <button
                        key={report.id}
                        type="button"
                        onClick={() => setSelectedReportId(report.id)}
                        className={`w-full text-left p-3 rounded-xl border transition flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-transparent hover:bg-secondary/60'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground">{report.nombre}</span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[10px] font-medium ${
                                isFree
                                  ? 'bg-secondary text-muted-foreground'
                                  : 'bg-primary/10 text-primary'
                              }`}
                            >
                              {isFree ? 'Gratis' : 'Pro'}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {report.descripcionCorta}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/70 shrink-0">
                          {report.categoria}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Selected Report Details & Action */}
              <div className="md:col-span-5 p-6 flex flex-col justify-between overflow-y-auto bg-card">
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {currentReportMetadata.categoria}
                    </span>
                    <h4 className="text-sm font-semibold text-foreground mt-1">
                      {currentReportMetadata.nombre}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {currentReportMetadata.descripcionCorta}
                    </p>
                  </div>

                  {/* Criteria box */}
                  <div className="rounded-xl border border-border bg-secondary/30 p-3.5 space-y-1">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Criterio de análisis
                    </span>
                    <p className="text-xs text-foreground/90 leading-relaxed font-normal">
                      {currentReportMetadata.fundamentoExperto}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div>
                    <span className="text-xs font-medium text-foreground">Métricas calculadas:</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {currentReportMetadata.metricasClave.map((m, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Format Selector */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-2">Formato</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormato(ReportFormat.PDF)}
                        className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium border transition ${
                          formato === ReportFormat.PDF
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormato(ReportFormat.EXCEL)}
                        className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium border transition ${
                          formato === ReportFormat.EXCEL
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        <Table className="h-3.5 w-3.5" />
                        <span>Excel</span>
                      </button>
                    </div>
                  </div>

                  {/* Email option */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="reportEmailCheck"
                      checked={enviarEmail}
                      onChange={(e) => setEnviarEmail(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <label htmlFor="reportEmailCheck" className="text-xs text-muted-foreground cursor-pointer">
                      Enviar enlace de descarga por correo
                    </label>
                  </div>
                </div>

                {/* Footer action */}
                <div className="pt-5 border-t border-border mt-5">
                  {isLockedForUser ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground text-center">
                        Este reporte requiere una suscripción Pro.
                      </p>
                      <a
                        href="/#planes"
                        onClick={onClose}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Actualizar a Pro</span>
                      </a>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <span>Generar reporte</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Notification Pill */}
      {activeJob && activeJob.estado !== 'COMPLETED' && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-card border border-border p-3.5 shadow-xl backdrop-blur-md">
          <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-medium text-foreground">Generando reporte...</p>
              <span className="text-[10px] font-mono text-muted-foreground">{activeJob.progreso}%</span>
            </div>
            <div className="h-1 w-44 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${Math.max(10, activeJob.progreso)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Success Toast */}
      {isCompletedToastVisible && activeJob?.archivoUrl && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-card border border-border p-3.5 shadow-xl backdrop-blur-md">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-medium text-foreground">Reporte listo</h4>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{activeJob.archivoNombre || 'Descarga disponible'}</p>
          </div>
          <a
            href={activeJob.archivoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismissToast}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition ml-2"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Descargar</span>
          </a>
          <button
            onClick={dismissToast}
            className="text-muted-foreground hover:text-foreground transition p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
