import React, { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, X, Search, Edit, Trash2 } from 'lucide-react';
import Modal, { ModalBody, ModalFooter } from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { getAllProducts, getProductsByCategory } from '../../services/data/menuItems';
import { CATEGORIES } from '../../utils/constants';

const OrderModal = ({ 
  isOpen, 
  onClose, 
  table, 
  onCreateOrder, 
  onUpdateOrder,
  onDeleteOrder,
  existingOrder = null,
  loading = false 
}) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Cargar datos del pedido existente si existe
  useEffect(() => {
    if (existingOrder) {
      setSelectedProducts(existingOrder.items || []);
      setCustomerName(existingOrder.customerName || '');
      setCustomerPhone(existingOrder.customerPhone || '');
      setOrderNotes(existingOrder.notes || '');
      setIsEditMode(true);
    } else {
      setSelectedProducts([]);
      setCustomerName('');
      setCustomerPhone('');
      setOrderNotes('');
      setIsEditMode(false);
    }
  }, [existingOrder]);

  // Obtener productos disponibles
  const allProducts = getAllProducts();
  
  // Filtrar productos por búsqueda y categoría
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  // Agregar producto al pedido
  const addProduct = (product) => {
    const existingItem = selectedProducts.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setSelectedProducts(prev => 
          prev.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      }
    } else {
      setSelectedProducts(prev => [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        subtotal: product.price
      }]);
    }
  };

  // Actualizar cantidad de producto
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedProducts(prev => prev.filter(item => item.id !== productId));
    } else {
      setSelectedProducts(prev => 
        prev.map(item => 
          item.id === productId 
            ? { ...item, quantity: newQuantity, subtotal: item.price * newQuantity }
            : item
        )
      );
    }
  };

  // Calcular totales
  const subtotal = selectedProducts.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = 0; // Sin IGV
  const total = subtotal;

  // Crear pedido
  const handleCreateOrder = async () => {
    if (selectedProducts.length === 0) {
      alert('Debe agregar al menos un producto al pedido');
      return;
    }

    const orderData = {
      tableId: table.id,
      customerName: customerName.trim() || null,
      customerPhone: customerPhone.trim() || null,
      subtotal,
      tax,
      total,
      notes: orderNotes.trim() || null,
      items: selectedProducts,
      createdBy: null // Sin usuario por ahora
    };

    const success = await onCreateOrder(orderData);
    if (success) {
      resetForm();
      onClose();
    }
  };

  // Actualizar pedido existente
  const handleUpdateOrder = async () => {
    if (selectedProducts.length === 0) {
      alert('Debe agregar al menos un producto al pedido');
      return;
    }

    const orderData = {
      customerName: customerName.trim() || null,
      customerPhone: customerPhone.trim() || null,
      subtotal,
      tax,
      total,
      notes: orderNotes.trim() || null,
      items: selectedProducts
    };

    const success = await onUpdateOrder(existingOrder.id, orderData);
    if (success) {
      onClose();
    }
  };

  // Eliminar pedido
  const handleDeleteOrder = async () => {
    if (window.confirm('¿Está seguro de que desea eliminar este pedido? Esta acción no se puede deshacer.')) {
      const success = await onDeleteOrder(existingOrder.id);
      if (success) {
        onClose();
      }
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setSelectedProducts([]);
    setCustomerName('');
    setCustomerPhone('');
    setOrderNotes('');
    setSearchTerm('');
    setSelectedCategory('all');
  };

  // Cerrar modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    { value: CATEGORIES.HAMBURGUESAS, label: 'Hamburguesas' },
    { value: CATEGORIES.A_LA_CARTA, label: 'A la Carta' },
    { value: CATEGORIES.BEBIDAS_GASCIFICADAS, label: 'Bebidas Gaseosas' },
    { value: CATEGORIES.JUGOS, label: 'Jugos' },
    { value: CATEGORIES.BEBIDAS_CALIENTES, label: 'Bebidas Calientes' },
    { value: CATEGORIES.BEBIDAS_FRIAS, label: 'Bebidas Frías' },
    { value: CATEGORIES.TRAGOS, label: 'Tragos' },
    { value: CATEGORIES.POSTRES, label: 'Postres' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? `Editar Pedido - Mesa ${table?.table_number}` : `Nuevo Pedido - Mesa ${table?.table_number}`}
      size="4xl"
    >
      <ModalBody>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
          {/* Panel izquierdo: Productos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Seleccionar Productos</h3>
            
            {/* Filtros */}
            <div className="space-y-3">
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Lista de productos */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <p className="text-xs text-gray-600">S/ {product.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => addProduct(product)}
                    icon={Plus}
                  >
                    Agregar
                  </Button>
                </div>
              ))}
              
              {filteredProducts.length === 0 && (
                <p className="text-center text-gray-500 py-4">No se encontraron productos</p>
              )}
            </div>
          </div>

          {/* Panel derecho: Pedido */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Resumen del Pedido</h3>
              <ShoppingCart className="h-5 w-5 text-indigo-600" />
            </div>

            {/* Información del cliente */}
            <div className="space-y-3">
              <Input
                label="Nombre del Cliente (Opcional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ingrese nombre del cliente"
              />
              
              <Input
                label="Teléfono (Opcional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Ingrese teléfono"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas del Pedido (Opcional)
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Especificaciones especiales, alergias, etc."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Items del pedido */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Items del Pedido</h4>
              
              {selectedProducts.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay productos seleccionados</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedProducts.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-indigo-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">S/ {item.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          icon={Minus}
                        />
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          icon={Plus}
                        />
                      </div>
                      
                      <div className="text-right ml-2">
                        <p className="font-medium text-sm">S/ {item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totales */}
            {selectedProducts.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <div className="flex justify-between items-center w-full">
          <div>
            {isEditMode && (
              <Button
                variant="destructive"
                onClick={handleDeleteOrder}
                icon={Trash2}
                disabled={loading}
              >
                Eliminar Pedido
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="secondary" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            
            <Button 
              variant="primary" 
              onClick={isEditMode ? handleUpdateOrder : handleCreateOrder}
              disabled={loading || selectedProducts.length === 0}
              icon={isEditMode ? Edit : ShoppingCart}
            >
              {loading ? 'Procesando...' : (isEditMode ? 'Actualizar Pedido' : 'Crear Pedido')}
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default OrderModal;