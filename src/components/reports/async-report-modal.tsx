// src/components/reports/async-report-modal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { requestAsyncReportAction } from '@/app/actions/reports';
import { useReportRealtime } from '@/features/reports/hooks/use-report-realtime';
import {
  FINANCIAL_REPORTS_CATALOG,
} from '@/domain/services/financial-reports-catalog';
import { SAMPLE_REPORTS_DATA } from '@/domain/services/report-sample-data';
import { ReportFormat, ReportType } from '@prisma/client';
import {
  FileText,
  Table,
  X,
  Download,
  Check,
  Loader2,
  Sparkles,
  Eye,
  Info,
} from 'lucide-react';

interface AsyncReportModalProps {
  userId: string;
  empresaId?: string;
  userPlan?: 'FREE' | 'PRO_PERSONAL' | 'PRO_BUSINESS';
  isOpen: boolean;
  onClose: () => void;
  initialReportId?: ReportType;
}

export function AsyncReportModal({
  userId,
  empresaId,
  userPlan = 'FREE',
  isOpen,
  onClose,
  initialReportId,
}: AsyncReportModalProps) {
  const [selectedReportId, setSelectedReportId] = useState<ReportType>(
    initialReportId || 'ESTADO_INGRESOS_GASTOS_BASICO'
  );
  const [formato, setFormato] = useState<ReportFormat>(ReportFormat.PDF);
  const [enviarEmail, setEnviarEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'FREE' | 'PRO'>('ALL');
  const [viewMode, setViewMode] = useState<'CRITERIA' | 'PREVIEW'>('PREVIEW');

  // Sincroniza el reporte inicial seleccionado cuando el usuario abre el modal desde cualquier tarjeta
  useEffect(() => {
    if (initialReportId) {
      setSelectedReportId(initialReportId);
      const meta = FINANCIAL_REPORTS_CATALOG.find((r) => r.id === initialReportId);
      if (meta) {
        if (activeTabFilter === 'FREE' && meta.tier === 'PRO') {
          setActiveTabFilter('ALL');
        } else if (activeTabFilter === 'PRO' && meta.tier === 'FREE') {
          setActiveTabFilter('ALL');
        }
      }
    }
  }, [initialReportId, isOpen]);

  const { activeJob, trackJob, isCompletedToastVisible, dismissToast } = useReportRealtime(userId);

  if (!isOpen && !activeJob && !isCompletedToastVisible) return null;

  const currentReportMetadata =
    FINANCIAL_REPORTS_CATALOG.find((r) => r.id === selectedReportId) ||
    FINANCIAL_REPORTS_CATALOG[0];
  const isProReport = currentReportMetadata.tier === 'PRO';
  const isGuestOrDemo = !userId || userId === 'demo-guest' || userId.startsWith('demo-');
  const isLockedForRealData = !isGuestOrDemo && isProReport && userPlan === 'FREE';

  const sampleData =
    SAMPLE_REPORTS_DATA[selectedReportId] ||
    SAMPLE_REPORTS_DATA.ESTADO_INGRESOS_GASTOS_BASICO!;

  const filteredReports = FINANCIAL_REPORTS_CATALOG.filter((r) => {
    if (activeTabFilter === 'FREE') return r.tier === 'FREE';
    if (activeTabFilter === 'PRO') return r.tier === 'PRO';
    return true;
  });

  // Downloads REAL .pdf or .xlsx file from server route
  const triggerSampleDownload = (targetFormato: ReportFormat = formato) => {
    const url = `/api/reports/download-sample?tipo=${selectedReportId}&formato=${targetFormato}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReportId.toLowerCase()}_ejemplo.${targetFormato.toLowerCase() === 'excel' ? 'xlsx' : 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    // In demo / guest mode, download real sample file in chosen format (PDF or Excel)
    if (isGuestOrDemo) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        triggerSampleDownload(formato);
        onClose();
      }, 500);
      return;
    }

    if (isLockedForRealData) {
      alert('Para procesar este reporte con los datos reales de tu cuenta, actualiza al plan Pro.');
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <div>
                <h3 className="text-base font-semibold text-foreground">Catálogo de reportes</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Formatos de análisis contable y financiero exportables en PDF y Excel con datos de muestra.
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
              
              {/* Left Column: Report List (5 cols) */}
              <div className="md:col-span-5 border-r border-border flex flex-col overflow-hidden bg-background/40">
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
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Details & Interactive Sample Data Inspector (7 cols) */}
              <div className="md:col-span-7 flex flex-col justify-between overflow-y-auto bg-card">
                <div className="p-6 space-y-5">
                  
                  {/* Header of selected report */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {currentReportMetadata.categoria}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                            currentReportMetadata.tier === 'FREE'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {currentReportMetadata.tier === 'FREE' ? 'Nivel Gratuito' : 'Nivel Pro'}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-foreground mt-0.5">
                        {currentReportMetadata.nombre}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentReportMetadata.descripcionCorta}
                      </p>
                    </div>

                    <div className="flex rounded-lg bg-secondary p-1 shrink-0 border border-border/50">
                      <button
                        type="button"
                        onClick={() => setViewMode('PREVIEW')}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                          viewMode === 'PREVIEW'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Eye className="h-3 w-3" />
                        <span>Vista previa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('CRITERIA')}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                          viewMode === 'CRITERIA'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Info className="h-3 w-3" />
                        <span>Criterio</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Interactive Sample Data Preview */}
                  {viewMode === 'PREVIEW' && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">
                          Estructura con datos de muestra:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => triggerSampleDownload(ReportFormat.PDF)}
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-medium"
                          >
                            <Download className="h-3 w-3" />
                            <span>Bajar PDF</span>
                          </button>
                          <span className="text-muted-foreground/40">•</span>
                          <button
                            type="button"
                            onClick={() => triggerSampleDownload(ReportFormat.EXCEL)}
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                          >
                            <Download className="h-3 w-3" />
                            <span>Bajar Excel</span>
                          </button>
                        </div>
                      </div>

                      {/* Sample Data Table */}
                      <div className="rounded-xl border border-border overflow-hidden bg-background/50">
                        <div className="overflow-x-auto max-h-52">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-secondary/70 border-b border-border text-[11px] font-medium text-muted-foreground sticky top-0">
                              <tr>
                                {sampleData.columnas.map((col, idx) => (
                                  <th key={idx} className="px-3 py-2 font-medium">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 font-mono text-[11px]">
                              {sampleData.filas.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-secondary/30 transition">
                                  {sampleData.columnas.map((col, cIdx) => (
                                    <td key={cIdx} className="px-3 py-2 text-foreground/90 whitespace-nowrap">
                                      {row[col] ?? '—'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Summary totals footer */}
                        <div className="p-3 bg-secondary/40 border-t border-border flex flex-wrap gap-4 text-xs">
                          {Object.entries(sampleData.totales).map(([k, v], i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-muted-foreground text-[11px]">{k}:</span>
                              <span className="font-semibold text-foreground">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-lg bg-secondary/30 p-2.5 text-[11px] text-muted-foreground leading-relaxed">
                        <strong className="text-foreground font-medium">Diagnóstico del análisis: </strong>
                        {sampleData.conclusionExperto}
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Technical Criteria & Explanations */}
                  {viewMode === 'CRITERIA' && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-1.5">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          Fundamento metodológico
                        </span>
                        <p className="text-xs text-foreground/90 leading-relaxed">
                          {currentReportMetadata.fundamentoExperto}
                        </p>
                      </div>

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
                    </div>
                  )}

                  {/* Format selector */}
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-foreground mb-2">
                      Formato a descargar
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormato(ReportFormat.PDF)}
                        className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium border transition ${
                          formato === ReportFormat.PDF
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        <FileText className="h-4 w-4" />
                        <span>Documento PDF (.pdf)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormato(ReportFormat.EXCEL)}
                        className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium border transition ${
                          formato === ReportFormat.EXCEL
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        <Table className="h-4 w-4" />
                        <span>Libro Excel (.xlsx)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="p-6 border-t border-border bg-card">
                  {isGuestOrDemo ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Generando archivo...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5" />
                            <span>
                              Descargar reporte de ejemplo en {formato === ReportFormat.PDF ? 'PDF' : 'Excel'}
                            </span>
                          </>
                        )}
                      </button>
                      <p className="text-[11px] text-muted-foreground text-center">
                        Descarga libre con datos de prueba. Los usuarios registrados pueden generar reportes automáticos con sus gastos reales.
                      </p>
                    </div>
                  ) : isLockedForRealData ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Generar con datos reales requiere plan Pro</span>
                        <span className="font-semibold text-foreground">$4.99 USD / mes</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => triggerSampleDownload(formato)}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium hover:bg-secondary transition"
                        >
                          <Download className="h-3 w-3" />
                          <span>Bajar muestra</span>
                        </button>
                        <a
                          href="/#planes"
                          onClick={onClose}
                          className="flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Actualizar a Pro</span>
                        </a>
                      </div>
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
                        <span>
                          Generar reporte con mis datos ({formato === ReportFormat.PDF ? 'PDF' : 'Excel'})
                        </span>
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
              <p className="text-xs font-medium text-foreground">Generando archivo...</p>
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
          <button
            onClick={() => {
              triggerSampleDownload(formato);
              dismissToast();
            }}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition ml-2"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Descargar</span>
          </button>
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
