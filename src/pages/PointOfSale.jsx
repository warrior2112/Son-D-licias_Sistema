// Punto de Venta - Solo platos del menú digital, sin insumos de inventario

import React, { useState, useMemo } from 'react';
import { ShoppingCart, Plus, Minus, Search, Filter, X, MapPin, ChefHat } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import { CURRENCY } from '../utils/constants';
import useTables from '../hooks/useTables';
import useProducts from '../hooks/useProducts';

// Categorías de platos del menú
const DISH_CATEGORY_LABELS = {
  'entradas': 'Entradas',
  'platos-principales': 'Platos Principales',
  'hamburguesas': 'Hamburguesas',
  'pollo': 'Especialidades de Pollo',
  'carnes': 'Carnes',
  'pastas': 'Pastas',
  'ensaladas': 'Ensaladas',
  'sopas': 'Sopas y Cremas',
  'postres': 'Postres',
  'bebidas-preparadas': 'Bebidas Preparadas',
  'jugos-frescos': 'Jugos Frescos',
  'bebidas-calientes': 'Bebidas Calientes',
  'tragos': 'Tragos y Cocteles'
};

const PointOfSale = ({ onCreateOrder, currentUser }) => {
  const { tables, getAvailableTables, occupyTable } = useTables();
  const { products, loading: productsLoading } = useProducts();
  
  const [currentOrder, setCurrentOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  const [orderNotes, setOrderNotes] = useState('');

  const availableTables = getAvailableTables();

  // Filtrar solo platos del menú digital (no insumos del inventario)
  const menuDishes = useMemo(() => {
    console.log('Total products:', products.length);
    console.log('Available categories:', Object.keys(DISH_CATEGORY_LABELS));
    console.log('Sample products:', products.slice(0, 3).map(p => ({ 
      name: p.name, 
      category: p.category, 
      isDish: p.isDish, 
      isIngredient: p.isIngredient,
      isAvailable: p.isAvailable 
    })));
    
    let debugCount = 0;
    const filtered = products.filter(product => {
      // Condiciones básicas
      const hasValidMenuCategory = Object.keys(DISH_CATEGORY_LABELS).includes(product.category);
      const isAvailable = product.isAvailable !== false;
      
      // Solo excluir si está explícitamente marcado como ingrediente
      const isNotExplicitIngredient = product.isIngredient !== true;
      
      // Filtro por nombre para excluir insumos obvios
      const isNotIngredientByName = !product.name?.toLowerCase().match(/\b(aceite|sal|pimienta|azúcar|harina|mantequilla|condimento|especia|vinagre|levadura|bicarbonato|insumo)\b/);
      
      // Permitir productos que:
      // 1. Tengan categoría válida del menú Y no sean ingredientes explícitos
      // 2. O que estén marcados explícitamente como platos
      const shouldInclude = (
        (hasValidMenuCategory && isNotExplicitIngredient && isNotIngredientByName && isAvailable) ||
        (product.isDish === true && isAvailable)
      );
      
      if (products.length > 0 && debugCount < 5) {
        console.log('Product check:', {
          name: product.name,
          category: product.category,
          hasValidMenuCategory,
          isNotExplicitIngredient,
          isNotIngredientByName,
          isAvailable,
          shouldInclude
        });
        debugCount++;
      }
      
      return shouldInclude;
    });
    
    console.log('Filtered dishes:', filtered.length);
    return filtered;
  }, [products]);

  // Filtrar platos
  const filteredDishes = useMemo(() => {
    let filtered = menuDishes;

    if (searchTerm) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.ingredients?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(dish => dish.category === selectedCategory);
    }

    return filtered;
  }, [menuDishes, searchTerm, selectedCategory]);

  // Agrupar platos por categoría
  const dishesByCategory = useMemo(() => {
    const grouped = {};
    filteredDishes.forEach(dish => {
      if (!grouped[dish.category]) {
        grouped[dish.category] = [];
      }
      grouped[dish.category].push(dish);
    });
    return grouped;
  }, [filteredDishes]);

  // Funciones del carrito (sin verificar stock)
  const addToOrder = (dish) => {
    const existingItem = currentOrder.find(item => item.id === dish.id);
    if (existingItem) {
      setCurrentOrder(currentOrder.map(item =>
        item.id === dish.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCurrentOrder([...currentOrder, { ...dish, quantity: 1 }]);
    }
  };

  const removeFromOrder = (dishId) => {
    setCurrentOrder(currentOrder.filter(item => item.id !== dishId));
  };

  const updateQuantity = (dishId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromOrder(dishId);
    } else {
      setCurrentOrder(currentOrder.map(item =>
        item.id === dishId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const calculateSubtotal = () => {
    return currentOrder.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // IGV 18%
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const clearOrder = () => {
    setCurrentOrder([]);
    setSelectedTable(null);
    setCustomerInfo({ name: '', phone: '' });
    setOrderNotes('');
    setShowOrderModal(false);
  };

  const handleCompleteOrder = async () => {
    if (currentOrder.length === 0) {
      alert('Agrega platos a la orden');
      return;
    }

    const orderData = {
      items: currentOrder,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      tableId: selectedTable?.id || null,
      customerName: customerInfo.name.trim() || null,
      customerPhone: customerInfo.phone.trim() || null,
      notes: orderNotes.trim() || null,
      createdBy: currentUser?.id
    };

    console.log('Enviando orden:', orderData);

    try {
      // 1. Crear la orden
      await onCreateOrder(orderData);
      
      // 2. Si hay mesa seleccionada, marcarla como ocupada
      if (selectedTable) {
        const tableResult = await occupyTable(selectedTable.id);
        if (tableResult.success) {
          console.log(`Mesa ${selectedTable.table_number} marcada como ocupada`);
        } else {
          console.warn('Error al ocupar mesa:', tableResult.error);
        }
      }
      
      clearOrder();
      alert('¡Orden enviada a cocina exitosamente!' + 
            (selectedTable ? ` Mesa ${selectedTable.table_number} ocupada.` : ''));
    } catch (error) {
      console.error('Error al crear orden:', error);
      alert('Error al crear la orden: ' + error.message);
    }
  };

  if (productsLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Cargando menú...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Punto de Venta</h2>
          <p className="text-gray-600">Selecciona platos del menú y procesa órdenes</p>
        </div>
        <Button
          onClick={() => setShowOrderModal(true)}
          variant="primary"
          icon={ShoppingCart}
          className="relative"
        >
          Ver Orden ({currentOrder.length})
          {currentOrder.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {currentOrder.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu Area */}
        <div className="lg:col-span-3">
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar platos del menú..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={Search}
                />
              </div>
              <div className="md:w-64">
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={[
                    { value: '', label: 'Todas las categorías' },
                    ...Object.entries(DISH_CATEGORY_LABELS).map(([key, label]) => ({ value: key, label }))
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Dishes by Category */}
          <div className="space-y-8">
            {Object.entries(dishesByCategory).map(([categoryKey, categoryDishes]) => (
              <div key={categoryKey}>
                <h3 className="text-xl font-semibold mb-4 capitalize bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center">
                  <ChefHat className="h-5 w-5 text-blue-600 mr-2" />
                  {DISH_CATEGORY_LABELS[categoryKey] || categoryKey.replace('-', ' ')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryDishes.map(dish => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      onAddToOrder={addToOrder}
                      isInOrder={currentOrder.some(item => item.id === dish.id)}
                      orderQuantity={currentOrder.find(item => item.id === dish.id)?.quantity || 0}
                    />
                  ))}
                </div>
              </div>
            ))}

            {filteredDishes.length === 0 && (
              <div className="text-center py-12">
                <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No se encontraron platos</h3>
                <p className="text-gray-500">
                  {menuDishes.length === 0 
                    ? 'No hay platos disponibles en el menú'
                    : 'Intenta cambiar los filtros de búsqueda'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Orden Actual</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Table Selection */}
              {availableTables.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mesa (Opcional)
                  </label>
                  <Select
                    value={selectedTable?.id || ''}
                    onChange={(e) => {
                      const table = availableTables.find(t => t.id === parseInt(e.target.value));
                      setSelectedTable(table || null);
                    }}
                    options={[
                      { value: '', label: 'Sin mesa asignada' },
                      ...availableTables.map(table => ({
                        value: table.id,
                        label: `Mesa ${table.table_number} (${table.capacity} personas - ${table.location})`
                      }))
                    ]}
                  />
                  {selectedTable && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 text-blue-700">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Mesa {selectedTable.table_number} - {selectedTable.location}</span>
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        ⚠️ Esta mesa se marcará como ocupada al confirmar la orden
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentOrder.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay platos en la orden</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {currentOrder.map(item => (
                      <OrderItem
                        key={item.id}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromOrder}
                      />
                    ))}
                  </div>
                  
                  {/* Order Summary */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{CURRENCY} {calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IGV (18%):</span>
                      <span>{CURRENCY} {calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                        {CURRENCY} {calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Button
                      onClick={() => setShowOrderModal(true)}
                      variant="primary"
                      className="w-full"
                    >
                      Enviar a Cocina
                    </Button>
                    <Button
                      onClick={clearOrder}
                      variant="secondary"
                      className="w-full"
                    >
                      Limpiar Orden
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Order Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Confirmar Orden"
        size="lg"
      >
        <ModalBody>
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre del Cliente"
                placeholder="Opcional"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              />
              <Input
                label="Teléfono"
                placeholder="Opcional"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              />
            </div>

            {/* Table Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mesa</label>
              <Select
                value={selectedTable?.id || ''}
                onChange={(e) => {
                  const table = availableTables.find(t => t.id === parseInt(e.target.value));
                  setSelectedTable(table || null);
                }}
                options={[
                  { value: '', label: 'Sin mesa asignada' },
                  ...availableTables.map(table => ({
                    value: table.id,
                    label: `Mesa ${table.table_number} (${table.capacity} personas - ${table.location})`
                  }))
                ]}
              />
              
              {selectedTable && (
                <div className="mt-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div>
                      <p className="text-yellow-800 font-medium text-sm">
                        Mesa {selectedTable.table_number} será ocupada
                      </p>
                      <p className="text-yellow-700 text-xs mt-1">
                        Al confirmar esta orden, la mesa se marcará automáticamente como "Ocupada" 
                        y no estará disponible para nuevas órdenes hasta que se libere.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Special Notes */}
            <div>
              <Input
                label="Notas Especiales"
                placeholder="Instrucciones para la cocina..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </div>

            {/* Order Summary */}
            <div>
              <h4 className="font-semibold mb-3">Resumen de la Orden</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {currentOrder.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-600 ml-2">x{item.quantity}</span>
                      {item.preparationTime && (
                        <span className="text-xs text-blue-600 ml-2">
                          🕒 {item.preparationTime} min
                        </span>
                      )}
                    </div>
                    <span className="font-semibold">
                      {CURRENCY} {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{CURRENCY} {calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IGV (18%):</span>
                    <span>{CURRENCY} {calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      {CURRENCY} {calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del flujo */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                💡 <strong>Nota:</strong> Esta orden será enviada a cocina para su preparación. 
                Los platos del menú no requieren verificación de stock de insumos.
                {selectedTable && (
                  <span className="block mt-2">
                    🪑 La mesa {selectedTable.table_number} se marcará como ocupada.
                  </span>
                )}
              </p>
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleCompleteOrder}>
            {selectedTable ? 
              `Enviar a Cocina y Ocupar Mesa ${selectedTable.table_number}` : 
              'Enviar a Cocina'
            }
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

// Dish Card Component (actualizado para platos sin stock)
const DishCard = ({ dish, onAddToOrder, isInOrder, orderQuantity }) => (
  <Card className="hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-amber-200">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-800 flex-1 line-clamp-2">{dish.name}</h4>
        <span className="text-lg font-bold ml-2 bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
          {CURRENCY} {dish.price}
        </span>
      </div>
      
      {dish.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{dish.description}</p>
      )}
      
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-gray-600">
          {dish.preparationTime && (
            <span>🕒 {dish.preparationTime} min</span>
          )}
          {dish.ingredients && (
            <span className="block text-xs text-gray-500 truncate mt-1">
              {dish.ingredients}
            </span>
          )}
        </div>
        {isInOrder && (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
            En orden: {orderQuantity}
          </span>
        )}
      </div>
      
      {dish.isSpecial && (
        <div className="mb-2">
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            ⭐ Especial del Chef
          </span>
        </div>
      )}
      
      {dish.allergens && (
        <div className="mb-2">
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
            ⚠️ {dish.allergens}
          </span>
        </div>
      )}
      
      <Button
        onClick={() => onAddToOrder(dish)}
        variant="primary"
        className="w-full"
        size="sm"
      >
        Agregar al Pedido
      </Button>
    </CardContent>
  </Card>
);

// Order Item Component (sin cambios)
const OrderItem = ({ item, onUpdateQuantity, onRemove }) => (
  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm truncate">{item.name}</p>
      <div className="flex items-center space-x-2 text-xs text-gray-600">
        <span>{CURRENCY} {item.price}</span>
        {item.preparationTime && (
          <span>• 🕒 {item.preparationTime} min</span>
        )}
      </div>
    </div>
    <div className="flex items-center space-x-2 ml-3">
      <button
        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
        className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
      <button
        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
      >
        <Plus className="h-3 w-3" />
      </button>
      <button
        onClick={() => onRemove(item.id)}
        className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors ml-1"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  </div>
);

export default PointOfSale;