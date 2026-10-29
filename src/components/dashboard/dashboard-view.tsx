// src/components/dashboard/dashboard-view.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPersona,
  DemoExpense,
  DemoCompany,
  DemoCompanyExpense,
  DemoCategory,
  DemoSubscription,
  DemoGoal,
  DemoAlert,
} from '@/domain/demo/demo-store';
import { DashboardHeader } from './dashboard-header';
import { NewExpenseModal } from './new-expense-modal';
import { NewCompanyModal } from './new-company-modal';
import { NewCompanyExpenseModal } from './new-company-expense-modal';
import { NewCategoryModal } from './new-category-modal';
import { SubscriptionModal } from './subscription-modal';
import { AsyncReportModal } from '@/components/reports/async-report-modal';
import { deletePersonalExpenseAction } from '@/app/actions/expenses';
import {
  deleteCompanyAction,
  deleteCompanyExpenseAction,
} from '@/app/actions/companies';
import { deleteCategoryAction } from '@/app/actions/categories';
import { FINANCIAL_REPORTS_CATALOG } from '@/domain/services/financial-reports-catalog';
import { ReportType } from '@prisma/client';
import {
  LayoutDashboard,
  Receipt,
  Building2,
  Building,
  Tag,
  FileBarChart2,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Calendar,
  Lock,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Coins,
  DollarSign,
  PiggyBank,
} from 'lucide-react';

interface DashboardViewProps {
  user: UserPersona;
  initialExpenses: DemoExpense[];
  initialCompanies: DemoCompany[];
  initialCompanyExpenses: DemoCompanyExpense[];
  categories: DemoCategory[];
  subscriptions: DemoSubscription[];
  goals: DemoGoal[];
  alerts: DemoAlert[];
}

