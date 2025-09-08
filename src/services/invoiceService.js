// Servicio para generar notas de venta en PDF

import jsPDF from 'jspdf';
import { CURRENCY } from '../utils/constants';

// Configuración de la empresa
const COMPANY_INFO = {
  name: "Son D'licias",
  ruc: "20123456789", // Cambiar por el RUC real
  address: "Av. Manuel María Izaga 510", // Cambiar por la dirección real
  phone: "979819152", // Cambiar por el teléfono real
  email: "info@sondelicias.com" // Cambiar por el email real
};

export class InvoiceService {
  
  static generateSalesNote(order, paymentData) {
    try {
      // Configurar PDF para media hoja (A4 dividido por 2)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [105, 148] // Media hoja A4 (210/2 = 105, 297/2 = 148)
      });
      
      // Configurar fuente
      doc.setFont('helvetica');
      
      
      this.addCompanyHeader(doc);
      
      // Título
      this.addTitle(doc);
      
      // Información de la venta
      this.addSaleInfo(doc, order, paymentData);
      
      // Tabla de productos
      this.addProductsTable(doc, order);
      
      // Totales
      this.addTotals(doc, order, paymentData);
      
      // Footer
      this.addFooter(doc);
      
      // Generar nombre de archivo
      const fileName = `nota-venta-${order.id}-${new Date().toISOString().slice(0, 10)}.pdf`;
      
      // Descargar PDF
      doc.save(fileName);
      
      return { success: true, fileName };
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      return { success: false, error: error.message };
    }
  }
  
  static addCompanyHeader(doc) {
    // Logo placeholder (puedes agregar logo real después)
    doc.setFillColor(52, 73, 94);
    doc.rect(5, 10, 95, 20, 'F');
    
    // Nombre de la empresa
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_INFO.name, 8, 18);
    
    // Información de la empresa
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`RUC: ${COMPANY_INFO.ruc}`, 8, 24);
    doc.text(COMPANY_INFO.address, 8, 27);
    
    // Resetear color de texto
    doc.setTextColor(0, 0, 0);
  }
  
  static addTitle(doc) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTA DE VENTA', 52.5, 40, { align: 'center' });
    
    // Línea decorativa
    doc.setLineWidth(0.3);
    doc.line(5, 43, 100, 43);
  }
  
  static addSaleInfo(doc, order, paymentData) {
    const startY = 48;
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    
    // Información básica en una sola columna para aprovechar espacio
    doc.text(`Orden N°: ${order.id}`, 8, startY);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-PE')} - ${new Date().toLocaleTimeString('es-PE')}`, 8, startY + 4);
    
    if (order.tableId) {
      doc.text(`Mesa: ${order.tableId}`, 8, startY + 8);
    }
    
    if (order.customerName) {
      doc.text(`Cliente: ${order.customerName}`, 8, startY + 12);
    }
    
    if (order.customerPhone) {
      doc.text(`Teléfono: ${order.customerPhone}`, 8, startY + 16);
    }
    
    doc.text(`Método de Pago: ${paymentData.paymentMethod.toUpperCase()}`, 8, startY + 20);
    
    if (paymentData.paymentMethod === 'efectivo' && paymentData.change > 0) {
      doc.text(`Vuelto: ${CURRENCY} ${paymentData.change.toFixed(2)}`, 8, startY + 24);
    }
    
    if (order.notes) {
      doc.text(`Notas: ${order.notes}`, 8, startY + 28);
    }
  }
  
  static addProductsTable(doc, order) {
    const startY = order.notes ? 85 : 75;
    let currentY = startY;
    
    // Header de la tabla
    doc.setFillColor(52, 73, 94);
    doc.rect(5, currentY, 95, 8, 'F');
    
    // Texto del header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Cant.', 7, currentY + 5);
    doc.text('Producto', 20, currentY + 5);
    doc.text('P.Unit', 65, currentY + 5);
    doc.text('Subtotal', 80, currentY + 5);
    
    currentY += 10;
    
    // Items de la tabla
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    
    order.items.forEach((item, index) => {
      // Fondo alternado
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(5, currentY - 1, 95, 7, 'F');
      }
      
      // Contenido de la fila
      doc.text(item.quantity.toString(), 7, currentY + 4);
      doc.text(item.name.substring(0, 20), 20, currentY + 4); // Truncar nombre largo
      doc.text(`${item.price.toFixed(2)}`, 65, currentY + 4);
      doc.text(`${(item.price * item.quantity).toFixed(2)}`, 80, currentY + 4);
      
      currentY += 7;
    });
    
    // Línea inferior de la tabla
    doc.setDrawColor(200, 200, 200);
    doc.line(5, currentY, 100, currentY);
    
    // Guardar posición final
    doc._lastAutoTableY = currentY + 3;
  }
  
  static addTotals(doc, order, paymentData) {
    const finalY = doc._lastAutoTableY + 5;
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    
    // Subtotal
    if (order.subtotal && order.subtotal !== order.total) {
      doc.text(`Subtotal: ${CURRENCY} ${order.subtotal.toFixed(2)}`, 60, finalY);
    }
    
    // IGV (si aplica)
    if (order.tax && order.tax > 0) {
      doc.text(`IGV (18%): ${CURRENCY} ${order.tax.toFixed(2)}`, 60, finalY + 4);
    }
    
    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`TOTAL: ${CURRENCY} ${order.total.toFixed(2)}`, 60, finalY + (order.tax > 0 ? 8 : 4));
    
    // Información de pago
    if (paymentData.paymentMethod === 'efectivo') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.text(`Efectivo: ${CURRENCY} ${paymentData.amountPaid?.toFixed(2) || order.total.toFixed(2)}`, 8, finalY + 15);
      
      if (paymentData.change > 0) {
        doc.text(`Vuelto: ${CURRENCY} ${paymentData.change.toFixed(2)}`, 8, finalY + 19);
      }
    }
  }
  
  static addFooter(doc) {
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setFontSize(6);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    
    // Mensaje de agradecimiento
    doc.text('¡Gracias por su preferencia!', 52.5, pageHeight - 25, { align: 'center' });
    doc.text('Esperamos verle pronto', 52.5, pageHeight - 21, { align: 'center' });
    
    // Información de contacto
    doc.text(`Tel: ${COMPANY_INFO.phone}`, 52.5, pageHeight - 15, { align: 'center' });
    doc.text(`Email: ${COMPANY_INFO.email}`, 52.5, pageHeight - 11, { align: 'center' });
    
    // Fecha de generación
    doc.text(`${new Date().toLocaleString('es-PE')}`, 52.5, pageHeight - 5, { align: 'center' });
  }
}

export default InvoiceService;