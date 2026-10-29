// src/domain/services/recurring-detection.service.ts

export interface TransactionForDetection {
  id: string;
  monto: number;
  descripcion: string;
  fecha: Date;
  categoriaId: string | null;
}

export interface DetectedSubscriptionSuggestion {
  proveedorIdentificado: string;
  montoPromedio: number;
  frecuenciaEstimada: 'MONTHLY' | 'WEEKLY' | 'ANNUAL';
  confianza: number; // 0 to 1
  diasIntervaloPromedio: number;
  transaccionesIds: string[];
  mensajeSugerencia: string;
}

export class RecurringDetectionService {
  private static KNOWN_SUBSCRIPTION_KEYWORDS = [
    'netflix', 'spotify', 'apple', 'google storage', 'youtube', 'prime', 
    'amazon prime', 'disney', 'hbo', 'max', 'gym', 'smart fit', 'gimnasio', 
    'totalplay', 'telmex', 'izzy', 'at&t', 'telcel', 'chatgpt', 'openai', 
    'github', 'notion', 'canva', 'dropbox', 'icloud', 'audible'
  ];

  public detectPotentialSubscriptions(
    transactions: TransactionForDetection[]
  ): DetectedSubscriptionSuggestion[] {
    const suggestions: DetectedSubscriptionSuggestion[] = [];

    // 1. Group by normalized provider key
    const groups = new Map<string, TransactionForDetection[]>();

    for (const tx of transactions) {
      const normalizedKey = this.normalizeMerchantName(tx.descripcion);
      if (!groups.has(normalizedKey)) {
        groups.set(normalizedKey, []);
      }
      groups.get(normalizedKey)!.push(tx);
    }

    // 2. Evaluate clusters with 2 or more occurrences
    for (const [key, cluster] of groups.entries()) {
      if (cluster.length < 2) continue;

      // Sort chronologically
      cluster.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

      // Check date differences in days
      const intervals: number[] = [];
      for (let i = 1; i < cluster.length; i++) {
        const diffMs = Math.abs(
          new Date(cluster[i].fecha).getTime() - new Date(cluster[i - 1].fecha).getTime()
        );
        intervals.push(Math.round(diffMs / (1000 * 60 * 60 * 24)));
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

      // Check amount variance (standard deviation or min/max ratio)
      const amounts = cluster.map((c) => c.monto);
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const isAmountStable = amounts.every((amt) => Math.abs(amt - avgAmount) / avgAmount <= 0.15);

      const isKnownMerchant = RecurringDetectionService.KNOWN_SUBSCRIPTION_KEYWORDS.some((kw) =>
        key.includes(kw)
      );

      // Monthly criteria: ~27 to ~33 days between charges
      const isMonthlyInterval = avgInterval >= 26 && avgInterval <= 34;
      // Weekly criteria: ~6 to ~8 days
      const isWeeklyInterval = avgInterval >= 6 && avgInterval <= 8;

      if ((isMonthlyInterval || isWeeklyInterval || isKnownMerchant) && isAmountStable) {
        const freq = isWeeklyInterval ? 'WEEKLY' : 'MONTHLY';
        const formattedProvider = this.formatProviderName(cluster[0].descripcion);
        const confidence = isKnownMerchant ? 0.95 : isMonthlyInterval ? 0.85 : 0.70;

        suggestions.push({
          proveedorIdentificado: formattedProvider,
          montoPromedio: Math.round(avgAmount * 100) / 100,
          frecuenciaEstimada: freq,
          confianza: confidence,
          diasIntervaloPromedio: Math.round(avgInterval),
          transaccionesIds: cluster.map((c) => c.id),
          mensajeSugerencia: `Detectamos un posible gasto recurrente en "${formattedProvider}" con periodicidad mensual estimada ($${avgAmount.toFixed(2)} MXN). ¿Deseas agregarlo a tus Suscripciones para anticipar cobros y evitar olvidos?`,
        });
      }
    }

    return suggestions;
  }

  private normalizeMerchantName(raw: string): string {
    return raw
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private formatProviderName(raw: string): string {
    const cleaned = raw.replace(/\b(mx|com|s\.a|de c\.v|llc|inc|pago|cargo|spei)\b/gi, '').trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
}

