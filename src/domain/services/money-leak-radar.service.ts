// src/domain/services/money-leak-radar.service.ts

export interface ExpenseRecord {
  id: string;
  monto: number;
  categoriaId: string | null;
  categoriaNombre?: string;
  descripcion: string;
  fecha: Date;
}

export interface MoneyLeakAlert {
  categoriaId: string | null;
  categoriaNombre: string;
  titulo: string;
  mensaje: string;
  severidad: 'INFO' | 'WARNING' | 'CRITICAL';
  montoImpacto: number;
  ahorroEstimadoSugerido: number;
  porcentajeIncremento: number;
}

export class MoneyLeakRadarService {
  /**
   * Analyzes expenses and compares the current period (last 30 days) against
   * the prior baseline period (30-60 days ago) to flag anomalies and spending leaks.
   */
  public analyzeSpendingLeaks(
    currentMonthExpenses: ExpenseRecord[],
    previousMonthExpenses: ExpenseRecord[]
  ): MoneyLeakAlert[] {
    const alerts: MoneyLeakAlert[] = [];

    // Group expenses by category
    const currentByCat = this.groupTotalsByCategory(currentMonthExpenses);
    const prevByCat = this.groupTotalsByCategory(previousMonthExpenses);

    // 1. Detect Category Surges
    for (const [catId, currentData] of Object.entries(currentByCat)) {
      const prevData = prevByCat[catId];
      const prevTotal = prevData ? prevData.total : 0;
      const currentTotal = currentData.total;
      const catName = currentData.name || 'Sin Categoría';

      // Skip negligible spending categories (< 300 currency units)
      if (currentTotal < 300) continue;

      if (prevTotal > 0) {
        const percentageIncrease = ((currentTotal - prevTotal) / prevTotal) * 100;
        const diffAmount = currentTotal - prevTotal;

        if (percentageIncrease >= 25 && diffAmount >= 400) {
          const severidad = percentageIncrease >= 60 ? 'CRITICAL' : 'WARNING';
          const suggestedSavings = Math.round(diffAmount * 0.7);

          alerts.push({
            categoriaId: catId,
            categoriaNombre: catName,
            titulo: `Incremento de ${Math.round(percentageIncrease)}% en ${catName}`,
            mensaje: `Gastaste un ${Math.round(percentageIncrease)}% más en ${catName} este mes frente al mes anterior (diferencia de $${diffAmount.toLocaleString()} ${currentMonthExpenses[0]?.id ? 'MXN' : ''}). Podrías ahorrar aproximadamente $${suggestedSavings.toLocaleString()} ajustando tus consumos frecuentes en este rubro.`,
            severidad,
            montoImpacto: diffAmount,
            ahorroEstimadoSugerido: suggestedSavings,
            porcentajeIncremento: Math.round(percentageIncrease),
          });
        }
      }
    }

    // 2. Micro-expense Leak ("Gasto Hormiga") Detection
    // Expenses <= $100 MXN that repeat frequently and accumulate to significant amounts
    const microExpenses = currentMonthExpenses.filter((e) => e.monto > 0 && e.monto <= 120);
    const totalMicroSpend = microExpenses.reduce((acc, curr) => acc + curr.monto, 0);

    if (microExpenses.length >= 8 && totalMicroSpend >= 800) {
      alerts.push({
        categoriaId: null,
        categoriaNombre: 'Gastos Hormiga Acumulados',
        titulo: 'Fuga detectada: Micro-gastos frecuentes',
        mensaje: `Registraste ${microExpenses.length} pequeños consumos menores a $120, sumando $${totalMicroSpend.toLocaleString()}. Reducir 1 o 2 de estos micropagos por semana te permitiría retener hasta $${Math.round(totalMicroSpend * 0.5).toLocaleString()} al mes.`,
        severidad: 'INFO',
        montoImpacto: totalMicroSpend,
        ahorroEstimadoSugerido: Math.round(totalMicroSpend * 0.5),
        porcentajeIncremento: 0,
      });
    }

    return alerts.sort((a, b) => b.montoImpacto - a.montoImpacto);
  }

  private groupTotalsByCategory(
    expenses: ExpenseRecord[]
  ): Record<string, { total: number; name: string; count: number }> {
    const acc: Record<string, { total: number; name: string; count: number }> = {};
    for (const exp of expenses) {
      const catId = exp.categoriaId || 'uncategorized';
      if (!acc[catId]) {
        acc[catId] = {
          total: 0,
          name: exp.categoriaNombre || 'Sin Categoría',
          count: 0,
        };
      }
      acc[catId].total += exp.monto;
      acc[catId].count += 1;
    }
    return acc;
  }
}

