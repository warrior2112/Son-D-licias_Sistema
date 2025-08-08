// Página principal del Dashboard para Son D'licias

import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, TrendingUp, Users, Coffee, Clock, AlertTriangle } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { CURRENCY } from '../utils/constants';

const Dashboard = ({ orders = [], inventory = [], onNavigate }) => {
  const [dailySales, setDailySales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Calcular ventas del día
      const today = new Date().toDateString();
      const todayOrders = orders.filter(order => 
        new Date(order.createdAt || order.timestamp).toDateString() === today &&
        order.status === 'completado'
      );
      const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
      setDailySales(todaySales);
      
      // Simular delay de carga
      setTimeout(() => setLoading(false), 1000);
    };

    loadDashboardData();
  }, [orders]);

  // Estadísticas calculadas
  const stats = {
    totalOrders: orders.length,
    preparingOrders: orders.filter(o => o.status === 'preparando').length,
    readyOrders: orders.filter(o => o.status === 'listo').length,
    completedOrders: orders.filter(o => o.status === 'completado').length,
    lowStockProducts: inventory.filter(item => item.stock <= (item.minStock || 10)).length,
    outOfStockProducts: inventory.filter(item => item.stock === 0).length,
    totalProducts: inventory.length
  };

  const avgOrderValue = stats.totalOrders > 0 ? dailySales / stats.completedOrders : 0;

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner text="Cargando dashboard..." className="py-20" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Dashboard - Son D'licias</h1>
        <p className="text-gray-600 text-sm sm:text-base">Resumen de actividades del día</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs sm:text-sm font-medium">Ventas del Día</p>
                <p className="text-xl sm:text-2xl font-bold">{CURRENCY} {dailySales.toFixed(2)}</p>
                <p className="text-emerald-200 text-xs mt-1">{stats.completedOrders} órdenes completadas</p>
              </div>
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs sm:text-sm font-medium">Órdenes Activas</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.preparingOrders + stats.readyOrders}</p>
                <p className="text-blue-200 text-xs mt-1">{stats.preparingOrders} preparando, {stats.readyOrders} listas</p>
              </div>
              <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs sm:text-sm font-medium">Productos</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalProducts}</p>
                <p className="text-purple-200 text-xs mt-1">{stats.totalProducts - stats.lowStockProducts} disponibles</p>
              </div>
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-xs sm:text-sm font-medium">Alertas de Stock</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.lowStockProducts}</p>
                <p className="text-rose-200 text-xs mt-1">{stats.outOfStockProducts} sin stock</p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-rose-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Button 
              variant="primary" 
              onClick={() => onNavigate?.('pos')}
              icon={ShoppingCart}
              className="h-16 sm:h-20 flex-col text-xs sm:text-sm"
              size="lg"
            >
              Nueva Orden
            </Button>
            <Button 
              variant="info" 
              onClick={() => onNavigate?.('production')}
              icon={Coffee}
              className="h-16 sm:h-20 flex-col text-xs sm:text-sm"
              size="lg"
            >
              Ver Cocina
            </Button>
            <Button 
              variant="warning" 
              onClick={() => onNavigate?.('inventory')}
              icon={Package}
              className="h-16 sm:h-20 flex-col text-xs sm:text-sm"
              size="lg"
            >
              Inventario
            </Button>
            <Button 
              variant="success" 
              onClick={() => onNavigate?.('reports')}
              icon={TrendingUp}
              className="h-20 flex-col"
            >
              Reportes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <span>Órdenes Recientes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(-5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="font-medium text-gray-800">Orden #{order.id}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completado' ? 'bg-green-100 text-green-800' :
                        order.status === 'listo' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'preparando' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.timestamp || new Date(order.createdAt).toLocaleString()}</p>
                    <div className="text-xs text-gray-500">
                      {order.items?.length || 0} items
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{CURRENCY} {order.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              
              {orders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay órdenes registradas</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              <span>Productos con Stock Bajo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventory
                .filter(item => item.stock <= (item.minStock || 10))
                .slice(0, 5)
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${item.stock === 0 ? 'text-red-600' : 'text-rose-600'}`}>
                        {item.stock} unidades
                      </p>
                      <p className="text-sm text-gray-500">{CURRENCY} {item.price}</p>
                    </div>
                  </div>
                ))}
              
              {stats.lowStockProducts === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Todos los productos tienen stock adecuado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="p-6">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-2xl font-bold text-gray-800">{Math.floor(stats.completedOrders * 1.3)}</p>
            <p className="text-sm text-gray-600">Clientes Atendidos</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-2xl font-bold text-gray-800">{CURRENCY} {avgOrderValue.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Ticket Promedio</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Coffee className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <p className="text-2xl font-bold text-gray-800">{stats.preparingOrders}</p>
            <p className="text-sm text-gray-600">En Preparación</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;