// Sistema de notificaciones mejorado para Son D'licias
// MTB: Mesa (ocupación), Tiempo (preparación), Balance (inventario y ventas)

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Bell, X, Clock, MapPin, Package, AlertTriangle, CheckCircle, TrendingUp, Users, Zap } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { CURRENCY } from '../../utils/constants';

// Contexto para notificaciones
const NotificationContext = createContext();

// Provider de notificaciones
export const NotificationProvider = ({ children, orders = [], inventory = [], tables = [] }) => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    enabled: true,
    soundEnabled: true,
    showBadge: true,
    autoHide: 5000, // 5 segundos
    categories: {
      mesa: true,      // Mesa - ocupación, liberación, reservas
      tiempo: true,    // Tiempo - órdenes tardías, preparación
      balance: true    // Balance - inventario bajo, ventas altas
    }
  });

  // Tipos de notificaciones
  const NOTIFICATION_TYPES = {
    // Mesa (M)
    MESA_OCUPADA: 'mesa_ocupada',
    MESA_LIBERADA: 'mesa_liberada',
    MESA_MANTENIMIENTO: 'mesa_mantenimiento',
    OCUPACION_ALTA: 'ocupacion_alta',
    
    // Tiempo (T)
    ORDEN_TARDIA: 'orden_tardia',
    ORDEN_LISTA: 'orden_lista',
    TIEMPO_PREPARACION_ALTO: 'tiempo_preparacion_alto',
    HORARIO_PICO: 'horario_pico',
    
    // Balance (B)
    STOCK_BAJO: 'stock_bajo',
    STOCK_AGOTADO: 'stock_agotado',
    VENTA_ALTA: 'venta_alta',
    META_DIARIA: 'meta_diaria',
    PRODUCTO_POPULAR: 'producto_popular'
  };

  // Generar ID único para notificaciones
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  // Crear notificación
  const createNotification = useCallback((type, data) => {
    const id = generateId();
    const timestamp = new Date();
    
    const notification = {
      id,
      type,
      timestamp,
      data,
      read: false,
      ...getNotificationConfig(type, data)
    };

    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Mantener máximo 50

    // Auto-hide si está configurado
    if (settings.autoHide > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, settings.autoHide);
    }

    // Reproducir sonido si está habilitado
    if (settings.soundEnabled && notification.priority === 'high') {
      playNotificationSound(type);
    }

    return id;
  }, [settings.autoHide, settings.soundEnabled]);

  // Configuración de notificaciones por tipo
  const getNotificationConfig = (type, data) => {
    const configs = {
      // MESA
      [NOTIFICATION_TYPES.MESA_OCUPADA]: {
        title: `Mesa ${data.tableNumber} Ocupada`,
        message: `Cliente: ${data.customerName || 'Sin nombre'}`,
        icon: MapPin,
        color: 'bg-blue-500',
        priority: 'medium',
        category: 'mesa'
      },
      [NOTIFICATION_TYPES.MESA_LIBERADA]: {
        title: `Mesa ${data.tableNumber} Disponible`,
        message: `Mesa liberada y lista para nuevos clientes`,
        icon: CheckCircle,
        color: 'bg-green-500',
        priority: 'low',
        category: 'mesa'
      },
      [NOTIFICATION_TYPES.OCUPACION_ALTA]: {
        title: 'Ocupación Alta',
        message: `${data.percentage}% de mesas ocupadas (${data.occupied}/${data.total})`,
        icon: Users,
        color: 'bg-orange-500',
        priority: 'high',
        category: 'mesa'
      },
      
      // TIEMPO
      [NOTIFICATION_TYPES.ORDEN_TARDIA]: {
        title: `Orden #${data.orderId} Tardía`,
        message: `${data.minutesElapsed} minutos desde creación`,
        icon: Clock,
        color: 'bg-red-500',
        priority: 'high',
        category: 'tiempo'
      },
      [NOTIFICATION_TYPES.ORDEN_LISTA]: {
        title: `Orden #${data.orderId} Lista`,
        message: `Mesa ${data.tableNumber || 'Sin mesa'} - ${data.customerName || 'Cliente'}`,
        icon: CheckCircle,
        color: 'bg-green-500',
        priority: 'high',
        category: 'tiempo'
      },
      [NOTIFICATION_TYPES.HORARIO_PICO]: {
        title: 'Horario Pico Detectado',
        message: `${data.ordersCount} órdenes en la última hora`,
        icon: TrendingUp,
        color: 'bg-purple-500',
        priority: 'medium',
        category: 'tiempo'
      },
      
      // BALANCE
      [NOTIFICATION_TYPES.STOCK_BAJO]: {
        title: `Stock Bajo: ${data.productName}`,
        message: `Quedan ${data.currentStock} unidades (mín: ${data.minStock})`,
        icon: Package,
        color: 'bg-yellow-500',
        priority: 'medium',
        category: 'balance'
      },
      [NOTIFICATION_TYPES.STOCK_AGOTADO]: {
        title: `Sin Stock: ${data.productName}`,
        message: 'Producto agotado - Reabastecer urgente',
        icon: AlertTriangle,
        color: 'bg-red-500',
        priority: 'high',
        category: 'balance'
      },
      [NOTIFICATION_TYPES.VENTA_ALTA]: {
        title: '🎉 Gran Venta',
        message: `Orden de ${CURRENCY} ${data.amount} - Mesa ${data.tableNumber}`,
        icon: TrendingUp,
        color: 'bg-green-500',
        priority: 'medium',
        category: 'balance'
      },
      [NOTIFICATION_TYPES.META_DIARIA]: {
        title: '🏆 Meta Diaria Alcanzada',
        message: `${CURRENCY} ${data.amount} en ventas hoy`,
        icon: CheckCircle,
        color: 'bg-green-500',
        priority: 'high',
        category: 'balance'
      }
    };

    return configs[type] || {
      title: 'Notificación',
      message: 'Nueva actividad',
      icon: Bell,
      color: 'bg-gray-500',
      priority: 'low',
      category: 'general'
    };
  };

  // Reproducir sonido de notificación
  const playNotificationSound = (type) => {
    try {
      // Crear un sonido simple usando Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Diferentes tonos según el tipo
      const frequencies = {
        [NOTIFICATION_TYPES.ORDEN_TARDIA]: 800,
        [NOTIFICATION_TYPES.STOCK_AGOTADO]: 600,
        [NOTIFICATION_TYPES.ORDEN_LISTA]: 400,
        default: 500
      };

      oscillator.frequency.setValueAtTime(
        frequencies[type] || frequencies.default,
        audioContext.currentTime
      );
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio no disponible:', error);
    }
  };

  // Monitoreo automático
  useEffect(() => {
    if (!settings.enabled) return;

    const checkConditions = () => {
      const now = new Date(); // Declarar now al inicio de checkConditions
      
      // MESA: Verificar ocupación alta
      if (settings.categories.mesa && tables.length > 0) {
        const occupiedTables = tables.filter(t => t.status === 'occupied' || t.status === 'reserved');
        const occupancyRate = (occupiedTables.length / tables.length) * 100;
        
        if (occupancyRate >= 80) {
          // Solo notificar una vez por período
          const recent = notifications.find(n => 
            n.type === NOTIFICATION_TYPES.OCUPACION_ALTA && 
            Date.now() - new Date(n.timestamp).getTime() < 300000 // 5 minutos
          );
          
          if (!recent) {
            createNotification(NOTIFICATION_TYPES.OCUPACION_ALTA, {
              percentage: occupancyRate.toFixed(1),
              occupied: occupiedTables.length,
              total: tables.length
            });
          }
        }
      }

      // TIEMPO: Verificar órdenes tardías
      if (settings.categories.tiempo && orders.length > 0) {
        const lateOrders = orders.filter(order => {
          if (order.status !== 'preparando') return false;
          const orderTime = new Date(order.created_at || order.createdAt);
          const minutesElapsed = (now - orderTime) / (1000 * 60);
          return minutesElapsed > 30; // Más de 30 minutos
        });

        lateOrders.forEach(order => {
          const existing = notifications.find(n => 
            n.type === NOTIFICATION_TYPES.ORDEN_TARDIA && 
            n.data.orderId === order.id
          );
          
          if (!existing) {
            const orderTime = new Date(order.created_at || order.createdAt);
            const minutesElapsed = Math.floor((now - orderTime) / (1000 * 60));
            
            createNotification(NOTIFICATION_TYPES.ORDEN_TARDIA, {
              orderId: order.id,
              minutesElapsed,
              tableNumber: order.table_id,
              customerName: order.customer_name
            });
          }
        });

        // Verificar horario pico
        const currentHour = now.getHours();
        const recentOrders = orders.filter(order => {
          const orderTime = new Date(order.created_at || order.createdAt);
          return (now - orderTime) < 3600000; // Última hora
        });

        if (recentOrders.length >= 10) { // 10+ órdenes en la última hora
          const recent = notifications.find(n => 
            n.type === NOTIFICATION_TYPES.HORARIO_PICO && 
            Date.now() - new Date(n.timestamp).getTime() < 3600000 // 1 hora
          );
          
          if (!recent) {
            createNotification(NOTIFICATION_TYPES.HORARIO_PICO, {
              ordersCount: recentOrders.length,
              hour: currentHour
            });
          }
        }
      }

      // BALANCE: Verificar stock bajo
      if (settings.categories.balance && inventory.length > 0) {
        inventory.forEach(item => {
          const currentStock = item.stock || 0;
          const minStock = item.minStock || item.min_stock || 5;
          
          if (currentStock === 0) {
            const existing = notifications.find(n => 
              n.type === NOTIFICATION_TYPES.STOCK_AGOTADO && 
              n.data.productId === item.id
            );
            
            if (!existing) {
              createNotification(NOTIFICATION_TYPES.STOCK_AGOTADO, {
                productId: item.id,
                productName: item.name
              });
            }
          } else if (currentStock <= minStock) {
            const existing = notifications.find(n => 
              n.type === NOTIFICATION_TYPES.STOCK_BAJO && 
              n.data.productId === item.id
            );
            
            if (!existing) {
              createNotification(NOTIFICATION_TYPES.STOCK_BAJO, {
                productId: item.id,
                productName: item.name,
                currentStock,
                minStock
              });
            }
          }
        });

        // Verificar ventas altas
        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at || order.createdAt);
          return orderDate.toDateString() === now.toDateString() && 
                 order.status === 'completado';
        });

        const totalSales = todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
        const highSaleOrders = todayOrders.filter(order => parseFloat(order.total) > 50);
        
        // Meta diaria (ejemplo: 500 soles)
        if (totalSales >= 500) {
          const existing = notifications.find(n => 
            n.type === NOTIFICATION_TYPES.META_DIARIA && 
            new Date(n.timestamp).toDateString() === now.toDateString()
          );
          
          if (!existing) {
            createNotification(NOTIFICATION_TYPES.META_DIARIA, {
              amount: totalSales.toFixed(2)
            });
          }
        }

        // Notificar ventas altas recientes
        highSaleOrders.forEach(order => {
          const orderTime = new Date(order.created_at || order.createdAt);
          if ((now - orderTime) < 300000) { // Últimos 5 minutos
            const existing = notifications.find(n => 
              n.type === NOTIFICATION_TYPES.VENTA_ALTA && 
              n.data.orderId === order.id
            );
            
            if (!existing) {
              createNotification(NOTIFICATION_TYPES.VENTA_ALTA, {
                orderId: order.id,
                amount: parseFloat(order.total).toFixed(2),
                tableNumber: order.table_id,
                customerName: order.customer_name
              });
            }
          }
        });
      }
    };

    // Ejecutar cada 30 segundos
    const interval = setInterval(checkConditions, 30000);
    checkConditions(); // Ejecutar inmediatamente

    return () => clearInterval(interval);
  }, [orders, inventory, tables, settings, notifications, createNotification]);

  // Funciones de control
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const hideNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const clearCategory = (category) => {
    setNotifications(prev => prev.filter(n => n.category !== category));
  };

  // Estadísticas
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    byCategory: {
      mesa: notifications.filter(n => n.category === 'mesa').length,
      tiempo: notifications.filter(n => n.category === 'tiempo').length,
      balance: notifications.filter(n => n.category === 'balance').length
    },
    byPriority: {
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      low: notifications.filter(n => n.priority === 'low').length
    }
  };

  const contextValue = {
    notifications,
    settings,
    stats,
    createNotification,
    markAsRead,
    hideNotification,
    clearAll,
    clearCategory,
    setSettings,
    NOTIFICATION_TYPES
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook para usar notificaciones
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
};

