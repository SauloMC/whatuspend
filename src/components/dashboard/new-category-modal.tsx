// src/components/dashboard/new-category-modal.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategoryAction } from '@/app/actions/categories';
import { X, Loader2, Tag, AlertCircle } from 'lucide-react';

interface NewCategoryModalProps {
  userId: string;
  empresaId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#64748B', // Slate
];

export function NewCategoryModal({
  userId,
  empresaId,
  isOpen,
  onClose,
}: NewCategoryModalProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [color, setColor] = useState('#3B82F6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nombre.trim() || nombre.trim().length < 2) {
      setErrorMsg('El nombre debe tener al menos 2 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createCategoryAction(userId, {
        nombre: nombre.trim(),
        tipo,
        color,
        icono: 'tag',
        empresaId: empresaId || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'No se pudo crear la categoría');
        setIsSubmitting(false);
        return;
      }

      setNombre('');
      setIsSubmitting(false);
      onClose();
      router.refresh();
    } catch (err) {
      setErrorMsg('Ocurrió un error inesperado');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Nueva Categoría</h2>
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
              Nombre de la categoría *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Cursos y Certificaciones o Cafés"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tipo de flujo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipo('EXPENSE')}
                className={`rounded-lg py-2 text-xs font-medium border transition-colors ${
                  tipo === 'EXPENSE'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Gasto (Egreso)
              </button>
              <button
                type="button"
                onClick={() => setTipo('INCOME')}
                className={`rounded-lg py-2 text-xs font-medium border transition-colors ${
                  tipo === 'INCOME'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Ingreso (Entrada)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Color identificador
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-400 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creando...</span>
                </>
              ) : (
                <span>Crear Categoría</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
