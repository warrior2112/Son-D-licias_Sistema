// Sidebar actualizado con gestión de mesas

import React from 'react';
import { 
  BarChart3, 
  ShoppingCart, 
  Utensils, 
  Package, 
  Coffee, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Users,
  Shield,
  Menu,
  MapPin
} from 'lucide-react';

const Sidebar = ({ activeModule, setActiveModule, isCollapsed, setIsCollapsed, currentUser }) => {
  const modules = [
    { 
      key: 'dashboard', 
      name: 'Dashboard', 
      icon: BarChart3,
      description: 'Resumen general',
      requiresPermission: null
    },
    { 
      key: 'pos', 
      name: 'Punto de Venta', 
      icon: ShoppingCart,
      description: 'Tomar órdenes',
      requiresPermission: 'canProcessOrders'
    },
    { 
      key: 'orders', 
      name: 'Órdenes', 
      icon: Utensils,
      description: 'Gestionar pedidos',
      requiresPermission: 'canProcessOrders'
    },
    { 
      key: 'tables', 
      name: 'Mesas', 
      icon: MapPin,
      description: 'Gestión de mesas',
      requiresPermission: 'canManageInventory'
    },
    { 
      key: 'inventory', 
      name: 'Inventario', 
      icon: Package,
      description: 'Control de stock',
      requiresPermission: 'canManageInventory'
    },
    { 
      key: 'production', 
      name: 'Producción', 
      icon: Coffee,
      description: 'Vista de cocina',
      requiresPermission: 'canViewProduction'
    },
    { 
      key: 'reports', 
      name: 'Reportes', 
      icon: TrendingUp,
      description: 'Análisis y ventas',
      requiresPermission: 'canViewReports'
    },
    { 
      key: 'menu', 
      name: 'Menú Digital', 
      icon: Menu,
      description: 'Gestionar carta',
      requiresPermission: 'canManageInventory'
    },
    { 
      key: 'users', 
      name: 'Usuarios', 
      icon: Users,
      description: 'Gestión de usuarios',
      requiresPermission: 'canManageUsers'
    }
  ];

  // Filtrar módulos según permisos del usuario
  const availableModules = modules.filter(module => {
    if (!module.requiresPermission) return true;
    return currentUser?.permissions?.[module.requiresPermission] || false;
  });

  return (
    <div className="flex flex-col h-full">
      <aside className={`bg-white shadow-lg transition-all duration-300 flex-1 flex flex-col ${isCollapsed ? 'w-16' : 'w-64'}`}>
        {/* Toggle button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* User info (when not collapsed) */}
        {!isCollapsed && (
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {currentUser?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {currentUser?.name}
                </p>
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3 text-indigo-600" />
                  <span className="text-xs text-indigo-600 font-medium">
                    {currentUser?.role?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation - flex-1 para ocupar el espacio disponible */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {availableModules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.key;
              
              return (
                <li key={module.key}>
                  <button
                    onClick={() => setActiveModule(module.key)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border-r-4 border-indigo-500 shadow-md'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 hover:text-slate-700'
                    }`}
                    title={isCollapsed ? module.name : ''}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-500 group-hover:text-indigo-600'}`} />
                    
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block truncate">
                          {module.name}
                        </span>
                        <span className="text-xs text-gray-500 block truncate">
                          {module.description}
                        </span>
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer del sidebar - siempre al fondo */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50 mt-auto">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Son D'licias v1.0</p>
              <p className="text-xs text-indigo-600 font-medium">Sistema de Gestión</p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default Sidebar;