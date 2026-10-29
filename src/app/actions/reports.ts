// src/app/actions/reports.ts
'use server';

import { RequestReportSchema } from '@/lib/validations/report.schema';
import { AsyncReportService } from '@/domain/services/async-report.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const asyncReportService = new AsyncReportService();

export type ReportActionResponse = {
  success: boolean;
  jobId?: string;
  estado?: string;
  mensaje?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Server Action: Request Asynchronous Report
 * Returns 200 with Job ID immediately; background process compiles file and notifies via WebSocket/Email.
 */
export async function requestAsyncReportAction(
  userId: string,
  rawInput: unknown
): Promise<ReportActionResponse> {
  try {
    const validation = RequestReportSchema.safeParse(rawInput);
    if (!validation.success) {
      return {
        success: false,
        error: 'Parámetros del reporte inválidos',
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const response = await asyncReportService.enqueueReportJob(userId, validation.data);

    return {
      success: true,
      jobId: response.jobId,
      estado: response.estado,
      mensaje: response.mensaje,
    };
  } catch (error) {
    console.error('Error queuing report:', error);
    return {
      success: false,
      error: 'No se pudo programar la generación del reporte. Intenta de nuevo.',
    };
  }
}

/**
 * Server Action: Get Report Job Status
 * Allows frontend to poll status if WebSockets are disabled or disconnected.
 */
export async function getReportJobStatusAction(jobId: string, userId: string) {
  try {
    const job = await prisma.reportJob.findFirst({
      where: {
        id: jobId,
        usuarioId: userId,
      },
      select: {
        id: true,
        tipo: true,
        formato: true,
        estado: true,
        progreso: true,
        archivoUrl: true,
        archivoNombre: true,
        tamanoBytes: true,
        expiraEn: true,
        error: true,
        createdAt: true,
      },
    });

    if (!job) {
      return { success: false, error: 'Trabajo de reporte no encontrado' };
    }

    return { success: true, job };
  } catch (error) {
    console.error('Error checking report status:', error);
    return { success: false, error: 'Error al consultar estado del reporte' };
  }
}

/**
 * Server Action: List Recent Generated Reports for User
 */
export async function getUserRecentReportsAction(userId: string) {
  try {
    const jobs = await prisma.reportJob.findMany({
      where: { usuarioId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return { success: true, jobs };
  } catch (error) {
    console.error('Error fetching recent reports:', error);
    return { success: false, error: 'Error al obtener historial de reportes' };
  }
}