// Componente de Badge de notificaciones para el header
export const NotificationBadge = ({ onClick }) => {
  const { stats, settings } = useNotifications();
  
  if (!settings.showBadge || stats.unread === 0) return null;

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-orange-600/30 transition-colors"
      title={`${stats.unread} notificaciones sin leer`}
    >
      <Bell className="h-5 w-5" />
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
        {stats.unread > 99 ? '99+' : stats.unread}
      </span>
    </button>
  );
};

// Panel principal de notificaciones
export const NotificationPanel = ({ isOpen, onClose }) => {
  const {
    notifications,
    settings,
    stats,
    markAsRead,
    hideNotification,
    clearAll,
    clearCategory,
    setSettings
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.category === activeTab;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-600 to-amber-600 text-white">
            <div>
              <h2 className="text-lg font-semibold">Notificaciones MTB</h2>
              <p className="text-orange-100 text-sm">
                {stats.unread} sin leer • {stats.total} total
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg hover:bg-orange-500/30 transition-colors"
              >
                ⚙️
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-orange-500/30 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 bg-gray-50 border-b">
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm">Notificaciones activas</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm">Sonido</span>
                </label>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={settings.categories.mesa}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        categories: { ...prev.categories, mesa: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Mesa</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={settings.categories.tiempo}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        categories: { ...prev.categories, tiempo: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Tiempo</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={settings.categories.balance}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        categories: { ...prev.categories, balance: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Balance</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b bg-gray-50">
            {[
              { key: 'all', label: 'Todas', count: stats.total },
              { key: 'unread', label: 'Sin leer', count: stats.unread },
              { key: 'mesa', label: 'Mesa', count: stats.byCategory.mesa },
              { key: 'tiempo', label: 'Tiempo', count: stats.byCategory.tiempo },
              { key: 'balance', label: 'Balance', count: stats.byCategory.balance }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-2 py-3 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1 bg-orange-100 text-indigo-600 px-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {filteredNotifications.length} notificaciones
              </div>
              <div className="flex space-x-2">
                {activeTab !== 'all' && activeTab !== 'unread' && (
                  <button
                    onClick={() => clearCategory(activeTab)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Limpiar {activeTab}
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  Limpiar todas
                </button>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay notificaciones</p>
                  <p className="text-sm">{activeTab === 'unread' ? 'Todas están leídas' : 'Todo tranquilo por aquí'}</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onHide={hideNotification}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente individual de notificación
const NotificationItem = ({ notification, onMarkAsRead, onHide }) => {
  const { id, title, message, icon: Icon, color, priority, read, timestamp, data } = notification;
  
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Ahora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const priorityStyles = {
    high: 'border-l-4 border-red-500 bg-red-50',
    medium: 'border-l-4 border-yellow-500 bg-yellow-50',
    low: 'border-l-4 border-gray-300 bg-gray-50'
  };

  return (
    <div 
      className={`p-4 transition-all duration-200 ${
        read ? 'bg-white' : priorityStyles[priority] || 'bg-blue-50'
      } ${!read ? 'shadow-sm' : ''}`}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${color} text-white flex-shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${read ? 'text-gray-700' : 'text-gray-900'}`}>
                {title}
              </h4>
              <p className={`text-sm mt-1 ${read ? 'text-gray-500' : 'text-gray-700'}`}>
                {message}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>{timeAgo(timestamp)}</span>
                <span className="capitalize">{priority}</span>
                {data?.tableNumber && (
                  <span>Mesa {data.tableNumber}</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1 ml-2">
              {!read && (
                <button
                  onClick={() => onMarkAsRead(id)}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                  title="Marcar como leído"
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </button>
              )}
              <button
                onClick={() => onHide(id)}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title="Ocultar"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast de notificación flotante
export const NotificationToast = () => {
  const { notifications, hideNotification } = useNotifications();
  const [visibleToasts, setVisibleToasts] = useState([]);
  
  useEffect(() => {
    const recentNotifications = notifications
      .filter(n => !n.read && n.priority === 'high')
      .slice(0, 3); // Máximo 3 toasts
    
    setVisibleToasts(recentNotifications);
  }, [notifications]);

  if (visibleToasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-40 space-y-2">
      {visibleToasts.map(notification => (
        <div
          key={notification.id}
          className="bg-white rounded-lg shadow-lg border-l-4 border-indigo-500 p-4 max-w-sm animate-slide-in-right"
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${notification.color} text-white flex-shrink-0`}>
              <notification.icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
              <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => hideNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Funciones auxiliares para crear notificaciones específicas
export const useNotificationHelpers = () => {
  const { createNotification, NOTIFICATION_TYPES } = useNotifications();

  return {
    notifyTableOccupied: (tableNumber, customerName) =>
      createNotification(NOTIFICATION_TYPES.MESA_OCUPADA, { tableNumber, customerName }),
    
    notifyTableReleased: (tableNumber) =>
      createNotification(NOTIFICATION_TYPES.MESA_LIBERADA, { tableNumber }),
    
    notifyOrderReady: (orderId, tableNumber, customerName) =>
      createNotification(NOTIFICATION_TYPES.ORDEN_LISTA, { orderId, tableNumber, customerName }),
    
    notifyLowStock: (productId, productName, currentStock, minStock) =>
      createNotification(NOTIFICATION_TYPES.STOCK_BAJO, { productId, productName, currentStock, minStock }),
    
    notifyHighSale: (orderId, amount, tableNumber, customerName) =>
      createNotification(NOTIFICATION_TYPES.VENTA_ALTA, { orderId, amount, tableNumber, customerName }),
  };
};