// Sistema de exportación avanzado para reportes de Son D'licias
// Exporta a PDF, Excel, CSV y envío por email

import React, { useState } from 'react';
import { Download, FileText, Mail, Calendar, Printer, Share2, Settings } from 'lucide-react';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import { CURRENCY } from '../utils/constants';

// Servicio de exportación
export class ExportService {
  constructor() {
    this.formats = {
      PDF: 'pdf',
      EXCEL: 'xlsx',
      CSV: 'csv',
      JSON: 'json'
    };
  }

  // Generar CSV
  generateCSV(data, options = {}) {
    const { 
      filename = 'reporte-son-dlicias',
      includeHeaders = true,
      separator = ',',
      dateRange,
      reportType
    } = options;

    let csvContent = '';
    
    // Header del reporte
    csvContent += `REPORTE SON D'LICIAS\n`;
    csvContent += `Generado: ${new Date().toLocaleString()}\n`;
    if (dateRange) {
      csvContent += `Período: ${dateRange.from} - ${dateRange.to}\n`;
    }
    csvContent += `Tipo: ${reportType || 'General'}\n\n`;

    // Resumen ejecutivo
    if (data.summary) {
      csvContent += `RESUMEN EJECUTIVO\n`;
      csvContent += `Métrica${separator}Valor\n`;
      Object.entries(data.summary).forEach(([key, value]) => {
        csvContent += `${this.formatKey(key)}${separator}${this.formatValue(value)}\n`;
      });
      csvContent += '\n';
    }

    // Datos principales
    if (data.main && data.main.length > 0) {
      csvContent += `${reportType?.toUpperCase() || 'DATOS'}\n`;
      
      const headers = Object.keys(data.main[0]);
      if (includeHeaders) {
        csvContent += headers.map(h => this.formatKey(h)).join(separator) + '\n';
      }
      
      data.main.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          return this.escapeCsvValue(this.formatValue(value));
        });
        csvContent += values.join(separator) + '\n';
      });
      csvContent += '\n';
    }

    // Análisis adicional
    if (data.analysis) {
      csvContent += `ANÁLISIS ADICIONAL\n`;
      Object.entries(data.analysis).forEach(([section, sectionData]) => {
        csvContent += `\n${section.toUpperCase()}\n`;
        if (Array.isArray(sectionData)) {
          sectionData.forEach(item => {
            if (typeof item === 'object') {
              const values = Object.values(item).map(v => this.formatValue(v));
              csvContent += values.join(separator) + '\n';
            } else {
              csvContent += `${this.formatValue(item)}\n`;
            }
          });
        } else if (typeof sectionData === 'object') {
          Object.entries(sectionData).forEach(([key, value]) => {
            csvContent += `${this.formatKey(key)}${separator}${this.formatValue(value)}\n`;
          });
        }
      });
    }

    // Footer
    csvContent += `\nReporte generado por Son D'licias - Sistema de Gestión\n`;
    csvContent += `© ${new Date().getFullYear()} Son D'licias - Todos los derechos reservados\n`;

    return csvContent;
  }

  // Generar datos para Excel (compatible con bibliotecas como SheetJS)
  generateExcelData(data, options = {}) {
    const workbook = {
      SheetNames: [],
      Sheets: {}
    };

    // Hoja de resumen
    if (data.summary) {
      const summaryData = [
        ['RESUMEN EJECUTIVO'],
        ['Generado:', new Date().toLocaleString()],
        ['Período:', `${options.dateRange?.from || ''} - ${options.dateRange?.to || ''}`],
        [''],
        ['Métrica', 'Valor'],
        ...Object.entries(data.summary).map(([key, value]) => [
          this.formatKey(key),
          this.formatValue(value)
        ])
      ];

      workbook.SheetNames.push('Resumen');
      workbook.Sheets['Resumen'] = this.arrayToSheet(summaryData);
    }

    // Hoja principal de datos
    if (data.main && data.main.length > 0) {
      const mainSheetName = options.reportType || 'Datos';
      const headers = Object.keys(data.main[0]).map(h => this.formatKey(h));
      const mainData = [
        headers,
        ...data.main.map(row => 
          Object.values(row).map(value => this.formatValue(value))
        )
      ];

      workbook.SheetNames.push(mainSheetName);
      workbook.Sheets[mainSheetName] = this.arrayToSheet(mainData);
    }

    // Hojas de análisis adicional
    if (data.analysis) {
      Object.entries(data.analysis).forEach(([section, sectionData]) => {
        if (Array.isArray(sectionData) && sectionData.length > 0) {
          const sheetData = [];
          
          if (typeof sectionData[0] === 'object') {
            const headers = Object.keys(sectionData[0]).map(h => this.formatKey(h));
            sheetData.push(headers);
            sheetData.push(...sectionData.map(row => 
              Object.values(row).map(value => this.formatValue(value))
            ));
          } else {
            sheetData.push([this.formatKey(section)]);
            sheetData.push(...sectionData.map(item => [this.formatValue(item)]));
          }

          const sheetName = this.formatKey(section);
          workbook.SheetNames.push(sheetName);
          workbook.Sheets[sheetName] = this.arrayToSheet(sheetData);
        }
      });
    }

    return workbook;
  }

  // Generar estructura de datos para PDF
  generatePDFData(data, options = {}) {
    return {
      title: 'Son D\'licias - Reporte de Gestión',
      subtitle: options.reportType || 'Reporte General',
      date: new Date().toLocaleString(),
      period: options.dateRange ? 
        `${options.dateRange.from} - ${options.dateRange.to}` : null,
      
      sections: [
        {
          title: 'Resumen Ejecutivo',
          type: 'summary',
          data: data.summary || {}
        },
        {
          title: options.reportType || 'Datos Principales',
          type: 'table',
          data: data.main || [],
          columns: data.main && data.main.length > 0 ? 
            Object.keys(data.main[0]).map(key => ({
              key,
              title: this.formatKey(key),
              width: 'auto'
            })) : []
        },
        ...(data.analysis ? Object.entries(data.analysis).map(([section, sectionData]) => ({
          title: this.formatKey(section),
          type: Array.isArray(sectionData) ? 'table' : 'summary',
          data: sectionData
        })) : [])
      ],
      
      footer: {
        company: 'Son D\'licias',
        slogan: 'Más que un antojo',
        year: new Date().getFullYear()
      }
    };
  }

  // Utilidades
  formatKey(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  }

  formatValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') {
      if (value % 1 === 0) return value.toString();
      return value.toFixed(2);
    }
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (value instanceof Date) return value.toLocaleString();
    return value.toString();
  }

  escapeCsvValue(value) {
    const stringValue = value.toString();
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  arrayToSheet(data) {
    // Simula la estructura de SheetJS para compatibilidad
    const sheet = {};
    const range = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };

    data.forEach((row, rowIndex) => {
      if (Array.isArray(row)) {
        row.forEach((cell, colIndex) => {
          const cellAddress = this.encodeCellAddress(rowIndex, colIndex);
          sheet[cellAddress] = { v: cell, t: this.getCellType(cell) };
          
          if (range.e.c < colIndex) range.e.c = colIndex;
          if (range.e.r < rowIndex) range.e.r = rowIndex;
        });
      }
    });

    sheet['!ref'] = `${this.encodeCellAddress(0, 0)}:${this.encodeCellAddress(range.e.r, range.e.c)}`;
    return sheet;
  }

  encodeCellAddress(row, col) {
    let colName = '';
    let colNum = col;
    while (colNum >= 0) {
      colName = String.fromCharCode(65 + (colNum % 26)) + colName;
      colNum = Math.floor(colNum / 26) - 1;
    }
    return colName + (row + 1);
  }

  getCellType(value) {
    if (typeof value === 'number') return 'n';
    if (typeof value === 'boolean') return 'b';
    if (value instanceof Date) return 'd';
    return 's';
  }

  // Descargar archivo
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Exportar a CSV
  async exportToCSV(data, options = {}) {
    const filename = `${options.filename || 'reporte-son-dlicias'}-${new Date().toISOString().split('T')[0]}.csv`;
    const csvContent = this.generateCSV(data, options);
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    return { success: true, filename };
  }

  // Exportar a JSON
  async exportToJSON(data, options = {}) {
    const filename = `${options.filename || 'reporte-son-dlicias'}-${new Date().toISOString().split('T')[0]}.json`;
    const jsonContent = JSON.stringify({
      metadata: {
        generated: new Date().toISOString(),
        period: options.dateRange,
        reportType: options.reportType,
        version: '1.0'
      },
      ...data
    }, null, 2);
    this.downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
    return { success: true, filename };
  }

  // Generar PDF (simulado - en producción usarías jsPDF o similar)
  async exportToPDF(data, options = {}) {
    const filename = `${options.filename || 'reporte-son-dlicias'}-${new Date().toISOString().split('T')[0]}.pdf`;
    const pdfData = this.generatePDFData(data, options);
    
    // En una implementación real, aquí usarías jsPDF
    console.log('PDF Data for generation:', pdfData);
    
    // Simular descarga
    const htmlContent = this.generateHTMLForPrint(pdfData);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // Abrir en nueva ventana para imprimir
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    
    return new Promise((resolve) => {
      setTimeout(() => {
        if (printWindow) {
          printWindow.print();
        }
        resolve({ success: true, filename });
      }, 1000);
    });
  }

  generateHTMLForPrint(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${data.title}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #ea580c; }
            .subtitle { font-size: 18px; color: #9a3412; margin: 10px 0; }
            .meta { font-size: 12px; color: #666; }
            .section { margin: 30px 0; }
            .section-title { font-size: 16px; font-weight: bold; color: #ea580c; border-bottom: 1px solid #fed7aa; padding-bottom: 5px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #fed7aa; font-weight: bold; }
            .summary-table td:first-child { font-weight: bold; width: 30%; }
            .footer { text-align: center; margin-top: 50px; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
            @media print {
                body { margin: 0; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">${data.title}</div>
            <div class="subtitle">${data.subtitle}</div>
            <div class="meta">
                Generado: ${data.date}
                ${data.period ? `<br>Período: ${data.period}` : ''}
            </div>
        </div>

        ${data.sections.map(section => `
            <div class="section">
                <div class="section-title">${section.title}</div>
                ${section.type === 'summary' ? this.generateSummaryHTML(section.data) : this.generateTableHTML(section.data, section.columns)}
            </div>
        `).join('')}

        <div class="footer">
            <strong>${data.footer.company}</strong> - ${data.footer.slogan}<br>
            © ${data.footer.year} ${data.footer.company} - Todos los derechos reservados
        </div>
    </body>
    </html>`;
  }

  generateSummaryHTML(data) {
    return `
        <table class="summary-table">
            ${Object.entries(data).map(([key, value]) => `
                <tr>
                    <td>${this.formatKey(key)}</td>
                    <td>${this.formatValue(value)}</td>
                </tr>
            `).join('')}
        </table>
    `;
  }

  generateTableHTML(data, columns = []) {
    if (!Array.isArray(data) || data.length === 0) {
      return '<p>No hay datos para mostrar</p>';
    }

    const headers = columns.length > 0 ? columns : Object.keys(data[0]).map(key => ({ key, title: this.formatKey(key) }));

    return `
        <table>
            <thead>
                <tr>
                    ${headers.map(col => `<th>${col.title}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        ${headers.map(col => `<td>${this.formatValue(row[col.key])}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
  }
}

// Componente React para exportación
export const ExportButton = ({ 
  data, 
  options = {}, 
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [exportOptions, setExportOptions] = useState({
    includeHeaders: true,
    includeAnalysis: true,
    filename: options.filename || 'reporte-son-dlicias',
    emailRecipient: '',
    emailSubject: 'Reporte Son D\'licias',
    emailBody: 'Adjunto encontrarás el reporte solicitado.',
    ...options
  });

  const exportService = new ExportService();

  const handleExport = async () => {
    setLoading(true);
    try {
      let result;
      const exportData = {
        summary: data.summary || {},
        main: data.main || [],
        analysis: exportOptions.includeAnalysis ? (data.analysis || {}) : {}
      };

      const fullOptions = {
        ...exportOptions,
        dateRange: options.dateRange,
        reportType: options.reportType
      };

      switch (selectedFormat) {
        case 'csv':
          result = await exportService.exportToCSV(exportData, fullOptions);
          break;
        case 'json':
          result = await exportService.exportToJSON(exportData, fullOptions);
          break;
        case 'pdf':
          result = await exportService.exportToPDF(exportData, fullOptions);
          break;
        default:
          throw new Error('Formato no soportado');
      }

      if (result.success) {
        // Mostrar notificación de éxito si está disponible
        if (window.showNotification) {
          window.showNotification(`Archivo ${result.filename} generado correctamente`, 'success');
        } else {
          alert(`Archivo ${result.filename} generado correctamente`);
        }
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error en exportación:', error);
      alert('Error al generar el archivo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailExport = async () => {
    if (!exportOptions.emailRecipient) {
      alert('Por favor ingresa un email de destino');
      return;
    }

    setLoading(true);
    try {
      // Generar el archivo
      const exportData = {
        summary: data.summary || {},
        main: data.main || [],
        analysis: exportOptions.includeAnalysis ? (data.analysis || {}) : {}
      };

      const csvContent = exportService.generateCSV(exportData, exportOptions);
      
      // Simular envío por email
      const emailData = {
        to: exportOptions.emailRecipient,
        subject: exportOptions.emailSubject,
        body: exportOptions.emailBody,
        attachment: {
          filename: `${exportOptions.filename}-${new Date().toISOString().split('T')[0]}.csv`,
          content: csvContent,
          mimeType: 'text/csv'
        }
      };

      console.log('Email Data:', emailData);
      
      // En producción, aquí enviarías el email usando un servicio como EmailJS o un endpoint backend
      alert(`Email enviado a ${exportOptions.emailRecipient} (simulado)`);
      setShowModal(false);
    } catch (error) {
      console.error('Error enviando email:', error);
      alert('Error al enviar el email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatOptions = [
    { value: 'csv', label: 'CSV - Excel Compatible', icon: '📊' },
    { value: 'json', label: 'JSON - Datos Estructurados', icon: '🔧' },
    { value: 'pdf', label: 'PDF - Documento Imprimible', icon: '📄' }
  ];

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowModal(true)}
        icon={Download}
      >
        Exportar
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Exportar Reporte"
        size="lg"
      >
        <ModalBody>
          <div className="space-y-6">
            {/* Formato de exportación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Formato de Exportación
              </label>
              <div className="grid grid-cols-1 gap-3">
                {formatOptions.map(format => (
                  <label
                    key={format.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedFormat === format.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={format.value}
                      checked={selectedFormat === format.value}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-3">{format.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {format.label.split(' - ')[0]}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format.label.split(' - ')[1]}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Opciones de exportación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Opciones de Exportación
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeHeaders}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeHeaders: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Incluir encabezados</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeAnalysis}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeAnalysis: e.target.checked 
                    }))}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Incluir análisis detallado</span>
                </label>
              </div>
            </div>

            {/* Nombre de archivo */}
            <Input
              label="Nombre del Archivo"
              placeholder="reporte-son-dlicias"
              value={exportOptions.filename}
              onChange={(e) => setExportOptions(prev => ({ 
                ...prev, 
                filename: e.target.value 
              }))}
            />

            {/* Opciones de email */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Envío por Email (Opcional)
              </h3>
              
              <div className="space-y-4">
                <Input
                  label="Email Destinatario"
                  type="email"
                  placeholder="ejemplo@empresa.com"
                  value={exportOptions.emailRecipient}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    emailRecipient: e.target.value 
                  }))}
                />
                
                <Input
                  label="Asunto"
                  placeholder="Reporte Son D'licias"
                  value={exportOptions.emailSubject}
                  onChange={(e) => setExportOptions(prev => ({ 
                    ...prev, 
                    emailSubject: e.target.value 
                  }))}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Mensaje del email..."
                    value={exportOptions.emailBody}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      emailBody: e.target.value 
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Preview de datos */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Vista Previa de Datos
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Registros principales:</strong> {data.main?.length || 0}
                  </div>
                  <div>
                    <strong>Métricas de resumen:</strong> {Object.keys(data.summary || {}).length}
                  </div>
                  <div>
                    <strong>Secciones de análisis:</strong> {Object.keys(data.analysis || {}).length}
                  </div>
                  <div>
                    <strong>Período:</strong> {options.dateRange ? 
                      `${options.dateRange.from} - ${options.dateRange.to}` : 
                      'No especificado'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <div className="flex justify-between items-center w-full">
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            
            <div className="flex space-x-2">
              {exportOptions.emailRecipient && (
                <Button
                  variant="info"
                  onClick={handleEmailExport}
                  loading={loading}
                  icon={Mail}
                >
                  Enviar Email
                </Button>
              )}
              
              <Button
                variant="primary"
                onClick={handleExport}
                loading={loading}
                icon={Download}
              >
                {loading ? 'Generando...' : 'Descargar'}
              </Button>
            </div>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
};

// Hook para usar el servicio de exportación
export const useExportService = () => {
  const exportService = new ExportService();
  
  const exportData = async (data, format, options = {}) => {
    switch (format) {
      case 'csv':
        return await exportService.exportToCSV(data, options);
      case 'json':
        return await exportService.exportToJSON(data, options);
      case 'pdf':
        return await exportService.exportToPDF(data, options);
      default:
        throw new Error(`Formato ${format} no soportado`);
    }
  };

  const quickExportCSV = async (data, filename = 'export') => {
    return await exportService.exportToCSV(data, { filename });
  };

  const quickExportJSON = async (data, filename = 'export') => {
    return await exportService.exportToJSON(data, { filename });
  };

  return {
    exportService,
    exportData,
    quickExportCSV,
    quickExportJSON
  };
};

export default ExportService;