// Página de producción/cocina para Son D'licias - Código completo

import React, { useState, useMemo } from 'react';
import { Coffee, Utensils, Clock, CheckCircle, AlertCircle, Users, Bell } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ORDER_STATUS, ORDER_STATUS_LABELS, CURRENCY } from '../utils/constants';

const Production = ({ orders = [], onUpdateOrderStatus }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filtrar órdenes por estado
  const ordersByStatus = useMemo(() => ({
    preparando: orders.filter(order => order.status === ORDER_STATUS.PREPARANDO),
    listo: orders.filter(order => order.status === ORDER_STATUS.LISTO),
    completado: orders.filter(order => order.status === ORDER_STATUS.COMPLETADO)
  }), [orders]);

  // Estadísticas de producción
  const stats = useMemo(() => ({
    enPreparacion: ordersByStatus.preparando.length,
    listas: ordersByStatus.listo.length,
    completadas: ordersByStatus.completado.length,
    tiempoPromedio: '12 min', // Esto se calcularía con datos reales
    eficiencia: '94%' // Esto también se calcularía con datos reales
  }), [ordersByStatus]);

  const handleStatusChange = (orderId, newStatus) => {
    onUpdateOrderStatus?.(orderId, newStatus);
  };

  const getTimeElapsed = (timestamp) => {
    const orderTime = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Hace un momento';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m`;
    return 'Más de 1 día';
  };

  const getOrderPriority = (order) => {
    const orderTime = new Date(order.createdAt || order.timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffMinutes > 30) return 'high';
    if (diffMinutes > 15) return 'medium';
    return 'normal';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Producción - Vista de Cocina</h2>
        <p className="text-gray-600">Gestiona las órdenes en preparación y marca cuando estén listas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center border-l-4 border-yellow-400">
          <CardContent className="p-4">
            <Coffee className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{stats.enPreparacion}</div>
            <div className="text-sm text-gray-600">En Preparación</div>
          </CardContent>
        </Card>
        
        <Card className="text-center border-l-4 border-blue-400">
          <CardContent className="p-4">
            <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{stats.listas}</div>
            <div className="text-sm text-gray-600">Listas para Servir</div>
          </CardContent>
        </Card>
        
        <Card className="text-center border-l-4 border-green-400">
          <CardContent className="p-4">
            <Utensils className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{stats.completadas}</div>
            <div className="text-sm text-gray-600">Completadas</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{stats.tiempoPromedio}</div>
            <div className="text-sm text-gray-600">Tiempo Promedio</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{stats.eficiencia}</div>
            <div className="text-sm text-gray-600">Eficiencia</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders in Preparation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coffee className="h-5 w-5 text-yellow-600" />
              <span>Órdenes en Preparación ({ordersByStatus.preparando.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {ordersByStatus.preparando.map(order => {
                const priority = getOrderPriority(order);
                return (
                  <OrderCard
                    key={order.id}
                    order={order}
                    priority={priority}
                    timeElapsed={getTimeElapsed(order.createdAt || order.timestamp)}
                    onStatusChange={handleStatusChange}
                    actionButton={
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleStatusChange(order.id, ORDER_STATUS.LISTO)}
                      >
                        ✅ Marcar Listo
                      </Button>
                    }
                  />
                );
              })}
              
              {ordersByStatus.preparando.length === 0 && (
                <EmptyState
                  icon={Coffee}
                  title="No hay órdenes en preparación"
                  description="Todas las órdenes están completadas o listas para entregar"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ready Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <span>Órdenes Listas para Servir ({ordersByStatus.listo.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {ordersByStatus.listo.map(order => {
                const priority = getOrderPriority(order);
                return (
                  <OrderCard
                    key={order.id}
                    order={order}
                    priority={priority}
                    timeElapsed={getTimeElapsed(order.createdAt || order.timestamp)}
                    onStatusChange={handleStatusChange}
                    actionButton={
                      <div className="text-center">
                        <div className="bg-blue-50 rounded-lg p-2 mb-2">
                          <p className="text-xs text-blue-700 font-medium">
                            🔔 Lista para servir
                          </p>
                          <p className="text-xs text-blue-600">
                            El mesero procesará el pago
                          </p>
                        </div>
                      </div>
                    }
                    showReadyBadge={true}
                  />
                );
              })}
              
              {ordersByStatus.listo.length === 0 && (
                <EmptyState
                  icon={CheckCircle}
                  title="No hay órdenes listas"
                  description="Las órdenes aparecerán aquí cuando estén listas para servir"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completed Orders Today */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Utensils className="h-5 w-5 text-green-600" />
            <span>Órdenes Completadas Hoy ({ordersByStatus.completado.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
            {ordersByStatus.completado.slice(0, 6).map(order => (
              <div
                key={order.id}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-green-800">Orden #{order.id}</div>
                  <div className="text-sm text-green-600">
                    {getTimeElapsed(order.updatedAt || order.timestamp)}
                  </div>
                </div>
                
                <div className="text-sm text-green-700 mb-2">
                  {order.customerName || 'Cliente general'}
                </div>
                
                <div className="text-sm text-green-600 mb-2">
                  {order.items?.length || 0} items • {CURRENCY} {order.total.toFixed(2)}
                </div>
                
                {order.paymentMethod && (
                  <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    💳 Pagado con {order.paymentMethod.toUpperCase()}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {ordersByStatus.completado.length === 0 && (
            <EmptyState
              icon={Utensils}
              title="No hay órdenes completadas hoy"
              description="Las órdenes completadas aparecerán aquí"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Order Card Component
const OrderCard = ({ order, priority, timeElapsed, onStatusChange, actionButton, showReadyBadge = false }) => {
  const priorityColors = {
    high: 'border-red-400 bg-red-50',
    medium: 'border-yellow-400 bg-yellow-50',
    normal: 'border-gray-200 bg-white'
  };

  const priorityIcons = {
    high: <AlertCircle className="h-4 w-4 text-red-600" />,
    medium: <Clock className="h-4 w-4 text-yellow-600" />,
    normal: null
  };

  return (
    <div className={`border-l-4 rounded-lg p-4 ${priorityColors[priority]} hover:shadow-md transition-shadow ${showReadyBadge ? 'ring-2 ring-blue-200' : ''}`}>
      {/* Badge para órdenes listas */}
      {showReadyBadge && (
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-blue-700">Lista para servir</span>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <h4 className="font-semibold text-gray-800">Orden #{order.id}</h4>
          {priorityIcons[priority]}
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-800">
            {CURRENCY} {order.total.toFixed(2)}
          </div>
          <div className="text-xs text-gray-600">{timeElapsed}</div>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-sm text-gray-700 mb-1">
          <strong>Cliente:</strong> {order.customerName || 'Cliente general'}
        </div>
        
        {order.tableId && (
          <div className="text-sm text-gray-700 mb-1">
            <strong>Mesa:</strong> {order.tableId}
          </div>
        )}
        
        {order.notes && (
          <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded mb-2">
            <strong>Notas:</strong> {order.notes}
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Items:</div>
        <div className="space-y-1">
          {order.items?.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.name}</span>
              <span className="text-gray-600 font-medium">x{item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Recibida: {new Date(order.createdAt || order.timestamp).toLocaleTimeString()}
        </div>
        {actionButton}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="text-center py-8 text-gray-500">
    <Icon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
    <h3 className="font-medium text-gray-600 mb-1">{title}</h3>
    <p className="text-sm">{description}</p>
  </div>
);

export default Production;