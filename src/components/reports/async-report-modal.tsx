// src/components/reports/async-report-modal.tsx
'use client';

import React, { useState } from 'react';
import { requestAsyncReportAction } from '@/app/actions/reports';
import { useReportRealtime } from '@/features/reports/hooks/use-report-realtime';

interface AsyncReportModalProps {
  userId: string;
  empresaId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AsyncReportModal({ userId, empresaId, isOpen, onClose }: AsyncReportModalProps) {
  const [formato, setFormato] = useState<'PDF' | 'EXCEL'>('PDF');
  const [tipo, setTipo] = useState<'PERSONAL_EXPENSES' | 'COMPANY_EXPENSES' | 'ANNUAL_SUMMARY'>('PERSONAL_EXPENSES');
  const [enviarEmail, setEnviarEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { activeJob, trackJob, isCompletedToastVisible, dismissToast } = useReportRealtime(userId);

  if (!isOpen && !activeJob && !isCompletedToastVisible) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      const result = await requestAsyncReportAction(userId, {
        tipo,
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
      {/* 1. Modal Dialog for Configuration */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Exportar Reporte Financiero</h3>
                <p className="text-xs text-muted-foreground">
                  Procesamiento en segundo plano con notificación en tiempo real.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerate} className="mt-5 space-y-5">
              {/* Scope Selection */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Tipo de Reporte
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as any)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="PERSONAL_EXPENSES">Gastos Personales (Mes en curso)</option>
                  <option value="ANNUAL_SUMMARY">Resumen Ejecutivo Anual</option>
                  {empresaId && <option value="COMPANY_EXPENSES">Gastos de Empresa (Corporativo)</option>}
                </select>
              </div>

              {/* Format Selection (Pill Buttons) */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Formato de Salida
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormato('PDF')}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium border transition ${
                      formato === 'PDF'
                        ? 'border-primary bg-primary/10 text-primary shadow-sm font-semibold'
                        : 'border-border bg-background text-muted-foreground hover:border-input'
                    }`}
                  >
                    <span>📄</span> PDF Ejecutivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormato('EXCEL')}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium border transition ${
                      formato === 'EXCEL'
                        ? 'border-primary bg-primary/10 text-primary shadow-sm font-semibold'
                        : 'border-border bg-background text-muted-foreground hover:border-input'
                    }`}
                  >
                    <span>📊</span> Excel (.xlsx)
                  </button>
                </div>
              </div>

              {/* Email Option Checkbox */}
              <div className="flex items-start gap-3 rounded-xl bg-secondary/50 p-3.5 border border-border/50">
                <input
                  type="checkbox"
                  id="emailNotification"
                  checked={enviarEmail}
                  onChange={(e) => setEnviarEmail(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="emailNotification" className="text-xs text-foreground cursor-pointer leading-relaxed">
                  <span className="font-medium">Notificarme por correo electrónico</span>
                  <br />
                  <span className="text-muted-foreground">
                    Te enviaremos un enlace de descarga seguro si cierras la pestaña o navegas a otra sección.
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/20 hover:opacity-90 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Iniciando...' : 'Generar en Segundo Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Floating Realtime Notification Pill (Non-blocking Bottom Right) */}
      {activeJob && activeJob.estado !== 'COMPLETED' && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-card border border-border p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4">
          <div className="relative flex h-8 w-8 items-center justify-center">
            <span className="animate-spin text-primary">⚙️</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold text-foreground">Procesando reporte en cola...</p>
              <span className="text-[10px] font-mono font-medium text-primary">{activeJob.progreso}%</span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${Math.max(10, activeJob.progreso)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Puedes continuar usando la app con normalidad.</p>
          </div>
        </div>
      )}

      {/* 3. Success Notification Toast with Instant Download Button */}
      {isCompletedToastVisible && activeJob?.archivoUrl && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/30 p-4 shadow-2xl text-white backdrop-blur-md animate-in slide-in-from-bottom-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 text-lg">
            ✓
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-200">¡Tu reporte está listo!</h4>
            <p className="text-[11px] text-emerald-300/80">{activeJob.archivoNombre || 'Reporte generado con éxito'}</p>
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

