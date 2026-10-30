// src/components/dashboard/new-company-expense-modal.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCompanyExpenseAction } from '@/app/actions/companies';
import { DemoCategory } from '@/domain/demo/demo-store';
import { X, Loader2, Building, AlertCircle } from 'lucide-react';

interface NewCompanyExpenseModalProps {
  userId: string;
  companyId: string;
  companyName: string;
  categories: DemoCategory[];
  isOpen: boolean;
  onClose: () => void;
}

export function NewCompanyExpenseModal({
  userId,
  companyId,
  companyName,
  categories,
  isOpen,
  onClose,
}: NewCompanyExpenseModalProps) {
  const router = useRouter();
  const [monto, setMonto] = useState('');
  const [moneda, setMoneda] = useState('MXN');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState(categories[0]?.id || '');
  const [departamento, setDepartamento] = useState('Operaciones');
  const [facturaFolio, setFacturaFolio] = useState('');
  const [metodoPago, setMetodoPago] = useState('BANK_TRANSFER');
  const [notas, setNotas] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedMonto = parseFloat(monto);
    if (isNaN(parsedMonto) || parsedMonto <= 0) {
      setErrorMsg('Ingresa un monto válido mayor a 0');
      return;
    }
    if (!descripcion.trim()) {
      setErrorMsg('La descripción es obligatoria');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createCompanyExpenseAction(userId, companyId, {
        monto: parsedMonto,
        moneda,
        descripcion: descripcion.trim(),
        categoriaId: categoriaId || undefined,
        departamento: departamento.trim() || undefined,
        facturaFolio: facturaFolio.trim() || undefined,
        metodoPago,
        notas: notas.trim() || undefined,
        fecha,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'No se pudo guardar el gasto empresarial');
        setIsSubmitting(false);
        return;
      }

      setMonto('');
      setDescripcion('');
      setFacturaFolio('');
      setNotas('');
      setIsSubmitting(false);
      onClose();
      router.refresh();
    } catch (err) {
      setErrorMsg('Ocurrió un error inesperado al registrar el gasto');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-semibold text-white">Gasto Empresarial</h2>
              <p className="text-[11px] text-slate-400">{companyName}</p>
            </div>
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
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Monto *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/60 pl-8 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Moneda
              </label>
              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="MXN">MXN ($)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Descripción del gasto empresarial *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Servidores Cloud AWS, Campaña de Publicidad o Compra Insumos"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Departamento / Centro de Costo
              </label>
              <select
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Operaciones">Operaciones / Logística</option>
                <option value="TI / Tecnología">TI / Tecnología</option>
                <option value="Marketing">Marketing / Ventas</option>
                <option value="Administración">Administración / Legal</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Producción">Producción / Almacén</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Folio Fiscal / Factura SAT (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. SAT-FAC-99120"
                value={facturaFolio}
                onChange={(e) => setFacturaFolio(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm font-mono text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Categoría
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Método de Pago
              </label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="BANK_TRANSFER">Transferencia / SPEI Bancario</option>
                <option value="CREDIT_CARD">Tarjeta Corporativa</option>
                <option value="DEBIT_CARD">Tarjeta Débito</option>
                <option value="CASH">Caja Chica / Efectivo</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Fecha del gasto
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Notas y observaciones de auditoría (opcional)
            </label>
            <input
              type="text"
              placeholder="Detalles sobre deducibilidad, proyecto o proveedor"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
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
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Registrar Gasto</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