export function DashboardView({
  user,
  initialExpenses,
  initialCompanies,
  initialCompanyExpenses,
  categories,
  subscriptions,
  goals,
  alerts,
}: DashboardViewProps) {
  const router = useRouter();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'expenses' | 'companies' | 'company-expenses' | 'categories' | 'reports'
  >('overview');

  // Workspace context: 'personal' or companyId
  const [selectedWorkspace, setSelectedWorkspace] = useState<'personal' | string>('personal');

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isCompanyExpenseModalOpen, setIsCompanyExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<ReportType>('ESTADO_INGRESOS_GASTOS_BASICO');

  // Filters
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('ALL');
  const [companyExpenseDeptFilter, setCompanyExpenseDeptFilter] = useState('ALL');

  // Active Company details
  const activeCompany = initialCompanies.find((c) => c.id === selectedWorkspace);

  // Filtered Personal Expenses
  const filteredPersonalExpenses = initialExpenses.filter((e) => {
    const matchesSearch =
      e.descripcion.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      (e.notas && e.notas.toLowerCase().includes(expenseSearch.toLowerCase()));
    const matchesCat =
      expenseCategoryFilter === 'ALL' || e.categoriaId === expenseCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // Filtered Company Expenses
  const currentCompanyExpenses = initialCompanyExpenses.filter((e) =>
    selectedWorkspace !== 'personal' ? e.empresaId === selectedWorkspace : true
  );

  const filteredCompanyExpenses = currentCompanyExpenses.filter((e) => {
    if (companyExpenseDeptFilter === 'ALL') return true;
    return e.departamento === companyExpenseDeptFilter;
  });

  // Financial KPI calculations
  const totalPersonalSpent = initialExpenses.reduce((acc, curr) => acc + curr.monto, 0);
  const totalCompanySpent = currentCompanyExpenses.reduce((acc, curr) => acc + curr.monto, 0);
  const totalSubscriptionsMonthly = subscriptions
    .filter((s) => s.activa)
    .reduce((acc, curr) => acc + curr.monto, 0);

  // Delete Handlers
  const handleDeletePersonalExpense = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este gasto?')) return;
    await deletePersonalExpenseAction(id, user.id);
    router.refresh();
  };

  const handleDeleteCompany = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la empresa "${name}" y todos sus registros fiscales?`)) return;
    await deleteCompanyAction(id, user.id);
    if (selectedWorkspace === id) setSelectedWorkspace('personal');
    router.refresh();
  };

  const handleDeleteCompanyExpense = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este gasto empresarial?')) return;
    await deleteCompanyExpenseAction(id, selectedWorkspace);
    router.refresh();
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return;
    await deleteCategoryAction(id, user.id);
    router.refresh();
  };

  const handleOpenReport = (reportType: ReportType) => {
    setSelectedReportId(reportType);
    setIsReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. Global Header */}
      <DashboardHeader
        user={user}
        companies={initialCompanies}
        selectedWorkspace={selectedWorkspace}
        onSelectWorkspace={(ws) => {
          setSelectedWorkspace(ws);
          if (ws !== 'personal' && activeTab === 'expenses') {
            setActiveTab('company-expenses');
          }
        }}
        onOpenNewCompany={() => setIsCompanyModalOpen(true)}
        onOpenUpgradeModal={() => setIsSubscriptionModalOpen(true)}
      />

      {/* 2. Subheader Navigation Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-2.5 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-emerald-400" />
              <span>Resumen General</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'expenses'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Receipt className="h-4 w-4 text-cyan-400" />
              <span>Gastos Personales</span>
              <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
                {initialExpenses.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('companies')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'companies'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="h-4 w-4 text-amber-400" />
              <span>Empresas (B2B)</span>
              <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
                {initialCompanies.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('company-expenses')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'company-expenses'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Building className="h-4 w-4 text-indigo-400" />
              <span>Gastos Empresariales</span>
              <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
                {currentCompanyExpenses.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'categories'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Tag className="h-4 w-4 text-pink-400" />
              <span>Categorías</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileBarChart2 className="h-4 w-4 text-teal-400" />
              <span>Reportes (20)</span>
            </button>
          </nav>

          {/* Quick Context Action Button */}
          <div className="hidden sm:flex items-center gap-2">
            {activeTab === 'expenses' && (
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nuevo Gasto</span>
              </button>
            )}

            {activeTab === 'companies' && (
              <button
                type="button"
                onClick={() => setIsCompanyModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nueva Empresa</span>
              </button>
            )}

            {activeTab === 'company-expenses' && (
              <button
                type="button"
                onClick={() => {
                  if (initialCompanies.length === 0) {
                    setIsCompanyModalOpen(true);
                  } else {
                    setIsCompanyExpenseModalOpen(true);
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-400 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Gasto Empresarial</span>
              </button>
            )}

            {activeTab === 'categories' && (
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-pink-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-pink-500/20 hover:bg-pink-400 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nueva Categoría</span>
              </button>
            )}

            {activeTab === 'reports' && (
              <button
                type="button"
                onClick={() => handleOpenReport('ESTADO_INGRESOS_GASTOS_BASICO')}
                className="flex items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-teal-500/20 hover:bg-teal-400 transition-colors"
              >
                <FileBarChart2 className="h-3.5 w-3.5" />
                <span>Generar Reporte</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Content Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Total Gastos Personales */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Gastos Personales (Mes)</span>
                  <Receipt className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-white">
                    ${totalPersonalSpent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-slate-400">MXN</span>
                </div>
                <div className="mt-2 flex items-center text-[11px] text-slate-400">
                  <span>{initialExpenses.length} transacciones registradas</span>
                </div>
              </div>

              {/* Card 2: Total Gastos Empresa */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Gastos Empresariales B2B</span>
                  <Building2 className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-white">
                    ${totalCompanySpent.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-slate-400">MXN</span>
                </div>
                <div className="mt-2 flex items-center text-[11px] text-slate-400">
                  <span>{currentCompanyExpenses.length} folios y facturas fiscales</span>
                </div>
              </div>

              {/* Card 3: Suscripciones Recurrentes */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Suscripciones Mensuales</span>
                  <CreditCard className="h-4 w-4 text-amber-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-white">
                    ${totalSubscriptionsMonthly.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-slate-400">MXN / mes</span>
                </div>
                <div className="mt-2 flex items-center text-[11px] text-amber-400/90">
                  <span>{subscriptions.length} servicios activos monitoreados</span>
                </div>
              </div>

              {/* Card 4: Tasa de Ahorro Proyectada */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-sm">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Tasa de Ahorro / Metas</span>
                  <PiggyBank className="h-4 w-4 text-teal-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-emerald-400">
                    28.4%
                  </span>
                  <span className="text-xs text-slate-400">de ingresos netos</span>
                </div>
                <div className="mt-2 flex items-center text-[11px] text-emerald-400">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  <span>Por encima de la meta del 20%</span>
                </div>
              </div>
            </div>

            {/* Money Leak Radar & Financial Goals Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Money Leak Radar Alerts */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">Radar de Fugas de Dinero Activo</h3>
                  </div>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                    {alerts.length} Detectadas
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="rounded-lg border border-slate-800/90 bg-slate-950/60 p-3.5 transition-colors hover:border-slate-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{alert.titulo}</p>
                          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                            {alert.mensaje}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-bold text-amber-400">
                          +${alert.montoImpacto} MXN
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Savings Goals */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white">Metas Financieras Inteligentes</h3>
                  </div>
                  <span className="text-xs text-slate-400">{goals.length} Activas</span>
                </div>
                <div className="mt-4 space-y-4">
                  {goals.map((goal) => {
                    const percentage = Math.min(
                      100,
                      Math.round((goal.montoActual / goal.montoObjetivo) * 100)
                    );
                    return (
                      <div key={goal.id} className="rounded-lg border border-slate-800/90 bg-slate-950/60 p-3.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200">{goal.nombre}</span>
                          <span className="font-bold text-emerald-400">{percentage}%</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                          <span>
                            ${goal.montoActual.toLocaleString()} de ${goal.montoObjetivo.toLocaleString()} MXN
                          </span>
                          <span>Meta: {goal.fechaMeta}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Subscriptions Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Suscripciones y Cargos Frecuentes Monitoreados
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenReport('COSTO_TOTAL_SUSCRIPCIONES_ANUALIZADO')}
                  className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  <span>Auditoría Anualizada</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="pb-2">Servicio / Proveedor</th>
                      <th className="pb-2">Frecuencia</th>
                      <th className="pb-2">Próxima Fecha de Cobro</th>
                      <th className="pb-2 text-right">Monto</th>
                      <th className="pb-2 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-medium text-white">{sub.proveedor}</td>
                        <td className="py-2.5 text-slate-400">{sub.frecuencia}</td>
                        <td className="py-2.5 text-slate-400">{sub.proximaFecha}</td>
                        <td className="py-2.5 text-right font-semibold text-slate-200">
                          ${sub.monto.toFixed(2)} {sub.moneda}
                        </td>
                        <td className="py-2.5 text-center">
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            Activo
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PERSONAL EXPENSES CRUD */}
        {/* ======================================================== */}
        {activeTab === 'expenses' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header and Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Gastos Personales</h2>
                <p className="text-xs text-slate-400">
                  Controla cada egreso individual, clasifícalo y audita su impacto.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Registrar Nuevo Gasto</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por descripción o notas..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/70 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={expenseCategoryFilter}
                  onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ALL">Todas las Categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expenses Table */}
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/40 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Descripción</th>
                    <th className="px-4 py-3 font-medium">Categoría</th>
                    <th className="px-4 py-3 font-medium">Método de Pago</th>
                    <th className="px-4 py-3 font-medium text-right">Monto</th>
                    <th className="px-4 py-3 font-medium text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPersonalExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No se encontraron gastos registrados. ¡Agrega tu primer gasto arriba!
                      </td>
                    </tr>
                  ) : (
                    filteredPersonalExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                          {expense.fecha}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">
                          <div>{expense.descripcion}</div>
                          {expense.notas && (
                            <div className="text-[11px] text-slate-400">{expense.notas}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                            style={{
                              backgroundColor: `${expense.categoriaColor || '#3B82F6'}15`,
                              color: expense.categoriaColor || '#3B82F6',
                              border: `1px solid ${expense.categoriaColor || '#3B82F6'}30`,
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: expense.categoriaColor || '#3B82F6' }}
                            />
                            {expense.categoriaNombre || 'General'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
                            {expense.metodoPago}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-white">
                          ${expense.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                          <span className="text-[10px] font-normal text-slate-400">
                            {expense.moneda}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeletePersonalExpense(expense.id)}
                            className="rounded p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                            title="Eliminar gasto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: COMPANIES (B2B MULTI-TENANT) */}
        {/* ======================================================== */}
        {activeTab === 'companies' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Empresas y Personas Morales (B2B)</h2>
                <p className="text-xs text-slate-400">
                  Espacios de trabajo independientes para separar gastos personales de corporativos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCompanyModalOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Registrar Nueva Empresa</span>
              </button>
            </div>

            {/* Companies Cards Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {initialCompanies.map((comp) => {
                const compExpenses = initialCompanyExpenses.filter(
                  (e) => e.empresaId === comp.id
                );
                const compTotal = compExpenses.reduce((acc, curr) => acc + curr.monto, 0);

                return (
                  <div
                    key={comp.id}
                    className={`relative rounded-xl border p-5 transition-all ${
                      selectedWorkspace === comp.id
                        ? 'border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-500/10'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{comp.nombre}</h3>
                          <p className="font-mono text-xs text-cyan-400/90">{comp.rfcTaxId}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCompany(comp.id, comp.nombre)}
                        className="rounded p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                        title="Eliminar empresa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-3 text-xs">
                      <div>
                        <span className="text-slate-400">Giro Comercial:</span>
                        <p className="font-medium text-slate-200">{comp.giro}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Gastos Registrados:</span>
                        <p className="font-bold text-white">
                          ${compTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                          {comp.monedaBase}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
                      <span className="text-[11px] text-slate-400">
                        {compExpenses.length} facturas y comprobantes
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWorkspace(comp.id);
                          setActiveTab('company-expenses');
                        }}
                        className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-slate-700 transition-colors"
                      >
                        <span>Gestionar Gastos</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: COMPANY EXPENSES (DEPARTMENTS & TAX FOLIOS) */}
        {/* ======================================================== */}
        {activeTab === 'company-expenses' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Gastos Empresariales</span>
                  {activeCompany && (
                    <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-500/20">
                      {activeCompany.nombre}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">
                  Desglose fiscal con departamentos, centros de costo y folios de facturas SAT.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (initialCompanies.length === 0) {
                    setIsCompanyModalOpen(true);
                  } else {
                    setIsCompanyExpenseModalOpen(true);
                  }
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-400 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Registrar Gasto Empresarial</span>
              </button>
            </div>

            {/* Department Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Departamento:</span>
              {[
                'ALL',
                'TI / Operaciones',
                'Marketing',
                'Administración',
                'Producción & Almacén',
              ].map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setCompanyExpenseDeptFilter(dept)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    companyExpenseDeptFilter === dept
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {dept === 'ALL' ? 'Todos' : dept}
                </button>
              ))}
            </div>

            {/* Company Expenses Table */}
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/40 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Folio Fiscal SAT</th>
                    <th className="px-4 py-3 font-medium">Departamento</th>
                    <th className="px-4 py-3 font-medium">Descripción</th>
                    <th className="px-4 py-3 font-medium">Categoría</th>
                    <th className="px-4 py-3 font-medium text-right">Monto</th>
                    <th className="px-4 py-3 font-medium text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCompanyExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No hay gastos empresariales registrados en este departamento.
                      </td>
                    </tr>
                  ) : (
                    filteredCompanyExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                          {expense.fecha}
                        </td>
                        <td className="px-4 py-3 font-mono text-cyan-400 font-medium">
                          {expense.facturaFolio || 'Sin Folio'}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200">
                            {expense.departamento || 'General'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-white">
                          <div>{expense.descripcion}</div>
                          {expense.notas && (
                            <div className="text-[11px] text-slate-400">{expense.notas}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                            style={{
                              backgroundColor: `${expense.categoriaColor || '#3B82F6'}15`,
                              color: expense.categoriaColor || '#3B82F6',
                            }}
                          >
                            {expense.categoriaNombre || 'Empresarial'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-white">
                          ${expense.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                          <span className="text-[10px] font-normal text-slate-400">
                            {expense.moneda}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteCompanyExpense(expense.id)}
                            className="rounded p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                            title="Eliminar gasto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: CATEGORIES MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Categorías de Flujo Financiero</h2>
                <p className="text-xs text-slate-400">
                  Clasificación para tus reportes de ingresos, egresos y centros de costos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-pink-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-pink-500/20 hover:bg-pink-400 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Nueva Categoría Personalizada</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 transition-colors hover:border-slate-700"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">{cat.nombre}</p>
                      <span className="text-[10px] text-slate-400">
                        {cat.tipo === 'EXPENSE' ? 'Egreso' : 'Ingreso'}
                        {cat.esSistema && ' · Predeterminada'}
                      </span>
                    </div>
                  </div>

                  {!cat.esSistema && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.nombre)}
                      className="rounded p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: 20 FINANCIAL REPORTS CATALOG */}
        {/* ======================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileBarChart2 className="h-5 w-5 text-emerald-400" />
                  <span>Catálogo de Reportes Contables y Financieros</span>
                </h2>
                <p className="text-xs text-slate-400">
                  20 reportes estructurados con metodología contable para personas y empresas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                  5 Gratuitos · 15 Plan Pro
                </span>
              </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FINANCIAL_REPORTS_CATALOG.map((rep) => {
                const isProReport = rep.tier !== 'FREE';
                const hasAccess =
                  !isProReport || user.plan === 'PRO_PERSONAL' || user.plan === 'PRO_BUSINESS';

                return (
                  <div
                    key={rep.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-all hover:border-slate-700"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isProReport
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          }`}
                        >
                          {rep.tier === 'FREE' ? 'Gratuito' : 'Plan Pro'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {rep.categoria}
                        </span>
                      </div>

                      <h3 className="mt-3 text-sm font-semibold text-white">{rep.nombre}</h3>
                      <p className="mt-1 text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {rep.descripcionCorta}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => handleOpenReport(rep.id)}
                        className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors ${
                          hasAccess
                            ? 'bg-slate-800 text-white hover:bg-slate-700'
                            : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20'
                        }`}
                      >
                        {hasAccess ? (
                          <>
                            <FileBarChart2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Ver Ejemplo & Generar</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-3.5 w-3.5 text-amber-400" />
                            <span>Ver Ejemplo (Pro)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODALS */}
      {/* ======================================================== */}
      {/* 1. New Personal Expense Modal */}
      <NewExpenseModal
        userId={user.id}
        categories={categories}
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      {/* 2. New Company Modal */}
      <NewCompanyModal
        userId={user.id}
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onCompanyCreated={(newCompanyId) => {
          setSelectedWorkspace(newCompanyId);
          setActiveTab('company-expenses');
        }}
      />

      {/* 3. New Company Expense Modal */}
      <NewCompanyExpenseModal
        userId={user.id}
        companyId={selectedWorkspace !== 'personal' ? selectedWorkspace : initialCompanies[0]?.id || ''}
        companyName={activeCompany?.nombre || initialCompanies[0]?.nombre || 'Empresa'}
        categories={categories}
        isOpen={isCompanyExpenseModalOpen}
        onClose={() => setIsCompanyExpenseModalOpen(false)}
      />

      {/* 4. New Category Modal */}
      <NewCategoryModal
        userId={user.id}
        empresaId={selectedWorkspace !== 'personal' ? selectedWorkspace : undefined}
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* 5. Subscription & Stripe Modal */}
      <SubscriptionModal
        currentPlan={user.plan}
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

      {/* 6. Asynchronous Financial Report Modal (20 Reports + Excel/PDF export) */}
      <AsyncReportModal
        userId={user.id}
        empresaId={selectedWorkspace !== 'personal' ? selectedWorkspace : undefined}
        userPlan={user.plan}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        initialReportId={selectedReportId}
      />
    </div>
  );
}
