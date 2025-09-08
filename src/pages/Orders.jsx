// Página de gestión de órdenes con sistema de pagos y liberación de mesas

import React, { useState, useMemo } from 'react';
import { Search, Eye, Trash2, Filter, Clock, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import PaymentModal from '../components/common/PaymentModal';
import { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, CURRENCY } from '../utils/constants';
import orderService from '../services/orderService';
import useTables from '../hooks/useTables';

const Orders = ({ orders = [], onUpdateOrderStatus, onDeleteOrder, onReloadOrders }) => {
  const { releaseTable } = useTables(); // ← NUEVO: Hook para liberar mesas
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [orderForPayment, setOrderForPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Filtrar órdenes
  const filteredOrders = useMemo(() => {
    let filtered = [...orders].sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toString().includes(searchTerm) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    return filtered;
  }, [orders, searchTerm, statusFilter]);

  // Estadísticas
  const stats = useMemo(() => ({
    total: orders.length,
    preparando: orders.filter(o => o.status === ORDER_STATUS.PREPARANDO).length,
    listo: orders.filter(o => o.status === ORDER_STATUS.LISTO).length,
    completado: orders.filter(o => o.status === ORDER_STATUS.COMPLETADO).length,
    cancelado: orders.filter(o => o.status === ORDER_STATUS.CANCELADO).length,
  }), [orders]);

  // FUNCIÓN MODIFICADA: Cambio de estado con liberación de mesa
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      
      // Si el nuevo estado es "completado" y la orden tiene mesa asignada, liberar la mesa
      if (newStatus === ORDER_STATUS.COMPLETADO && order?.tableId) {
        console.log(`Liberando mesa ${order.tableId} de la orden ${orderId}`);
        const tableResult = await releaseTable(order.tableId);
        if (tableResult.success) {
          console.log(`Mesa ${order.tableId} liberada exitosamente`);
        } else {
          console.warn('Error al liberar mesa:', tableResult.error);
          // No bloquear el cambio de estado si falla liberar la mesa
        }
      }
      
      // Actualizar estado de la orden
      await onUpdateOrderStatus?.(orderId, newStatus);
      
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar estado de la orden');
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleDeleteOrder = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (orderToDelete) {
      try {
        // Si la orden tiene mesa asignada, liberarla antes de eliminar
        if (orderToDelete.tableId) {
          const tableResult = await releaseTable(orderToDelete.tableId);
          if (tableResult.success) {
            console.log(`Mesa ${orderToDelete.tableId} liberada antes de eliminar orden`);
          }
        }
        
        await onDeleteOrder?.(orderToDelete.id);
        setShowDeleteModal(false);
        setOrderToDelete(null);
      } catch (error) {
        console.error('Error al eliminar orden:', error);
        alert('Error al eliminar la orden');
      }
    }
  };

  // Procesar pago
  const handleProcessPayment = (order) => {
    setOrderForPayment(order);
    setShowPaymentModal(true);
  };

  // FUNCIÓN MODIFICADA: Completar pago con liberación de mesa
  const handleCompletePayment = async (paymentData) => {
    try {
      setPaymentLoading(true);
      
      const order = orders.find(o => o.id === paymentData.orderId);
      
      // Actualizar orden con método de pago y completar
      const result = await orderService.completeOrderWithPayment(
        paymentData.orderId, 
        paymentData.paymentMethod
      );

      if (result.success) {
        // Si la orden tiene mesa asignada, liberarla
        if (order?.tableId) {
          console.log(`Liberando mesa ${order.tableId} después del pago`);
          const tableResult = await releaseTable(order.tableId);
          if (tableResult.success) {
            console.log(`Mesa ${order.tableId} liberada después del pago`);
          } else {
            console.warn('Error al liberar mesa después del pago:', tableResult.error);
          }
        }
        
        // Recargar órdenes
        await onReloadOrders?.();
        
        // Mostrar mensaje de éxito
        const tableMessage = order?.tableId ? ` Mesa ${order.tableId} liberada.` : '';
        const pdfMessage = paymentData.generatePDF !== false ? '\n📄 Nota de venta descargada automáticamente' : '';
        alert(`¡Pago procesado exitosamente!${tableMessage}\nMétodo: ${paymentData.paymentMethod.toUpperCase()}\nVuelto: ${CURRENCY} ${paymentData.change?.toFixed(2) || '0.00'}${pdfMessage}`);
        
        // Cerrar modal
        setShowPaymentModal(false);
        setOrderForPayment(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error al procesar el pago: ' + error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.PREPARANDO:
        return <Clock className="h-4 w-4" />;
      case ORDER_STATUS.LISTO:
        return <CheckCircle className="h-4 w-4" />;
      case ORDER_STATUS.COMPLETADO:
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: ORDER_STATUS.PREPARANDO, label: ORDER_STATUS_LABELS[ORDER_STATUS.PREPARANDO] },
    { value: ORDER_STATUS.LISTO, label: ORDER_STATUS_LABELS[ORDER_STATUS.LISTO] },
    { value: ORDER_STATUS.COMPLETADO, label: ORDER_STATUS_LABELS[ORDER_STATUS.COMPLETADO] },
    { value: ORDER_STATUS.CANCELADO, label: ORDER_STATUS_LABELS[ORDER_STATUS.CANCELADO] },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Órdenes</h2>
        <p className="text-gray-600">Administra, monitorea y procesa pagos de todas las órdenes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card className="text-center border-l-4 border-yellow-400">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.preparando}</div>
            <div className="text-sm text-gray-600">Preparando</div>
          </CardContent>
        </Card>
        <Card className="text-center border-l-4 border-blue-400">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.listo}</div>
            <div className="text-sm text-gray-600">Listas para Pago</div>
          </CardContent>
        </Card>
        <Card className="text-center border-l-4 border-green-400">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completado}</div>
            <div className="text-sm text-gray-600">Completadas</div>
          </CardContent>
        </Card>
        <Card className="text-center border-l-4 border-red-400">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.cancelado}</div>
            <div className="text-sm text-gray-600">Canceladas</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por ID, cliente o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
            <div className="md:w-64">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
              />
            </div>
            {(searchTerm || statusFilter) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
          
          {filteredOrders.length !== orders.length && (
            <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>Mostrando {filteredOrders.length} de {orders.length} órdenes</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente/Mesa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">#{order.id}</div>
                      {order.paymentMethod && (
                        <div className="text-xs text-gray-500">
                          Pago: {order.paymentMethod.toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.customerName || 'Cliente general'}
                      </div>
                      {order.tableId && (
                        <div className="text-xs text-orange-600 font-medium">
                          🪑 Mesa {order.tableId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.createdAt || order.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {order.items?.length || 0} productos
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.items?.slice(0, 2).map(item => item.name).join(', ')}
                        {order.items?.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {CURRENCY} {order.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-0 ${ORDER_STATUS_COLORS[order.status]}`}
                      >
                        {Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => (
                          <option key={status} value={status}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        icon={Eye}
                        title="Ver detalles"
                      />
                      
                      {/* Botón de procesar pago */}
                      {order.status === ORDER_STATUS.LISTO && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleProcessPayment(order)}
                          icon={CreditCard}
                          title="Procesar pago"
                        />
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOrder(order)}
                        icon={Trash2}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar orden"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No se encontraron órdenes</h3>
                <p className="text-gray-500">
                  {orders.length === 0 
                    ? 'No hay órdenes registradas aún'
                    : 'Intenta cambiar los filtros de búsqueda'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title={`Orden #${selectedOrder?.id}`}
        size="lg"
      >
        {selectedOrder && (
          <ModalBody>
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <p className="text-sm text-gray-900">{selectedOrder.customerName || 'Cliente general'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mesa</label>
                  <p className="text-sm text-gray-900">
                    {selectedOrder.tableId ? `Mesa ${selectedOrder.tableId}` : 'Sin mesa asignada'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[selectedOrder.status]}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{ORDER_STATUS_LABELS[selectedOrder.status]}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                  <p className="text-sm font-semibold text-gray-900">
                    {CURRENCY} {selectedOrder.total.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Payment Info */}
              {selectedOrder.paymentMethod && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Información de Pago</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-700">Método:</span>
                      <span className="ml-2 font-medium">{selectedOrder.paymentMethod.toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="text-green-700">Estado:</span>
                      <span className="ml-2 font-medium">{selectedOrder.paymentStatus || 'Pagado'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Table Status Info */}
              {selectedOrder.tableId && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-medium text-orange-800 mb-2">Estado de Mesa</h4>
                  <p className="text-sm text-orange-700">
                    🪑 Mesa {selectedOrder.tableId} - 
                    {selectedOrder.status === ORDER_STATUS.COMPLETADO ? 
                      ' Mesa liberada automáticamente' : 
                      ' Mesa ocupada hasta completar orden'
                    }
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Productos</label>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-600 text-sm ml-2">x{item.quantity}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{CURRENCY} {(item.price * item.quantity).toFixed(2)}</div>
                        <div className="text-sm text-gray-500">{CURRENCY} {item.price} c/u</div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-orange-600">{CURRENCY} {selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Cerrar
          </Button>
          {selectedOrder?.status === ORDER_STATUS.LISTO && (
            <Button 
              variant="success" 
              icon={CreditCard}
              onClick={() => {
                setShowOrderModal(false);
                handleProcessPayment(selectedOrder);
              }}
            >
              Procesar Pago
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar Orden"
        size="sm"
      >
        <ModalBody>
          <div className="text-center">
            <Trash2 className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¿Eliminar orden #{orderToDelete?.id}?
            </h3>
            <p className="text-gray-600">
              Esta acción no se puede deshacer. La orden será eliminada permanentemente.
              {orderToDelete?.tableId && (
                <span className="block mt-2 text-orange-600 font-medium">
                  🪑 La mesa {orderToDelete.tableId} será liberada automáticamente.
                </span>
              )}
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Eliminar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setOrderForPayment(null);
        }}
        order={orderForPayment}
        onProcessPayment={handleCompletePayment}
        loading={paymentLoading}
      />
    </div>
  );
};

export default Orders;