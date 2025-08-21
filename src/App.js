// Aplicación principal completa - Con sistema de notificaciones MTB y exportación

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// Components
import LoginForm from './components/auth/LoginForm';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import { FullPageSpinner } from './components/common/LoadingSpinner';

// Sistema de notificaciones MTB
import { NotificationProvider } from './components/common/NotificationSystem';

// Pages
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Production from './pages/Production';
import Reports from './pages/Reports';
import TableManagement from './pages/TableManagement';
import MenuManagement from './pages/MenuManagement';
import UserManagementPage from './pages/UserManagementPage';

// Hooks y servicios
import useAuth from './hooks/useAuth';
import useOrders from './hooks/useOrders';
import useProducts from './hooks/useProducts';
import useInventory from './hooks/useInventory';
import useTables from './hooks/useTables';
import useSupabase from './hooks/useSupabase';

// Utils
import { ROUTES } from './utils/constants';

function App() {
  const [activeModule, setActiveModule] = useState(ROUTES.DASHBOARD);

  // Hooks
  const {
    user,
    users,
    loading: authLoading,
    error: authError,
    isAuthenticated,
    login,
    logout,
    registerUser,
    updateUser,
    deactivateUser,
    clearError: clearAuthError
  } = useAuth();

  const {
    orders,
    loading: ordersLoading,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    loadOrders
  } = useOrders();

  const {
    products,
    categories,
    loading: productsLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    loadProducts
  } = useProducts();

  const { 
    inventory,
    updateStock: updateInventoryStock,
    processOrder
  } = useInventory(products);

  const {
    tables,
    loading: tablesLoading,
    loadTables
  } = useTables();

  const { isConnected: supabaseConnected, isLoading: supabaseLoading } = useSupabase();

  // Estados locales
  const [appLoading, setAppLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Separar productos en insumos y platos
  const ingredients = products.filter(item => 
    item.isIngredient === true || 
    ['carnes', 'pollo', 'vegetales', 'lacteos', 'granos-cereales', 'condimentos', 
     'bebidas-embotelladas', 'aceites-grasas', 'productos-congelados', 'otros-insumos'].includes(item.category)
  );

  const dishes = products.filter(item => 
    item.isDish === true || 
    item.isIngredient !== true ||
    ['entradas', 'platos-principales', 'hamburguesas', 'pollo', 'carnes', 'pastas', 
     'ensaladas', 'sopas', 'postres', 'bebidas-preparadas', 'jugos-frescos', 
     'bebidas-calientes', 'tragos'].includes(item.category)
  );

  // Función para refrescar todos los datos
  const refreshAllData = async () => {
    try {
      setAppLoading(true);
      
      if (isAuthenticated) {
        await Promise.all([
          loadOrders(),
          loadProducts(),
          loadTables()
        ]);
      }
      
      setLastRefresh(new Date());
      setConnectionError(null);
      
      // Mostrar notificación de éxito global si está disponible
      if (window.showNotification) {
        window.showNotification('Datos actualizados correctamente', 'success');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      setConnectionError('Error al actualizar datos');
      
      if (window.showNotification) {
        window.showNotification('Error al actualizar datos', 'error');
      }
    } finally {
      setAppLoading(false);
    }
  };

  // Verificar conexión y cargar datos iniciales
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setAppLoading(true);
        
        if (!supabaseConnected && !supabaseLoading) {
          setConnectionError('No se pudo conectar con la base de datos');
          return;
        }

        // Cargar datos iniciales si el usuario está autenticado
        if (isAuthenticated) {
          await Promise.all([
            loadOrders(),
            loadProducts(),
            loadTables()
          ]);
        }

        setConnectionError(null);
      } catch (error) {
        console.error('Error initializing app:', error);
        setConnectionError('Error al inicializar la aplicación');
      } finally {
        setAppLoading(false);
      }
    };

    if (!supabaseLoading) {
      initializeApp();
    }
  }, [isAuthenticated, supabaseConnected, supabaseLoading, loadOrders, loadProducts, loadTables]);

  // Auto-refresh cada 5 minutos para datos en tiempo real
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshAllData();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Manejar creación de órdenes
  const handleCreateOrder = async (orderData) => {
    try {
      const result = await createOrder(orderData);
      if (result.success) {
        // Para órdenes, no reducimos stock de insumos automáticamente
        // Ya que los platos no tienen stock físico
        await loadTables(); // Solo recargar mesas
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // Manejar actualización de estado de orden con recarga de mesas
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        await loadTables();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  // FUNCIONES SEPARADAS PARA INSUMOS Y PLATOS

  // Funciones para INSUMOS (inventario)
  const handleAddIngredient = async (ingredientData) => {
    try {
      const result = await createProduct({
        ...ingredientData,
        isIngredient: true,
        isDish: false
      });
      if (result.success) {
        await loadProducts();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error adding ingredient:', error);
      throw error;
    }
  };

  const handleUpdateIngredient = async (ingredientId, updates) => {
    try {
      const result = await updateProduct(ingredientId, {
        ...updates,
        isIngredient: true,
        isDish: false
      });
      if (result.success) {
        await loadProducts();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating ingredient:', error);
      throw error;
    }
  };

  const handleDeleteIngredient = async (ingredientId) => {
    try {
      const result = await deleteProduct(ingredientId);
      if (result.success) {
        await loadProducts();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      throw error;
    }
  };

  const handleUpdateStock = async (ingredientId, newStock, reason) => {
    try {
      const result = await updateStock(ingredientId, newStock, reason);
      if (result.success) {
        await loadProducts();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };

  // Funciones para PLATOS (menú)
  const handleAddDish = async (dishData) => {
    try {
      const result = await createProduct({
        ...dishData,
        isDish: true,
        isIngredient: false,
        stock: 0, // Los platos no tienen stock
        minStock: 0
      });
      if (result.success) {
        await loadProducts();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error adding dish:', error);
      throw error;
    }
  };

  const handleUpdateDish = async (dishId, updates) => {
    try {
      const result = await updateProduct(dishId, {
        ...updates,
        isDish: true,
        isIngredient: false
      });
      if (result.success) {
        await loadProducts();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating dish:', error);
      throw error;
    }
  };

  const handleDeleteDish = async (dishId) => {
    try {
      const result = await deleteProduct(dishId);
      if (result.success) {
        await loadProducts();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
      throw error;
    }
  };

  // Manejar actualización de órdenes con recarga de datos
  const handleUpdateOrder = async (orderId, orderData) => {
    try {
      const result = await updateOrder(orderId, orderData);
      if (result.success) {
        await Promise.all([
          loadOrders(),
          loadTables()
        ]);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  // Manejar eliminación de órdenes con recarga de mesas
  const handleDeleteOrder = async (orderId) => {
    try {
      const result = await deleteOrder(orderId);
      if (result.success) {
        await Promise.all([
          loadOrders(),
          loadTables()
        ]);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  // Manejar login con mejor manejo de errores
  const handleLogin = async (username, password) => {
    try {
      const result = await login(username, password);
      if (result.success) {
        await Promise.all([
          loadOrders(),
          loadProducts(),
          loadTables()
        ]);
      }
      return result;
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: error.message };
    }
  };

  // Loading states
  if (supabaseLoading || appLoading) {
    return <FullPageSpinner text="Inicializando sistema Son D'licias..." />;
  }

  // Connection error
  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Error de Conexión</h1>
          <p className="text-gray-600 mb-6">{connectionError}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={refreshAllData}
              className="w-full bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Actualizar Datos
            </button>
            <p className="text-xs text-gray-500">
              Verifica tu conexión a internet y las variables de entorno de Supabase
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginForm
          onLogin={handleLogin}
          loading={authLoading}
          error={authError}
          onClearError={clearAuthError}
        />
      </ErrorBoundary>
    );
  }

  // Main application
  const renderActiveModule = () => {
    const commonProps = {
      currentUser: user,
      loading: ordersLoading || productsLoading || tablesLoading
    };

    switch (activeModule) {
      case ROUTES.DASHBOARD:
        return (
          <Dashboard
            orders={orders}
            inventory={ingredients} // Solo mostrar insumos en dashboard
            onNavigate={setActiveModule}
            {...commonProps}
          />
        );


      case ROUTES.ORDERS:
        return (
          <Orders
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onReloadOrders={loadOrders}
            {...commonProps}
          />
        );

      case ROUTES.INVENTORY:
        return (
          <Inventory
            inventory={ingredients} // Solo insumos
            onUpdateStock={handleUpdateStock}
            onAddIngredient={handleAddIngredient} // Función específica para insumos
            onUpdateIngredient={handleUpdateIngredient}
            onDeleteIngredient={handleDeleteIngredient}
            {...commonProps}
          />
        );

      case ROUTES.PRODUCTION:
        return (
          <Production
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            {...commonProps}
          />
        );

      case ROUTES.REPORTS:
        return (
          <Reports
            orders={orders}
            inventory={ingredients} // Solo insumos para reportes de inventario
            {...commonProps}
          />
        );

      case 'tables':
        return (
          <TableManagement
            orders={orders}
            onCreateOrder={handleCreateOrder}
            onUpdateOrder={handleUpdateOrder}
            onDeleteOrder={handleDeleteOrder}
            onReloadOrders={loadOrders}
            {...commonProps}
          />
        );

      case ROUTES.MENU:
        return (
          <MenuManagement
            dishes={dishes} // Solo platos del menú
            onAddDish={handleAddDish} // Función específica para platos
            onUpdateDish={handleUpdateDish}
            onDeleteDish={handleDeleteDish}
            {...commonProps}
          />
        );

      case 'users':
        return (
          <UserManagementPage
            users={users}
            onRegisterUser={registerUser}
            onUpdateUser={updateUser}
            onDeactivateUser={deactivateUser}
            {...commonProps}
          />
        );

      default:
        return (
          <Dashboard
            orders={orders}
            inventory={ingredients}
            onNavigate={setActiveModule}
            {...commonProps}
          />
        );
    }
  };

  return (
    <ErrorBoundary>
      <Router>
        {/* NotificationProvider envuelve toda la aplicación */}
        <NotificationProvider 
          orders={orders} 
          inventory={ingredients} 
          tables={tables}
        >
          <div className="min-h-screen bg-gray-50">
            <Layout
              activeModule={activeModule}
              setActiveModule={setActiveModule}
              currentUser={user}
              onLogout={logout}
              onOpenUserManagement={() => setActiveModule('users')}
              // Props adicionales para el header mejorado
              orders={orders}
              inventory={ingredients}
              tables={tables}
              onRefreshData={refreshAllData}
            >
              {renderActiveModule()}
            </Layout>

            {/* Información de estado en modo desarrollo */}
            {process.env.NODE_ENV === 'development' && (
              <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs z-50">
                <div>🔄 Última actualización: {lastRefresh.toLocaleTimeString()}</div>
                <div>📊 {orders.length} órdenes • {ingredients.length} insumos • {dishes.length} platos</div>
                <div>🪑 {tables.length} mesas • {users.length} usuarios</div>
                <div>
                  {supabaseConnected ? '🟢 Supabase conectado' : '🔴 Supabase desconectado'}
                </div>
              </div>
            )}
          </div>
        </NotificationProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;