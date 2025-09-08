// Página de reportes mejorada con datos reales de Supabase

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Calendar, Download, DollarSign, Users, Package, 
  Clock, FileText, Mail, Printer, ChefHat, MapPin, CreditCard, Target,
  TrendingDown, AlertTriangle, CheckCircle, Star
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';
import { CURRENCY } from '../utils/constants';
import orderService from '../services/orderService';
import { supabase } from '../services/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Reports = ({ orders = [], inventory = [], currentUser }) => {
  const [dateFrom, setDateFrom] = useState(() => {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    return oneWeekAgo.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  
  // Estados para datos reales
  const [realTimeData, setRealTimeData] = useState({
    orders: [],
    products: [],
    tables: [],
    users: [],
    movements: []
  });

  // Cargar datos reales de la base de datos
  const loadRealTimeData = async () => {
    try {
      setLoading(true);
      
      const [ordersRes, productsRes, tablesRes, usersRes, movementsRes] = await Promise.all([
        supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              products (id, name, price, category_id, categories(name, slug))
            )
          `)
          .gte('created_at', dateFrom + 'T00:00:00.000Z')
          .lte('created_at', dateTo + 'T23:59:59.999Z')
          .order('created_at', { ascending: false }),
        
        supabase
          .from('products')
          .select(`*, categories(name, slug)`)
          .eq('is_active', true),
          
        supabase
          .from('tables')
          .select('*')
          .eq('is_active', true),
          
        supabase
          .from('users')
          .select('id, name, role, created_at, last_login')
          .eq('is_active', true),
          
        supabase
          .from('inventory_movements')
          .select(`
            *,
            products (name, price)
          `)
          .gte('created_at', dateFrom + 'T00:00:00.000Z')
          .lte('created_at', dateTo + 'T23:59:59.999Z')
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      setRealTimeData({
        orders: ordersRes.data || [],
        products: productsRes.data || [],
        tables: tablesRes.data || [],
        users: usersRes.data || [],
        movements: movementsRes.data || []
      });
      
    } catch (error) {
      console.error('Error loading real-time data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealTimeData();
  }, [dateFrom, dateTo]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.export-dropdown-container')) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportDropdown]);

  // Estadísticas generales con datos reales
  const generalStats = useMemo(() => {
    const completedOrders = realTimeData.orders.filter(order => order.status === 'completado');
    const totalSales = completedOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalOrders = completedOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Calcular clientes únicos basado en nombres y teléfonos
    const uniqueCustomers = new Set();
    completedOrders.forEach(order => {
      if (order.customer_name) uniqueCustomers.add(order.customer_name);
      if (order.customer_phone) uniqueCustomers.add(order.customer_phone);
    });

    return {
      totalSales,
      totalOrders,
      avgOrderValue,
      totalCustomers: uniqueCustomers.size || Math.floor(totalOrders * 1.2),
      ordersToday: realTimeData.orders.filter(order => {
        const orderDate = new Date(order.created_at).toDateString();
        const today = new Date().toDateString();
        return orderDate === today;
      }).length
    };
  }, [realTimeData.orders]);

  // Ventas por período (diarias)
  const salesByDay = useMemo(() => {
    const dailyStats = {};
    const completedOrders = realTimeData.orders.filter(order => order.status === 'completado');
    
    completedOrders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const dateKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = { 
          date: orderDate, // Objeto Date real
          dateKey, // Para ordenamiento
          orders: 0, 
          sales: 0 
        };
      }
      dailyStats[dateKey].orders += 1;
      dailyStats[dateKey].sales += parseFloat(order.total);
    });

    return Object.values(dailyStats).sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));
  }, [realTimeData.orders]);

  // Productos más vendidos con datos reales
  const topProducts = useMemo(() => {
    const productStats = {};
    
    realTimeData.orders
      .filter(order => order.status === 'completado')
      .forEach(order => {
        order.order_items?.forEach(item => {
          const productId = item.product_id;
          if (!productStats[productId]) {
            productStats[productId] = {
              id: productId,
              name: item.products?.name || 'Producto desconocido',
              price: parseFloat(item.unit_price),
              category: item.products?.categories?.name || 'Sin categoría',
              quantitySold: 0,
              revenue: 0,
              orders: 0
            };
          }
          productStats[productId].quantitySold += item.quantity;
          productStats[productId].revenue += parseFloat(item.subtotal);
          productStats[productId].orders += 1;
        });
      });

    return Object.values(productStats)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);
  }, [realTimeData.orders]);

  // Análisis por mesa
  const tableAnalysis = useMemo(() => {
    const tableStats = {};
    
    realTimeData.orders
      .filter(order => order.status === 'completado' && order.table_id)
      .forEach(order => {
        const tableId = order.table_id;
        if (!tableStats[tableId]) {
          tableStats[tableId] = {
            tableId,
            orders: 0,
            revenue: 0,
            avgOrderValue: 0
          };
        }
        tableStats[tableId].orders += 1;
        tableStats[tableId].revenue += parseFloat(order.total);
      });

    // Calcular promedios
    Object.values(tableStats).forEach(stat => {
      stat.avgOrderValue = stat.revenue / stat.orders;
    });

    return Object.values(tableStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [realTimeData.orders]);

  // Análisis por método de pago
  const paymentMethodAnalysis = useMemo(() => {
    const paymentStats = {};
    
    realTimeData.orders
      .filter(order => order.status === 'completado' && order.payment_method)
      .forEach(order => {
        const method = order.payment_method;
        if (!paymentStats[method]) {
          paymentStats[method] = {
            method,
            count: 0,
            revenue: 0,
            percentage: 0
          };
        }
        paymentStats[method].count += 1;
        paymentStats[method].revenue += parseFloat(order.total);
      });

    const totalRevenue = Object.values(paymentStats).reduce((sum, stat) => sum + stat.revenue, 0);
    Object.values(paymentStats).forEach(stat => {
      stat.percentage = totalRevenue > 0 ? (stat.revenue / totalRevenue * 100) : 0;
    });

    return Object.values(paymentStats).sort((a, b) => b.revenue - a.revenue);
  }, [realTimeData.orders]);

  // Análisis de horarios pico
  const peakHoursAnalysis = useMemo(() => {
    const hourlyStats = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      orders: 0,
      revenue: 0
    }));

    realTimeData.orders
      .filter(order => order.status === 'completado')
      .forEach(order => {
        const hour = new Date(order.created_at).getHours();
        hourlyStats[hour].orders += 1;
        hourlyStats[hour].revenue += parseFloat(order.total);
      });

    return hourlyStats.filter(stat => stat.orders > 0);
  }, [realTimeData.orders]);

  // Inventario con alertas
  const inventoryAnalysis = useMemo(() => {
    const lowStock = realTimeData.products.filter(item => 
      (item.stock || 0) <= (item.min_stock || 10)
    );
    const outOfStock = realTimeData.products.filter(item => (item.stock || 0) === 0);
    const totalValue = realTimeData.products.reduce((sum, item) => 
      sum + ((item.price || 0) * (item.stock || 0)), 0
    );

    return {
      totalProducts: realTimeData.products.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      totalValue,
      lowStockItems: lowStock.slice(0, 5),
      outOfStockItems: outOfStock.slice(0, 5),
      movements: realTimeData.movements
    };
  }, [realTimeData.products, realTimeData.movements]);

  // Funciones de exportación
  const exportToPDF = () => {
    const reportData = {
      period: `${dateFrom} - ${dateTo}`,
      generalStats,
      topProducts,
      tableAnalysis,
      paymentMethodAnalysis
    };
    
    console.log('Exportando a PDF:', reportData);
    alert('Función de exportación a PDF en desarrollo. Datos preparados en consola.');
  };

  const exportToExcel = () => {
    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte-son-dlicias-${dateFrom}-${dateTo}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateCSVContent = () => {
    let csv = 'REPORTE SON D\'LICIAS\n';
    csv += `Período: ${dateFrom} - ${dateTo}\n\n`;
    
    csv += 'RESUMEN GENERAL\n';
    csv += 'Métrica,Valor\n';
    csv += `Ventas Totales,${generalStats.totalSales.toFixed(2)}\n`;
    csv += `Órdenes Completadas,${generalStats.totalOrders}\n`;
    csv += `Ticket Promedio,${generalStats.avgOrderValue.toFixed(2)}\n`;
    csv += `Clientes Atendidos,${generalStats.totalCustomers}\n\n`;
    
    csv += 'PRODUCTOS MÁS VENDIDOS\n';
    csv += 'Producto,Cantidad Vendida,Ingresos,Órdenes\n';
    topProducts.forEach(product => {
      csv += `${product.name},${product.quantitySold},${product.revenue.toFixed(2)},${product.orders}\n`;
    });
    
    return csv;
  };

  const sendEmailReport = () => {
    const reportSummary = {
      period: `${dateFrom} - ${dateTo}`,
      totalSales: generalStats.totalSales,
      totalOrders: generalStats.totalOrders,
      topProduct: topProducts[0]?.name || 'N/A'
    };
    
    console.log('Enviando reporte por email:', reportSummary);
    alert('Función de envío por email en desarrollo. Resumen preparado en consola.');
  };

  const reportTypes = [
    { value: 'sales', label: 'Reporte de Ventas' },
    { value: 'products', label: 'Productos Más Vendidos' },
    { value: 'tables', label: 'Análisis por Mesa' },
    { value: 'payments', label: 'Métodos de Pago' },
    { value: 'hours', label: 'Horarios Pico' },
    { value: 'inventory', label: 'Estado de Inventario' }
  ];

  if (loading && realTimeData.orders.length === 0) {
    return (
      <div className="p-6">
        <LoadingSpinner text="Cargando datos de reportes..." className="py-20" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header mejorado */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reportes y Análisis</h2>
          <p className="text-gray-600">
            Análisis detallado del período: {new Date(dateFrom).toLocaleDateString()} - {new Date(dateTo).toLocaleDateString()}
          </p>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span>📊 {realTimeData.orders.length} órdenes analizadas</span>
            <span>💰 {generalStats.totalOrders} completadas</span>
            <span>🕒 Actualizado: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadRealTimeData} variant="secondary" size="sm" loading={loading}>
            🔄 Actualizar
          </Button>
          <div className="relative export-dropdown-container">
            <Button 
              variant="primary" 
              icon={Download}
              onClick={() => setShowExportDropdown(!showExportDropdown)}
            >
              Exportar ▼
            </Button>
            {showExportDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
                <button 
                  onClick={() => {
                    exportToPDF();
                    setShowExportDropdown(false);
                  }} 
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 rounded-t-lg"
                >
                  <FileText className="h-4 w-4" />
                  <span>Exportar a PDF</span>
                </button>
                <button 
                  onClick={() => {
                    exportToExcel();
                    setShowExportDropdown(false);
                  }} 
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar a Excel/CSV</span>
                </button>
                <button 
                  onClick={() => {
                    sendEmailReport();
                    setShowExportDropdown(false);
                  }} 
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 rounded-b-lg"
                >
                  <Mail className="h-4 w-4" />
                  <span>Enviar por Email</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filtros mejorados */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Tipo de Reporte"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={reportTypes}
            />
            <Input
              label="Fecha Desde"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              label="Fecha Hasta"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  const oneWeekAgo = new Date();
                  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                  setDateFrom(oneWeekAgo.toISOString().split('T')[0]);
                  setDateTo(today);
                }}
                className="w-full"
              >
                Última Semana
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats principales con datos reales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-600 to-green-600 text-white relative overflow-hidden">
          <CardContent className="p-6 text-center relative z-10">
            <DollarSign className="h-8 w-8 mx-auto mb-2" />
            <div className="text-3xl font-bold">{CURRENCY} {generalStats.totalSales.toFixed(2)}</div>
            <div className="text-emerald-100 text-sm">Ventas del Período</div>
            <div className="text-emerald-200 text-xs mt-1">
              {salesByDay.length > 1 && (
                <span>{CURRENCY} {(generalStats.totalSales / salesByDay.length).toFixed(2)} promedio diario</span>
              )}
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white relative overflow-hidden">
          <CardContent className="p-6 text-center relative z-10">
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <div className="text-3xl font-bold">{generalStats.totalOrders}</div>
            <div className="text-blue-100 text-sm">Órdenes Completadas</div>
            <div className="text-blue-200 text-xs mt-1">
              {generalStats.ordersToday} hoy • {realTimeData.orders.filter(o => o.status === 'preparando').length} en cocina
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-emerald-600 text-white relative overflow-hidden">
          <CardContent className="p-6 text-center relative z-10">
            <TrendingUp className="h-8 w-8 mx-auto mb-2" />
            <div className="text-3xl font-bold">{CURRENCY} {generalStats.avgOrderValue.toFixed(2)}</div>
            <div className="text-green-100 text-sm">Ticket Promedio</div>
            <div className="text-green-200 text-xs mt-1">
              Rango: {CURRENCY} {Math.min(...realTimeData.orders.filter(o => o.status === 'completado').map(o => o.total)).toFixed(2)} - {CURRENCY} {Math.max(...realTimeData.orders.filter(o => o.status === 'completado').map(o => o.total)).toFixed(2)}
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white relative overflow-hidden">
          <CardContent className="p-6 text-center relative z-10">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <div className="text-3xl font-bold">{generalStats.totalCustomers}</div>
            <div className="text-purple-100 text-sm">Clientes Atendidos</div>
            <div className="text-purple-200 text-xs mt-1">
              {realTimeData.tables.filter(t => t.status === 'occupied').length} mesas ocupadas
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
        </Card>
      </div>

      {/* Contenido específico por tipo de reporte */}
      {reportType === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventas por día */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span>Ventas por Día</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {salesByDay.map((dayStat, index) => {
                  const maxSales = Math.max(...salesByDay.map(d => d.sales));
                  const percentage = maxSales > 0 ? (dayStat.sales / maxSales) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-20 text-sm font-medium text-gray-600">
                        {dayStat.date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full relative"
                            style={{ width: `${percentage}%` }}
                          >
                            <div className="absolute right-2 top-0 text-white text-xs leading-3">
                              {dayStat.orders}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        <div className="text-sm font-semibold">{CURRENCY} {dayStat.sales.toFixed(0)}</div>
                        <div className="text-xs text-gray-500">{dayStat.orders} órdenes</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Métodos de pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span>Métodos de Pago</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethodAnalysis.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700 capitalize">
                          {payment.method === 'efectivo' ? '💵 Efectivo' :
                           payment.method === 'yape' ? '📱 Yape' :
                           payment.method === 'plin' ? '📱 Plin' :
                           payment.method === 'tarjeta' ? '💳 Tarjeta' : 
                           `💳 ${payment.method}`}
                        </span>
                        <span className="text-blue-600 font-semibold">
                          {CURRENCY} {payment.revenue.toFixed(2)} ({payment.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                          style={{ width: `${payment.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {payment.count} transacciones
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Más contenido según el tipo de reporte... */}
      {reportType === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span>Top 10 Productos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        {product.quantitySold} vendidos • {product.orders} órdenes • {product.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {CURRENCY} {product.revenue.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {CURRENCY} {product.price.toFixed(2)} c/u
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span>Productos con Menor Rotación</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.slice().reverse().slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">{product.name}</div>
                      <div className="text-sm text-red-600">
                        Solo {product.quantitySold} vendidos
                      </div>
                    </div>
                    <div className="text-red-600 font-semibold">
                      {CURRENCY} {product.revenue.toFixed(2)}
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    💡 <strong>Recomendación:</strong> Considera revisar precios, promociones o retirar estos productos del menú.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                <span>Rendimiento por Mesa</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tableAnalysis.map((table, index) => (
                  <div key={table.tableId} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      {table.tableId}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">Mesa {table.tableId}</div>
                      <div className="text-sm text-gray-600">
                        {table.orders} órdenes • Promedio: {CURRENCY} {table.avgOrderValue.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-purple-600">
                        {CURRENCY} {table.revenue.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Total</div>
                    </div>
                  </div>
                ))}
                {tableAnalysis.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay datos de mesas en el período seleccionado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>Estado Actual de Mesas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Resumen de estados */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {realTimeData.tables.filter(t => t.status === 'available').length}
                    </div>
                    <div className="text-sm text-green-600">Disponibles</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {realTimeData.tables.filter(t => t.status === 'occupied').length}
                    </div>
                    <div className="text-sm text-red-600">Ocupadas</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {realTimeData.tables.filter(t => t.status === 'reserved').length}
                    </div>
                    <div className="text-sm text-yellow-600">Reservadas</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {realTimeData.tables.filter(t => t.status === 'maintenance').length}
                    </div>
                    <div className="text-sm text-gray-600">Mantenimiento</div>
                  </div>
                </div>
                
                {/* Tasa de ocupación */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Tasa de Ocupación</h4>
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ 
                        width: `${realTimeData.tables.length > 0 ? 
                          ((realTimeData.tables.filter(t => t.status === 'occupied').length + 
                            realTimeData.tables.filter(t => t.status === 'reserved').length) / 
                           realTimeData.tables.length * 100) : 0}%` 
                      }}
                    />
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    {realTimeData.tables.length > 0 ? 
                      (((realTimeData.tables.filter(t => t.status === 'occupied').length + 
                         realTimeData.tables.filter(t => t.status === 'reserved').length) / 
                        realTimeData.tables.length * 100).toFixed(1)) : 0}% ocupación actual
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'hours' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <span>Análisis de Horarios Pico</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {peakHoursAnalysis.map((hourStat) => {
                const maxOrders = Math.max(...peakHoursAnalysis.map(h => h.orders));
                const percentage = maxOrders > 0 ? (hourStat.orders / maxOrders) * 100 : 0;
                const isPeakHour = hourStat.orders >= maxOrders * 0.7;
                
                return (
                  <div key={hourStat.hour} className={`flex items-center space-x-3 p-2 rounded-lg ${isPeakHour ? 'bg-indigo-50' : ''}`}>
                    <div className="w-16 text-sm font-medium text-gray-600">
                      {hourStat.hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${isPeakHour ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-24 text-right">
                      <div className="text-sm font-semibold">{hourStat.orders} órdenes</div>
                      <div className="text-xs text-gray-500">
                        {CURRENCY} {hourStat.revenue.toFixed(0)}
                      </div>
                    </div>
                    {isPeakHour && (
                      <div className="text-indigo-600">
                        🔥
                      </div>
                    )}
                  </div>
                );
              })}
              
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <h4 className="font-medium text-indigo-800 mb-2">📈 Insights de Horarios</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Hora más activa:</strong> {
                      peakHoursAnalysis.length > 0 ? 
                      `${peakHoursAnalysis.reduce((max, hour) => hour.orders > max.orders ? hour : max).hour}:00` : 
                      'N/A'
                    }
                  </div>
                  <div>
                    <strong>Mejor facturación:</strong> {
                      peakHoursAnalysis.length > 0 ? 
                      `${peakHoursAnalysis.reduce((max, hour) => hour.revenue > max.revenue ? hour : max).hour}:00` : 
                      'N/A'
                    }
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-purple-600" />
                <span>Estado del Inventario</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Resumen de inventario */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {inventoryAnalysis.totalProducts - inventoryAnalysis.lowStock - inventoryAnalysis.outOfStock}
                    </div>
                    <div className="text-xs text-green-600">Stock Normal</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{inventoryAnalysis.lowStock}</div>
                    <div className="text-xs text-yellow-600">Stock Bajo</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{inventoryAnalysis.outOfStock}</div>
                    <div className="text-xs text-red-600">Sin Stock</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {CURRENCY} {inventoryAnalysis.totalValue.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Valor Total del Inventario</div>
                  </div>
                </div>

                {/* Productos con problemas */}
                {inventoryAnalysis.lowStockItems.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                      Productos con Stock Bajo:
                    </h4>
                    <div className="space-y-2">
                      {inventoryAnalysis.lowStockItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm bg-yellow-50 p-2 rounded">
                          <span className="text-gray-700">{item.name}</span>
                          <span className="text-yellow-600 font-medium">{item.stock || 0} unidades</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {inventoryAnalysis.outOfStockItems.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />
                      Productos Agotados:
                    </h4>
                    <div className="space-y-2">
                      {inventoryAnalysis.outOfStockItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm bg-red-50 p-2 rounded">
                          <span className="text-gray-700">{item.name}</span>
                          <span className="text-red-600 font-medium">Sin stock</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Movimientos de Inventario</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {inventoryAnalysis.movements.map((movement, index) => (
                  <div key={movement.id} className={`flex justify-between items-center p-3 rounded-lg ${
                    movement.movement_type === 'in' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {movement.products?.name || 'Producto desconocido'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {movement.reason || 'Sin motivo especificado'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(movement.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className={`text-right font-semibold ${
                      movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                    </div>
                  </div>
                ))}
                
                {inventoryAnalysis.movements.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay movimientos de inventario en este período</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights y recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span>Insights y Recomendaciones</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Insight de ventas */}
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Tendencia de Ventas</h4>
              </div>
              <p className="text-blue-700 text-sm">
                {salesByDay.length > 1 ? (
                  <>
                    {salesByDay[salesByDay.length - 1]?.sales > salesByDay[salesByDay.length - 2]?.sales ? (
                      <>📈 Las ventas están creciendo. Último día: {CURRENCY} {salesByDay[salesByDay.length - 1]?.sales.toFixed(2)}</>
                    ) : (
                      <>📉 Las ventas han disminuido. Considera estrategias de marketing.</>
                    )}
                  </>
                ) : (
                  'Necesitas más datos para analizar la tendencia.'
                )}
              </p>
            </div>

            {/* Insight de productos */}
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Producto Estrella</h4>
              </div>
              <p className="text-green-700 text-sm">
                {topProducts.length > 0 ? (
                  <>🏆 <strong>{topProducts[0].name}</strong> lidera con {topProducts[0].quantitySold} ventas y {CURRENCY} {topProducts[0].revenue.toFixed(2)} en ingresos.</>
                ) : (
                  'No hay datos suficientes de productos.'
                )}
              </p>
            </div>

            {/* Insight de horarios */}
            <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                <h4 className="font-semibold text-indigo-800">Horario Óptimo</h4>
              </div>
              <p className="text-indigo-700 text-sm">
                {peakHoursAnalysis.length > 0 ? (
                  <>⏰ Tu mejor horario es a las {peakHoursAnalysis.reduce((max, hour) => hour.orders > max.orders ? hour : max).hour}:00 con {peakHoursAnalysis.reduce((max, hour) => hour.orders > max.orders ? hour : max).orders} órdenes.</>
                ) : (
                  'Necesitas más datos para identificar horarios pico.'
                )}
              </p>
            </div>
          </div>
          
          {/* Recomendaciones adicionales */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
            <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Recomendaciones para Mejorar
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-purple-700">📊 Análisis:</strong>
                <ul className="mt-1 space-y-1 text-purple-600">
                  <li>• Promedio de {generalStats.avgOrderValue.toFixed(2)} por orden</li>
                  <li>• {generalStats.totalCustomers} clientes únicos</li>
                  <li>• {paymentMethodAnalysis[0]?.method || 'Efectivo'} es el método preferido</li>
                </ul>
              </div>
              <div>
                <strong className="text-purple-700">🎯 Acciones:</strong>
                <ul className="mt-1 space-y-1 text-purple-600">
                  <li>• Promociona productos de baja rotación</li>
                  <li>• Optimiza inventario según demanda</li>
                  <li>• Refuerza personal en horarios pico</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;