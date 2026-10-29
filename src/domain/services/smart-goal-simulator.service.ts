// src/domain/services/smart-goal-simulator.service.ts

export interface FinancialGoalInput {
  id: string;
  nombre: string;
  montoObjetivo: number;
  montoActual: number;
  fechaMeta: Date;
}

export interface GoalSimulationResult {
  metaId: string;
  nombre: string;
  montoObjetivo: number;
  montoActual: number;
  montoFaltante: number;
  porcentajeCompletado: number;
  diasRestantes: number;
  mesesRestantes: number;
  ahorroSemanalRequerido: number;
  ahorroMensualRequerido: number;
  escenarioOptimizacion?: {
    categoriaSugerida: string;
    reduccionPorcentual: number;
    ahorroMensualExtra: number;
    mesesAdelantados: number;
    nuevaFechaEstimada: Date;
    mensaje: string;
  };
}

export class SmartGoalSimulatorService {
  public calculateGoalProjection(
    goal: FinancialGoalInput,
    discretionaryMonthlyExpense: number = 3000,
    discretionaryCategoryName: string = 'Comida rápida & Salidas'
  ): GoalSimulationResult {
    const faltante = Math.max(0, goal.montoObjetivo - goal.montoActual);
    const porcentaje = Math.min(100, Math.round((goal.montoActual / goal.montoObjetivo) * 100));

    const today = new Date();
    const targetDate = new Date(goal.fechaMeta);
    const diffMs = targetDate.getTime() - today.getTime();
    const diasRestantes = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const semanasRestantes = Math.max(1, diasRestantes / 7);
    const mesesRestantes = Math.max(0.5, diasRestantes / 30.41);

    const ahorroSemanal = Math.round((faltante / semanasRestantes) * 100) / 100;
    const ahorroMensual = Math.round((faltante / mesesRestantes) * 100) / 100;

    // Simulation scenario: 20% cut in highest discretionary spending category
    const reduccionPct = 0.20;
    const ahorroExtraMensual = Math.round(discretionaryMonthlyExpense * reduccionPct);
    
    let escenarioOptimizacion = undefined;
    if (ahorroExtraMensual > 0 && faltante > 0) {
      const nuevoAhorroMensualTotal = ahorroMensual + ahorroExtraMensual;
      const nuevosMesesNecesarios = faltante / nuevoAhorroMensualTotal;
      const mesesAdelantados = Math.max(0.5, Math.round((mesesRestantes - nuevosMesesNecesarios) * 10) / 10);
      
      const nuevaFecha = new Date(today);
      nuevaFecha.setDate(today.getDate() + Math.round(nuevosMesesNecesarios * 30.41));

      if (mesesAdelantados >= 1) {
        escenarioOptimizacion = {
          categoriaSugerida: discretionaryCategoryName,
          reduccionPorcentual: 20,
          ahorroMensualExtra: ahorroExtraMensual,
          mesesAdelantados,
          nuevaFechaEstimada: nuevaFecha,
          mensaje: `Si reduces tus gastos en "${discretionaryCategoryName}" un 20% (ahorro de $${ahorroExtraMensual.toLocaleString()} al mes), alcanzarás tu meta "${goal.nombre}" aproximadamente ${mesesAdelantados} meses antes.`,
        };
      }
    }

    return {
      metaId: goal.id,
      nombre: goal.nombre,
      montoObjetivo: goal.montoObjetivo,
      montoActual: goal.montoActual,
      montoFaltante: faltante,
      porcentajeCompletado: porcentaje,
      diasRestantes,
      mesesRestantes: Math.round(mesesRestantes * 10) / 10,
      ahorroSemanalRequerido: ahorroSemanal,
      ahorroMensualRequerido: ahorroMensual,
      escenarioOptimizacion,
    };
  }
}

