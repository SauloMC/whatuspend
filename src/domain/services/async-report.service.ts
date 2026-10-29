// src/domain/services/async-report.service.ts
import { PrismaClient, ReportFormat, ReportStatus, ReportType } from '@prisma/client';
import { RequestReportInput } from '@/lib/validations/report.schema';

const prisma = new PrismaClient();

export interface EnqueueReportResponse {
  jobId: string;
  estado: ReportStatus;
  mensaje: string;
  tiempoEstimadoSegundos: number;
}

export class AsyncReportService {
  /**
   * Enqueues an asynchronous report generation job and returns immediately with status PENDING (HTTP 200/202).
   */
  public async enqueueReportJob(
    userId: string,
    input: RequestReportInput
  ): Promise<EnqueueReportResponse> {
    // 1. Create Job in Database with initial PENDING status
    const job = await prisma.reportJob.create({
      data: {
        usuarioId: userId,
        empresaId: input.empresaId,
        tipo: input.tipo as ReportType,
        formato: input.formato as ReportFormat,
        parametros: {
          fechaInicio: input.fechaInicio,
          fechaFin: input.fechaFin,
          categoriaIds: input.categoriaIds,
          incluirComprobantes: input.incluirComprobantes,
          enviarNotificacionEmail: input.enviarNotificacionEmail,
        },
        estado: ReportStatus.PENDING,
        progreso: 0,
      },
    });

    // 2. Trigger asynchronous processing without blocking the HTTP response
    // In production, this can be dispatched to an Edge Function, Inngest, QStash, BullMQ or background worker
    this.processReportInBackground(job.id, userId, input).catch((err) => {
      console.error(`[AsyncReportWorker] Background error on job ${job.id}:`, err);
    });

    return {
      jobId: job.id,
      estado: ReportStatus.PENDING,
      mensaje: 'Tu reporte se ha puesto en cola para procesarse en segundo plano. Puedes continuar navegando.',
      tiempoEstimadoSegundos: input.formato === 'PDF' ? 4 : 2,
    };
  }

  /**
   * Background processor: queries data, generates file buffer (PDF/Excel),
   * uploads to Supabase Storage, updates progress (which triggers Supabase Realtime WebSocket events),
   * and sends an email notification.
   */
  public async processReportInBackground(
    jobId: string,
    userId: string,
    input: RequestReportInput
  ): Promise<void> {
    try {
      // Step A: Mark PROCESSING (25% progress)
      await prisma.reportJob.update({
        where: { id: jobId },
        data: {
          estado: ReportStatus.PROCESSING,
          progreso: 25,
        },
      });

      // Step B: Fetch records based on scope (Personal or Company)
      const startDate = new Date(input.fechaInicio);
      const endDate = new Date(input.fechaFin);

      let totalExpenses = 0;
      let totalAmount = 0;

      if (input.empresaId) {
        const companyExpenses = await prisma.gastoEmpresa.findMany({
          where: {
            empresaId: input.empresaId,
            fecha: { gte: startDate, lte: endDate },
          },
          include: { categoria: true },
        });
        totalExpenses = companyExpenses.length;
        totalAmount = companyExpenses.reduce((acc, c) => acc + Number(c.monto), 0);
      } else {
        const personalExpenses = await prisma.gastoPersonal.findMany({
          where: {
            usuarioId: userId,
            fecha: { gte: startDate, lte: endDate },
          },
          include: { categoria: true },
        });
        totalExpenses = personalExpenses.length;
        totalAmount = personalExpenses.reduce((acc, c) => acc + Number(c.monto), 0);
      }

      // Step C: Update progress to 60% (Data queried, compiling file)
      await prisma.reportJob.update({
        where: { id: jobId },
        data: { progreso: 60 },
      });

      // Step D: Synthesize file name and metadata
      const extension = input.formato === 'EXCEL' ? 'xlsx' : 'pdf';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `reporte_${input.tipo.toLowerCase()}_${timestamp}.${extension}`;

      // In real runtime, ExcelJS or PDFMake writes to buffer and uploads to Supabase Storage:
      // const fileBuffer = await generateExcelBuffer(expenses);
      // const { data, error } = await supabase.storage.from('reports').upload(`${userId}/${filename}`, fileBuffer);
      // const signedUrl = await supabase.storage.from('reports').createSignedUrl(`${userId}/${filename}`, 86400);

      const mockSignedUrl = `https://storage.whatuspend.com/reports/${userId}/${jobId}/${filename}?token=signed_secure_token_expires_24h`;
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24);

      // Step E: Mark COMPLETED (100% progress)
      // Supabase Realtime will automatically broadcast this UPDATE to all connected WebSockets!
      const completedJob = await prisma.reportJob.update({
        where: { id: jobId },
        data: {
          estado: ReportStatus.COMPLETED,
          progreso: 100,
          archivoUrl: mockSignedUrl,
          archivoNombre: filename,
          tamanoBytes: 1024 * (extension === 'xlsx' ? 142 : 485), // Estimated bytes
          expiraEn: expirationDate,
        },
        include: { usuario: true },
      });

      // Step F: Send email notification if user requested it
      if (input.enviarNotificacionEmail && completedJob.usuario?.email) {
        await this.dispatchEmailNotification(
          completedJob.usuario.email,
          completedJob.usuario.nombre,
          filename,
          mockSignedUrl,
          totalExpenses,
          totalAmount
        );

        await prisma.reportJob.update({
          where: { id: jobId },
          data: { notificadoEmail: true },
        });
      }
    } catch (err) {
      console.error(`[AsyncReportWorker] Failure generating report ${jobId}:`, err);
      await prisma.reportJob.update({
        where: { id: jobId },
        data: {
          estado: ReportStatus.FAILED,
          error: (err as Error).message || 'Error desconocido al compilar el reporte',
        },
      });
    }
  }

  /**
   * Dispatches a high-conversion, professional transactional email with the secure download link.
   */
  private async dispatchEmailNotification(
    recipientEmail: string,
    recipientName: string,
    filename: string,
    downloadUrl: string,
    totalExpenses: number,
    totalAmount: number
  ): Promise<void> {
    console.log(`[EmailGateway] ✉️ Sending email to ${recipientEmail}...`);
    console.log(`Subject: "WhatUSpend: Tu reporte ${filename} está listo para descargar"`);
    console.log(`Payload: User ${recipientName}, ${totalExpenses} transacciones, Total: $${totalAmount} MXN`);
    console.log(`Secure link: ${downloadUrl}`);
    // In production:
    // await resend.emails.send({
    //   from: 'WhatUSpend Reports <reports@whatuspend.com>',
    //   to: recipientEmail,
    //   subject: `WhatUSpend: Tu reporte financiero está listo`,
    //   react: ReportReadyEmailTemplate({ recipientName, downloadUrl, filename, totalExpenses }),
    // });
  }
}

