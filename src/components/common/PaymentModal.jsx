// Modal para procesar pagos al completar la orden - IMPORTS CORREGIDOS

import React, { useState } from 'react';
import { CreditCard, Smartphone, DollarSign, CheckCircle, FileText } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal, { ModalBody, ModalFooter } from '../ui/Modal';
import { CURRENCY } from '../../utils/constants';
import { InvoiceService } from '../../services/invoiceService';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  order, 
  onProcessPayment,
  loading = false 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [amountReceived, setAmountReceived] = useState('');
  const [notes, setNotes] = useState('');
  const [generatePDF, setGeneratePDF] = useState(true); // Por defecto generar PDF

  const paymentMethods = [
    { value: 'efectivo', label: 'Efectivo', icon: DollarSign, color: 'text-green-600' },
    { value: 'yape', label: 'Yape', icon: Smartphone, color: 'text-purple-600' },
    { value: 'plin', label: 'Plin', icon: Smartphone, color: 'text-blue-600' },
    { value: 'tarjeta', label: 'Tarjeta', icon: CreditCard, color: 'text-gray-600' }
  ];

  const calculateChange = () => {
    if (paymentMethod === 'efectivo' && amountReceived) {
      const received = parseFloat(amountReceived);
      const total = parseFloat(order?.total || 0);
      return received - total;
    }
    return 0;
  };

  const handleProcessPayment = async () => {
    if (paymentMethod === 'efectivo') {
      const received = parseFloat(amountReceived);
      const total = parseFloat(order?.total || 0);
      
      if (!received || received < total) {
        alert('El monto recibido debe ser mayor o igual al total');
        return;
      }
    }

    const paymentData = {
      orderId: order.id,
      paymentMethod,
      amountReceived: paymentMethod === 'efectivo' ? parseFloat(amountReceived) : parseFloat(order?.total || 0),
      amountPaid: paymentMethod === 'efectivo' ? parseFloat(amountReceived) : parseFloat(order?.total || 0),
      change: calculateChange(),
      notes: notes.trim() || null,
      generatePDF
    };

    try {
      await onProcessPayment(paymentData);
      
      // Generar PDF si está habilitado
      if (generatePDF) {
        const result = InvoiceService.generateSalesNote(order, paymentData);
        if (result.success) {
          console.log('PDF generado exitosamente:', result.fileName);
        } else {
          console.error('Error generando PDF:', result.error);
          alert('Pago procesado, pero hubo un error generando la nota de venta: ' + result.error);
        }
      }
      
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error al procesar el pago: ' + error.message);
    }
  };

  const resetForm = () => {
    setPaymentMethod('efectivo');
    setAmountReceived('');
    setNotes('');
    setGeneratePDF(true);
  };

  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Procesar Pago - Orden #${order.id}`}
      size="lg"
    >
      <ModalBody>
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Resumen de la Orden</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Mesa:</span>
                <span>{order.tableId ? `Mesa ${order.tableId}` : 'Sin mesa'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cliente:</span>
                <span>{order.customerName || 'Cliente general'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{CURRENCY} {parseFloat(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                <span>Total a Pagar:</span>
                <span className="text-orange-600">
                  {CURRENCY} {parseFloat(order.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                      paymentMethod === method.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-8 w-8 ${method.color}`} />
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === 'efectivo' && (
            <div className="space-y-4">
              <Input
                label="Monto Recibido"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                required
              />
              
              {amountReceived && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-800">Vuelto:</span>
                    <span className={`font-bold text-lg ${
                      calculateChange() >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {CURRENCY} {calculateChange().toFixed(2)}
                    </span>
                  </div>
                  {calculateChange() < 0 && (
                    <p className="text-red-600 text-sm mt-1">
                      ⚠️ El monto recibido es insuficiente
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Digital Payment Confirmation */}
          {paymentMethod !== 'efectivo' && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  Confirmar pago de {CURRENCY} {parseFloat(order.total || 0).toFixed(2)} por {
                    paymentMethods.find(m => m.value === paymentMethod)?.label
                  }
                </span>
              </div>
            </div>
          )}

          {/* Payment Notes */}
          <Input
            label="Notas del Pago (Opcional)"
            placeholder="Observaciones adicionales..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* PDF Generation Option */}
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              id="generatePDF"
              checked={generatePDF}
              onChange={(e) => setGeneratePDF(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <label htmlFor="generatePDF" className="text-sm font-medium text-blue-800 cursor-pointer">
                Generar nota de venta en PDF
              </label>
            </div>
          </div>

          {/* Items in Order */}
          <div>
            <h4 className="font-semibold mb-2">Productos</h4>
            <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
              <div className="space-y-1">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{CURRENCY} {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Button 
          variant="secondary" 
          onClick={() => {
            resetForm();
            onClose();
          }}
        >
          Cancelar
        </Button>
        <Button 
          variant="success" 
          onClick={handleProcessPayment}
          loading={loading}
          disabled={
            loading || 
            (paymentMethod === 'efectivo' && (!amountReceived || calculateChange() < 0))
          }
        >
          {paymentMethod === 'efectivo' ? 'Procesar Pago en Efectivo' : `Confirmar Pago por ${paymentMethods.find(m => m.value === paymentMethod)?.label}`}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default PaymentModal;