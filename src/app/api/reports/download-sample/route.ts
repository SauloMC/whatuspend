// src/app/api/reports/download-sample/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import PdfPrinter from 'pdfmake';
import { SAMPLE_REPORTS_DATA } from '@/domain/services/report-sample-data';
import { FINANCIAL_REPORTS_CATALOG } from '@/domain/services/financial-reports-catalog';
import { ReportType } from '@prisma/client';

const pdfFonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = (searchParams.get('tipo') as ReportType) || 'ESTADO_INGRESOS_GASTOS_BASICO';
    const formato = (searchParams.get('formato') || 'PDF').toUpperCase();

    const sample = SAMPLE_REPORTS_DATA[tipo] || SAMPLE_REPORTS_DATA.ESTADO_INGRESOS_GASTOS_BASICO!;
    const catalogItem = FINANCIAL_REPORTS_CATALOG.find((r) => r.id === tipo) || FINANCIAL_REPORTS_CATALOG[0];

    // =========================================================================
    // 1. GENERACIÓN REAL DE EXCEL (.xlsx)
    // =========================================================================
    if (formato === 'EXCEL') {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'WhatUSpend Platform';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Reporte Financiero', {
        views: [{ showGridLines: true }],
      });

      // Banner / Header Title
      worksheet.mergeCells('A1:E1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `WhatUSpend — ${sample.titulo}`;
      titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      worksheet.getRow(1).height = 32;

      // Period & Watermark
      worksheet.mergeCells('A2:E2');
      const subCell = worksheet.getCell('A2');
      subCell.value = `Periodo: ${sample.periodo} | ESTADO: DATOS DE MUESTRA / DEMOSTRACIÓN`;
      subCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF64748B' } };
      worksheet.getRow(2).height = 20;

      // Blank row
      worksheet.addRow([]);

      // Table Header Row
      const headerRow = worksheet.addRow(sample.columnas);
      headerRow.height = 24;
      headerRow.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF94A3B8' } },
          bottom: { style: 'medium', color: { argb: 'FF475569' } },
        };
      });

      // Data Rows
      sample.filas.forEach((row) => {
        const rowValues = sample.columnas.map((col) => row[col] ?? '');
        const dataRow = worksheet.addRow(rowValues);
        dataRow.height = 20;
        dataRow.eachCell((cell, colNumber) => {
          cell.font = { name: 'Arial', size: 10 };
          cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'right' };
          cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
        });
      });

      // Blank row
      worksheet.addRow([]);

      // Totals Section
      const totalsTitleRow = worksheet.addRow(['RESUMEN DE TOTALES', '']);
      totalsTitleRow.getCell(1).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } };

      Object.entries(sample.totales).forEach(([k, v]) => {
        const totRow = worksheet.addRow([k, v]);
        totRow.getCell(1).font = { name: 'Arial', size: 10, bold: true };
        totRow.getCell(2).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF2563EB' } };
        totRow.getCell(1).border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
        totRow.getCell(2).border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      });

      // Blank row
      worksheet.addRow([]);

      // Conclusion & Notes
      const noteTitleRow = worksheet.addRow(['CONCLUSIÓN Y RECOMENDACIÓN TÉCNICA']);
      noteTitleRow.getCell(1).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF475569' } };
      const noteRow = worksheet.addRow([sample.conclusionExperto]);
      noteRow.getCell(1).font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF334155' } };

      // Auto-fit column widths
      worksheet.columns.forEach((column) => {
        let maxLength = 18;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const val = cell.value ? cell.value.toString() : '';
          if (val.length > maxLength && val.length < 50) maxLength = val.length + 3;
        });
        column.width = maxLength;
      });

      const buffer = await workbook.xlsx.writeBuffer();

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${tipo.toLowerCase()}_ejemplo.xlsx"`,
        },
      });
    }

    // =========================================================================
    // 2. GENERACIÓN REAL DE PDF (.pdf)
    // =========================================================================
    const printer = new PdfPrinter(pdfFonts);

    // Build PDF table structure
    const tableBody = [
      sample.columnas.map((col) => ({
        text: col,
        bold: true,
        fillColor: '#1E293B',
        color: '#FFFFFF',
        alignment: 'center',
        margin: [4, 6, 4, 6],
      })),
      ...sample.filas.map((row) =>
        sample.columnas.map((col, idx) => ({
          text: String(row[col] ?? '—'),
          alignment: idx === 0 ? 'left' : 'right',
          margin: [4, 4, 4, 4],
        }))
      ),
    ];

    const totalsRows = Object.entries(sample.totales).map(([k, v]) => ({
      columns: [
        { text: k, bold: true, width: '60%', fontSize: 10 },
        { text: String(v), bold: true, width: '40%', alignment: 'right', color: '#2563EB', fontSize: 10 },
      ],
      margin: [0, 2, 0, 2],
    }));

    const docDefinition: any = {
      defaultStyle: {
        font: 'Helvetica',
        fontSize: 10,
        color: '#0F172A',
      },
      pageMargins: [40, 50, 40, 50],
      watermark: {
        text: 'DATOS DE EJEMPLO',
        color: '#64748B',
        opacity: 0.1,
        bold: true,
        italics: false,
      },
      header: (currentPage: number, pageCount: number) => ({
        columns: [
          { text: 'WhatUSpend — Inteligencia Financiera', fontSize: 9, color: '#64748B' },
          { text: `Página ${currentPage} de ${pageCount}`, fontSize: 9, color: '#64748B', alignment: 'right' },
        ],
        margin: [40, 20, 40, 0],
      }),
      content: [
        {
          text: sample.titulo,
          fontSize: 18,
          bold: true,
          color: '#0F172A',
          margin: [0, 0, 0, 4],
        },
        {
          text: `Periodo: ${sample.periodo} | Clasificación: ${catalogItem.categoria} (${catalogItem.tier})`,
          fontSize: 9,
          color: '#64748B',
          margin: [0, 0, 0, 16],
        },
        {
          table: {
            headerRows: 1,
            widths: sample.columnas.map((_, i) => (i === 0 ? '*' : 'auto')),
            body: tableBody,
          },
          layout: {
            hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5),
            vLineWidth: () => 0,
            hLineColor: (i: number) => (i === 1 ? '#0F172A' : '#E2E8F0'),
            paddingTop: () => 4,
            paddingBottom: () => 4,
          },
        },
        { text: '', margin: [0, 12, 0, 0] },
        {
          text: 'Resumen de Totales',
          fontSize: 12,
          bold: true,
          margin: [0, 10, 0, 6],
        },
        {
          stack: totalsRows,
          fillColor: '#F8FAFC',
          margin: [0, 0, 0, 16],
        },
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    { text: 'Conclusión y Recomendación Técnica:', bold: true, fontSize: 10, color: '#1E293B' },
                    { text: sample.conclusionExperto, fontSize: 9, color: '#475569', margin: [0, 4, 0, 0] },
                  ],
                  fillColor: '#F1F5F9',
                  margin: [8, 8, 8, 8],
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          text: 'Documento generado con fines demostrativos por WhatUSpend. Para generar reportes automáticos con tus datos reales, accede con tu cuenta.',
          fontSize: 8,
          color: '#94A3B8',
          margin: [0, 20, 0, 0],
          alignment: 'center',
        },
      ],
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];

    return new Promise<NextResponse>((resolve, reject) => {
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(
          new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${tipo.toLowerCase()}_ejemplo.pdf"`,
            },
          })
        );
      });
      pdfDoc.on('error', (err) => {
        console.error('Error generando PDFMake:', err);
        reject(new NextResponse('Error generando PDF', { status: 500 }));
      });
      pdfDoc.end();
    });
  } catch (error) {
    console.error('Error en download-sample route:', error);
    return NextResponse.json({ error: 'Error procesando descarga' }, { status: 500 });
  }
}

