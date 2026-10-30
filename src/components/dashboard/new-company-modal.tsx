// src/components/dashboard/new-company-modal.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCompanyAction } from '@/app/actions/companies';
import { X, Loader2, Building2, AlertCircle } from 'lucide-react';

interface NewCompanyModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onCompanyCreated?: (newCompanyId: string) => void;
}

export function NewCompanyModal({
  userId,
  isOpen,
  onClose,
  onCompanyCreated,
}: NewCompanyModalProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [rfcTaxId, setRfcTaxId] = useState('');
  const [giro, setGiro] = useState('');
  const [monedaBase, setMonedaBase] = useState('MXN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nombre.trim() || nombre.trim().length < 2) {
      setErrorMsg('El nombre de la empresa debe tener al menos 2 caracteres');
      return;
    }
    if (!rfcTaxId.trim() || rfcTaxId.trim().length < 8) {
      setErrorMsg('Ingresa un RFC o ID Fiscal válido (mínimo 8 caracteres)');
      return;
    }
    if (!giro.trim()) {
      setErrorMsg('El giro o sector empresarial es obligatorio');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createCompanyAction(userId, {
        nombre: nombre.trim(),
        rfcTaxId: rfcTaxId.trim().toUpperCase(),
        giro: giro.trim(),
        monedaBase,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'No se pudo crear la empresa');
        setIsSubmitting(false);
        return;
      }

      setNombre('');
      setRfcTaxId('');
      setGiro('');
      setIsSubmitting(false);
      onClose();
      if (res.data?.id && onCompanyCreated) {
        onCompanyCreated(res.data.id);
      }
      router.refresh();
    } catch (err) {
      setErrorMsg('Ocurrió un error inesperado al registrar la empresa');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">Registrar Nueva Empresa</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nombre de la Empresa o Razón Social *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Innovaciones Digitales S.A. de C.V."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                RFC / Tax ID Fiscal *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. IND200815AB3"
                value={rfcTaxId}
                onChange={(e) => setRfcTaxId(e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm font-mono text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Moneda Base
              </label>
              <select
                value={monedaBase}
                onChange={(e) => setMonedaBase(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="MXN">MXN (Pesos Mexicanos)</option>
                <option value="USD">USD (Dólares)</option>
                <option value="EUR">EUR (Euros)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Giro Comercial o Sector *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Tecnología, Consultoría, Comercio Minorista, Alimentos"
              value={giro}
              onChange={(e) => setGiro(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creando...</span>
                </>
              ) : (
                <span>Crear Empresa</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

