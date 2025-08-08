// Header actualizado con sistema de notificaciones MTB y exportación

import React, { useState } from 'react';
import { 
  Users, Settings, LogOut, Shield, User, ChevronDown, 
  Download, BarChart3, Activity, Zap, RefreshCw, Package
} from 'lucide-react';
import Button from '../ui/Button';
import { USER_ROLE_LABELS } from '../../utils/authConstants';
import { NotificationBadge, NotificationPanel, NotificationToast } from '../common/NotificationSystem';
import { ExportButton } from '../common/ExportSystem';
import ExportService from '../common/ExportSystem';

const Header = ({ 
  currentUser, 
  onLogout, 
  onOpenUserManagement, 
  orders = [], 
  inventory = [], 
  tables = [],
  onRefreshData 
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      onLogout();
    }
  };

  const handleRefreshData = async () => {
    if (onRefreshData) {
      setIsRefreshing(true);
      try {
        await onRefreshData();
        // Mostrar notificación de éxito si está disponible
        if (window.showNotification) {
          window.showNotification('Datos actualizados correctamente', 'success');
        }
      } catch (error) {
        console.error('Error refreshing data:', error);
        if (window.showNotification) {
          window.showNotification('Error al actualizar datos', 'error');
        }
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'cajero':
        return 'bg-blue-100 text-blue-800';
      case 'cocina':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Datos para exportación rápida del estado actual
  const getQuickExportData = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    return {
      summary: {
        fechaReporte: now.toLocaleString(),
        totalOrdenes: orders.length,
        ordenesCompletadas: orders.filter(o => o.status === 'completado').length,
        ordenesEnPreparacion: orders.filter(o => o.status === 'preparando').length,
        ordenesListas: orders.filter(o => o.status === 'listo').length,
        totalMesas: tables.length,
        mesasOcupadas: tables.filter(t => t.status === 'occupied').length,
        mesasDisponibles: tables.filter(t => t.status === 'available').length,
        productosInventario: inventory.length,
        productosStockBajo: inventory.filter(item => (item.stock || 0) <= (item.minStock || 10)).length,
        productosAgotados: inventory.filter(item => (item.stock || 0) === 0).length
      },
      main: orders.map(order => ({
        id: order.id,
        mesa: order.table_id ? `Mesa ${order.table_id}` : 'Sin mesa',
        cliente: order.customer_name || 'Cliente general',
        total: parseFloat(order.total || 0),
        estado: order.status,
        metodoPago: order.payment_method || 'Pendiente',
        fechaCreacion: new Date(order.created_at || order.createdAt).toLocaleString(),
        items: (order.items || []).length
      })),
      analysis: {
        estadoMesas: tables.map(table => ({
          numero: table.table_number,
          capacidad: table.capacity,
          ubicacion: table.location,
          estado: table.status
        })),
        inventarioCritico: inventory.filter(item => (item.stock || 0) <= (item.minStock || 10)).map(item => ({
          producto: item.name,
          stockActual: item.stock || 0,
          stockMinimo: item.minStock || item.min_stock || 10,
          categoria: item.category || 'Sin categoría'
        }))
      }
    };
  };

  // Estadísticas rápidas para mostrar en el header
  const quickStats = {
    ordersToday: orders.filter(order => {
      const orderDate = new Date(order.created_at || order.createdAt);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    }).length,
    tablesOccupied: tables.filter(t => t.status === 'occupied').length,
    totalTables: tables.length,
    lowStockItems: inventory.filter(item => (item.stock || 0) <= (item.minStock || 10)).length,
    activeOrders: orders.filter(o => o.status === 'preparando' || o.status === 'listo').length
  };

  return (
    <>
      <header className="bg-gradient-to-r from-slate-800 via-gray-800 to-slate-700 text-white shadow-xl relative">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo y título */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Son D'licias
                </h1>
                <p className="text-gray-300 text-sm">Sistema de Gestión</p>
              </div>
            </div>

            {/* Stats rápidas */}
            <div className="hidden lg:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-200">{quickStats.ordersToday}</div>
                <div className="text-gray-300 text-xs">Órdenes Hoy</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-200">
                  {quickStats.tablesOccupied}/{quickStats.totalTables}
                </div>
                <div className="text-gray-300 text-xs">Mesas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-200">{quickStats.activeOrders}</div>
                <div className="text-gray-300 text-xs">En Cocina</div>
              </div>
              {quickStats.lowStockItems > 0 && (
                <div className="text-center">
                  <div className="text-lg font-bold text-red-200">{quickStats.lowStockItems}</div>
                  <div className="text-red-200 text-xs">Stock Bajo</div>
                </div>
              )}
            </div>

            {/* Información del usuario y acciones */}
            <div className="flex items-center space-x-4">
              {/* Slogan */}
              <span className="text-gray-300 font-medium bg-slate-700/50 px-3 py-1 rounded-full hidden xl:block">
                Más que un antojo
              </span>

              {/* Botón de actualización */}
              <button
                onClick={handleRefreshData}
                className="relative p-2 rounded-full hover:bg-slate-600/30 transition-colors"
                title="Actualizar datos"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Acciones rápidas */}
              <div className="relative">
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="p-2 rounded-full hover:bg-slate-600/30 transition-colors"
                  title="Acciones rápidas"
                >
                  <Zap className="h-5 w-5" />
                </button>

                {showQuickActions && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border z-50 py-2">
                    <div className="px-4 py-2 border-b">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-orange-600" />
                        Acciones Rápidas
                      </h3>
                    </div>
                    
                    {/* Exportación rápida */}
                    <div className="px-4 py-2">
                      <ExportButton
                        data={getQuickExportData()}
                        options={{
                          filename: `estado-actual-son-dlicias`,
                          reportType: 'Estado Actual del Sistema',
                          dateRange: {
                            from: new Date().toISOString().split('T')[0],
                            to: new Date().toISOString().split('T')[0]
                          }
                        }}
                        variant="secondary"
                        size="sm"
                        className="w-full text-left justify-start"
                      />
                    </div>

                    {/* Reporte rápido de inventario */}
                    {currentUser?.permissions?.canManageInventory && (
                      <button
                        onClick={() => {
                          const inventoryData = {
                            summary: {
                              totalProductos: inventory.length,
                              stockBajo: inventory.filter(item => (item.stock || 0) <= (item.minStock || 10)).length,
                              agotados: inventory.filter(item => (item.stock || 0) === 0).length
                            },
                            main: inventory.map(item => ({
                              nombre: item.name,
                              categoria: item.category || 'Sin categoría',
                              stock: item.stock || 0,
                              minimo: item.minStock || item.min_stock || 10,
                              estado: (item.stock || 0) === 0 ? 'Agotado' : 
                                     (item.stock || 0) <= (item.minStock || 10) ? 'Stock Bajo' : 'Normal'
                            }))
                          };
                          
                          // Crear un ExportService temporal para descarga directa
                          const exportService = new ExportService();
                          exportService.exportToCSV(inventoryData, {
                            filename: 'inventario-son-dlicias',
                            reportType: 'Estado de Inventario'
                          });
                          
                          setShowQuickActions(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Package className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-700">Exportar Inventario</span>
                      </button>
                    )}

                    {/* Resumen de ventas del día */}
                    {currentUser?.permissions?.canViewReports && (
                      <button
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          const todayOrders = orders.filter(order => {
                            const orderDate = new Date(order.created_at || order.createdAt);
                            return orderDate.toDateString() === new Date().toDateString() &&
                                   order.status === 'completado';
                          });
                          
                          const salesData = {
                            summary: {
                              fecha: new Date().toLocaleDateString(),
                              ordenesCompletadas: todayOrders.length,
                              ventasTotal: todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0),
                              promedioOrden: todayOrders.length > 0 ? 
                                todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0) / todayOrders.length : 0
                            },
                            main: todayOrders.map(order => ({
                              orden: order.id,
                              hora: new Date(order.created_at || order.createdAt).toLocaleTimeString(),
                              cliente: order.customer_name || 'Cliente general',
                              mesa: order.table_id ? `Mesa ${order.table_id}` : 'Sin mesa',
                              total: parseFloat(order.total),
                              metodoPago: order.payment_method || 'Pendiente'
                            }))
                          };
                          
                          const exportService = new ExportService();
                          exportService.exportToCSV(salesData, {
                            filename: `ventas-${today}`,
                            reportType: 'Ventas del Día'
                          });
                          
                          setShowQuickActions(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <BarChart3 className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">Ventas del Día</span>
                      </button>
                    )}

                    <div className="border-t mt-2 pt-2 px-4">
                      <p className="text-xs text-gray-500">
                        💡 Exportaciones rápidas del estado actual
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notificaciones MTB */}
              <NotificationBadge onClick={() => setShowNotifications(true)} />

              {/* Gestión de usuarios (solo admin) */}
              {currentUser?.permissions?.canManageUsers && (
                <button 
                  onClick={onOpenUserManagement}
                  className="p-2 rounded-full hover:bg-slate-600/30 transition-colors"
                  title="Gestionar usuarios"
                >
                  <Settings className="h-5 w-5" />
                </button>
              )}

              {/* Menú de usuario */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-600/30 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="h-5 w-5" />
                  </div>
                  
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{currentUser?.name}</p>
                    <p className="text-xs text-amber-200">@{currentUser?.username}</p>
                  </div>
                  
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Dropdown menu mejorado */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                    <div className="p-4 border-b bg-gradient-to-r from-slate-50 to-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {currentUser?.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{currentUser?.name}</p>
                          <p className="text-sm text-gray-600">@{currentUser?.username}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(currentUser?.role)}`}>
                            <Shield className="h-3 w-3 mr-1" />
                            {USER_ROLE_LABELS[currentUser?.role]}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Estadísticas personales */}
                    <div className="p-4 border-b">
                      <h4 className="font-medium text-gray-700 mb-3">📊 Tu Actividad Hoy</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-blue-50 p-2 rounded text-center">
                          <div className="font-bold text-blue-600">
                            {orders.filter(o => o.created_by === currentUser?.id && 
                              new Date(o.created_at || o.createdAt).toDateString() === new Date().toDateString()).length}
                          </div>
                          <div className="text-blue-600 text-xs">Órdenes creadas</div>
                        </div>
                        <div className="bg-green-50 p-2 rounded text-center">
                          <div className="font-bold text-green-600">
                            {new Date().toLocaleTimeString()}
                          </div>
                          <div className="text-green-600 text-xs">Hora actual</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Permisos */}
                    <div className="p-4 border-b">
                      <h4 className="font-medium text-gray-700 mb-2">🔐 Permisos Activos:</h4>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className={currentUser?.permissions?.canManageUsers ? 'text-green-600' : 'text-gray-400'}>
                          {currentUser?.permissions?.canManageUsers ? '✓' : '✗'} Gestionar usuarios
                        </div>
                        <div className={currentUser?.permissions?.canViewReports ? 'text-green-600' : 'text-gray-400'}>
                          {currentUser?.permissions?.canViewReports ? '✓' : '✗'} Ver reportes
                        </div>
                        <div className={currentUser?.permissions?.canManageInventory ? 'text-green-600' : 'text-gray-400'}>
                          {currentUser?.permissions?.canManageInventory ? '✓' : '✗'} Inventario
                        </div>
                        <div className={currentUser?.permissions?.canProcessOrders ? 'text-green-600' : 'text-gray-400'}>
                          {currentUser?.permissions?.canProcessOrders ? '✓' : '✗'} Procesar órdenes
                        </div>
                      </div>
                    </div>

                    {/* Exportación personal */}
                    <div className="p-3 border-b">
                      <h4 className="font-medium text-gray-700 mb-2 text-sm">📋 Mis Datos</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const userData = {
                              summary: {
                                usuario: currentUser?.name,
                                rol: USER_ROLE_LABELS[currentUser?.role],
                                email: currentUser?.email,
                                ultimoAcceso: currentUser?.lastLogin || 'No disponible'
                              },
                              main: orders.filter(o => o.created_by === currentUser?.id).map(order => ({
                                orden: order.id,
                                fecha: new Date(order.created_at || order.createdAt).toLocaleString(),
                                total: parseFloat(order.total),
                                estado: order.status
                              }))
                            };
                            
                            const exportService = new ExportService();
                            exportService.exportToCSV(userData, {
                              filename: `mis-ordenes-${currentUser?.username}`,
                              reportType: 'Mis Órdenes'
                            });
                            setShowUserMenu(false);
                          }}
                          className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                        >
                          💾 Exportar mis órdenes
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de estado del sistema */}
        <div className="bg-black bg-opacity-30 px-6 py-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                🟢 Sistema operativo • Última actualización: {new Date().toLocaleTimeString()}
              </span>
              {quickStats.activeOrders > 0 && (
                <span className="text-blue-300 animate-pulse">
                  ⚡ {quickStats.activeOrders} órdenes en cocina
                </span>
              )}
              {quickStats.lowStockItems > 0 && (
                <span className="text-red-300 animate-pulse">
                  ⚠️ {quickStats.lowStockItems} productos con stock bajo
                </span>
              )}
            </div>
            <div className="text-gray-300">
              Usuario: {currentUser?.name} • {USER_ROLE_LABELS[currentUser?.role]}
            </div>
          </div>
        </div>
      </header>

      {/* Overlay para cerrar menús */}
      {(showUserMenu || showQuickActions || showNotifications) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowUserMenu(false);
            setShowQuickActions(false);
            setShowNotifications(false);
          }}
        />
      )}

      {/* Panel de notificaciones */}
      <NotificationPanel 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Toast de notificaciones flotantes */}
      <NotificationToast />
    </>
  );
};

export default Header;