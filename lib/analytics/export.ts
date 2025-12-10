/**
 * Export Utilities
 * Functions for exporting data to various formats (CSV, JSON, Excel)
 */

import * as XLSX from 'xlsx';
import type { ExportOptions, ExportResult } from './types';
import { formatMetricValue, formatDate, formatDateTime } from './formatters';
import { REPORT_CONFIG } from './config';

// ============================================================================
// CSV EXPORT
// ============================================================================

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(
  data: Record<string, any>[],
  options: ExportOptions = {}
): string {
  if (data.length === 0) return '';

  const { includeHeaders = true } = options;

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Build CSV rows
  const rows: string[] = [];

  // Add headers if requested
  if (includeHeaders) {
    rows.push(headers.map(escapeCSVValue).join(','));
  }

  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      return escapeCSVValue(formatCSVValue(value));
    });
    rows.push(values.join(','));
  });

  return rows.join('\n');
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCSVValue(value: string): string {
  if (value === null || value === undefined) return '';

  const stringValue = String(value);

  // Check if escaping is needed
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    // Escape quotes by doubling them
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return stringValue;
}

/**
 * Format value for CSV
 */
function formatCSVValue(value: any): string {
  if (value === null || value === undefined) return '';

  // Format dates
  if (value instanceof Date) {
    return formatDateTime(value);
  }

  // Format numbers (remove thousands separators for CSV)
  if (typeof value === 'number') {
    return value.toString();
  }

  // Format booleans
  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  // Convert objects/arrays to JSON strings
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

// ============================================================================
// DOWNLOAD HELPERS
// ============================================================================

/**
 * Trigger browser download of CSV data
 */
export function downloadCSV(
  data: Record<string, any>[],
  filename: string = 'export.csv',
  options: ExportOptions = {}
): ExportResult {
  try {
    const csv = arrayToCSV(data, options);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, filename);

    return {
      success: true,
      filename
    };
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return {
      success: false,
      filename,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Trigger browser download of JSON data
 */
export function downloadJSON(
  data: any,
  filename: string = 'export.json',
  pretty: boolean = true
): ExportResult {
  try {
    const json = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    triggerDownload(blob, filename);

    return {
      success: true,
      filename
    };
  } catch (error) {
    console.error('Error exporting JSON:', error);
    return {
      success: false,
      filename,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generic download trigger
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ============================================================================
// EXCEL EXPORT (using HTML table method)
// ============================================================================

/**
 * Export data as Excel file (using xlsx library)
 * Creates a proper .xlsx file with the data in a worksheet
 */
export function downloadExcel(
  data: Record<string, any>[],
  filename: string = 'export.xlsx',
  sheetName: string = 'Datos'
): ExportResult {
  try {
    // Create worksheet from JSON data
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create blob with proper MIME type for XLSX
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    triggerDownload(blob, filename);

    return {
      success: true,
      filename
    };
  } catch (error) {
    console.error('Error exporting Excel:', error);
    return {
      success: false,
      filename,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Convert array of objects to HTML table
 */
function arrayToHTMLTable(data: Record<string, any>[]): string {
  if (data.length === 0) return '<table></table>';

  const headers = Object.keys(data[0]);

  let html = '<table border="1">';

  // Add headers
  html += '<thead><tr>';
  headers.forEach(header => {
    html += `<th>${escapeHTML(header)}</th>`;
  });
  html += '</tr></thead>';

  // Add rows
  html += '<tbody>';
  data.forEach(row => {
    html += '<tr>';
    headers.forEach(header => {
      const value = row[header];
      html += `<td>${escapeHTML(formatCSVValue(value))}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody>';

  html += '</table>';
  return html;
}

/**
 * Escape HTML special characters
 */
function escapeHTML(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

// ============================================================================
// PRINT/PDF EXPORT
// ============================================================================

/**
 * Trigger browser print dialog
 * Can be used to save as PDF via browser's print-to-PDF feature
 */
export function triggerPrint(): void {
  window.print();
}

/**
 * Create a printable HTML page from data
 */
export function createPrintableReport(
  title: string,
  sections: Array<{ title: string; content: string }>
): void {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Por favor, permite ventanas emergentes para imprimir el reporte');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: ${REPORT_CONFIG.printConfig.padding};
          max-width: ${REPORT_CONFIG.printConfig.maxWidth};
          margin: 0 auto;
        }
        h1 {
          color: #333;
          border-bottom: 2px solid ${REPORT_CONFIG.printConfig.borderColor};
          padding-bottom: 10px;
        }
        h2 {
          color: #555;
          margin-top: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 8px;
          text-align: left;
          border: 1px solid ${REPORT_CONFIG.printConfig.borderColor};
        }
        th {
          background-color: ${REPORT_CONFIG.printConfig.headerBackground};
          font-weight: bold;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p><strong>Fecha de generación:</strong> ${formatDateTime(new Date())}</p>

      ${sections.map(section => `
        <h2>${section.title}</h2>
        ${section.content}
      `).join('')}

      <div class="no-print" style="margin-top: 30px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px;">
          Imprimir / Guardar PDF
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; margin-left: 10px;">
          Cerrar
        </button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// ============================================================================
// CHART IMAGE EXPORT
// ============================================================================

/**
 * Export chart as PNG image
 * Requires the chart element to be a canvas or SVG
 */
export function exportChartAsPNG(
  elementId: string,
  filename: string = 'chart.png'
): ExportResult {
  try {
    const element = document.getElementById(elementId);

    if (!element) {
      return {
        success: false,
        filename,
        error: 'Element not found'
      };
    }

    // Check if it's a canvas
    if (element instanceof HTMLCanvasElement) {
      element.toBlob(blob => {
        if (blob) {
          triggerDownload(blob, filename);
        }
      });

      return {
        success: true,
        filename
      };
    }

    // Check if it's an SVG
    if (element instanceof SVGElement) {
      const svgData = new XMLSerializer().serializeToString(element);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return {
          success: false,
          filename,
          error: 'Canvas context not available'
        };
      }

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
          if (blob) {
            triggerDownload(blob, filename);
          }
        });
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);

      return {
        success: true,
        filename
      };
    }

    return {
      success: false,
      filename,
      error: 'Element is not a canvas or SVG'
    };
  } catch (error) {
    console.error('Error exporting chart:', error);
    return {
      success: false,
      filename,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================================
// CLIPBOARD EXPORT
// ============================================================================

/**
 * Copy data to clipboard as text
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

/**
 * Copy CSV data to clipboard
 */
export async function copyCSVToClipboard(data: Record<string, any>[]): Promise<boolean> {
  const csv = arrayToCSV(data);
  return copyToClipboard(csv);
}

// ============================================================================
// FILE NAME GENERATORS
// ============================================================================

/**
 * Generate filename with timestamp
 * Example: "reporte-ocupacion-2024-11-15-143022.csv"
 */
export function generateFilename(
  prefix: string,
  extension: string = 'csv'
): string {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '-')
    .substring(0, 19);

  return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Sanitize filename (remove invalid characters)
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9.-]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
