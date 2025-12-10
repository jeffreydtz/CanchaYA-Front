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
  if (typeof value !== 'string') {
    value = String(value);
  }
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

/**
 * Escape HTML in template strings (for use in HTML content)
 */
function escapeHTMLContent(content: string): string {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
  try {
    // Try to open the window
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      // If blocked, try to show a more helpful message
      const userMessage = 'Por favor, permite ventanas emergentes para imprimir el reporte.\n\n' +
        'Si estás usando un bloqueador de ventanas emergentes, desactívalo temporalmente para esta página.';
      alert(userMessage);
      return;
    }

    // Escape title to prevent XSS
    const escapedTitle = escapeHTML(title);
    
    // Get print config with defaults if not available
    const printConfig = REPORT_CONFIG?.printConfig || {
      padding: '20px',
      maxWidth: '800px',
      borderColor: '#ddd',
      headerBackground: '#f5f5f5'
    };

    // Build HTML content
    const htmlContent = sections.map(section => {
      const escapedSectionTitle = escapeHTML(section.title);
      return `
        <h2>${escapedSectionTitle}</h2>
        ${section.content}
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapedTitle}</title>
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            padding: ${printConfig.padding};
            max-width: ${printConfig.maxWidth};
            margin: 0 auto;
            color: #333;
            line-height: 1.6;
          }
          h1 {
            color: #333;
            border-bottom: 2px solid ${printConfig.borderColor};
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          h2 {
            color: #555;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border: 1px solid ${printConfig.borderColor};
          }
          th {
            background-color: ${printConfig.headerBackground};
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .no-print {
            margin-top: 30px;
            padding: 20px;
            background-color: #f5f5f5;
            border-radius: 4px;
            text-align: center;
          }
          .no-print button {
            padding: 10px 20px;
            font-size: 16px;
            margin: 0 10px;
            cursor: pointer;
            border: none;
            border-radius: 4px;
            background-color: #007bff;
            color: white;
          }
          .no-print button:hover {
            background-color: #0056b3;
          }
          .no-print button.secondary {
            background-color: #6c757d;
          }
          .no-print button.secondary:hover {
            background-color: #545b62;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
            @page {
              margin: 1cm;
            }
          }
        </style>
      </head>
      <body>
        <h1>${escapedTitle}</h1>
        <p><strong>Fecha de generación:</strong> ${escapeHTML(formatDateTime(new Date()))}</p>

        ${htmlContent}

        <div class="no-print">
          <button onclick="window.print()">
            Imprimir / Guardar PDF
          </button>
          <button onclick="window.close()" class="secondary">
            Cerrar
          </button>
        </div>
      </body>
      </html>
    `;

    // Write content to the window
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for the document to load, then optionally trigger print
    printWindow.onload = () => {
      // Small delay to ensure content is fully rendered
      setTimeout(() => {
        // Optionally auto-trigger print dialog
        // printWindow.print();
      }, 100);
    };

  } catch (error) {
    console.error('Error creating printable report:', error);
    alert('Error al generar el reporte PDF. Por favor, intenta nuevamente.');
  }
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
