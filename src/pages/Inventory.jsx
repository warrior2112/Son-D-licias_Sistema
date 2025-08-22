// Página de gestión de inventario para insumos de Son D'licias

import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Package, AlertTriangle, TrendingUp, TrendingDown, Beaker } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import useCategories from '../hooks/useCategories';
import { CURRENCY, STOCK_ALERTS } from '../utils/constants';

// Categorías específicas para insumos
const INGREDIENT_CATEGORIES = {
  CARNES: 'carnes',
  POLLO: 'pollo',
  VEGETALES: 'vegetales',
  LACTEOS: 'lacteos',
  GRANOS_CEREALES: 'granos-cereales',
  CONDIMENTOS: 'condimentos',
  BEBIDAS_EMBOTELLADAS: 'bebidas-embotelladas',
  ACEITES_GRASAS: 'aceites-grasas',
  PRODUCTOS_CONGELADOS: 'productos-congelados',
  OTROS_INSUMOS: 'otros-insumos'
};

const INGREDIENT_CATEGORY_LABELS = {
  [INGREDIENT_CATEGORIES.CARNES]: 'Carnes',
  [INGREDIENT_CATEGORIES.POLLO]: 'Pollo',
  [INGREDIENT_CATEGORIES.VEGETALES]: 'Vegetales y Frutas',
  [INGREDIENT_CATEGORIES.LACTEOS]: 'Lácteos',
  [INGREDIENT_CATEGORIES.GRANOS_CEREALES]: 'Granos y Cereales',
  [INGREDIENT_CATEGORIES.CONDIMENTOS]: 'Condimentos y Especias',
  [INGREDIENT_CATEGORIES.BEBIDAS_EMBOTELLADAS]: 'Bebidas Embotelladas',
  [INGREDIENT_CATEGORIES.ACEITES_GRASAS]: 'Aceites y Grasas',
  [INGREDIENT_CATEGORIES.PRODUCTOS_CONGELADOS]: 'Productos Congelados',
  [INGREDIENT_CATEGORIES.OTROS_INSUMOS]: 'Otros Insumos'
};

// Unidades de medida para insumos
const MEASUREMENT_UNITS = [
  { value: 'kg', label: 'Kilogramos' },
  { value: 'g', label: 'Gramos' },
  { value: 'l', label: 'Litros' },
  { value: 'ml', label: 'Mililitros' },
  { value: 'unidades', label: 'Unidades' },
  { value: 'cajas', label: 'Cajas' },
  { value: 'paquetes', label: 'Paquetes' },
  { value: 'latas', label: 'Latas' },
  { value: 'botellas', label: 'Botellas' }
];

const Inventory = ({ inventory = [], onUpdateStock, onAddIngredient, onUpdateIngredient, onDeleteIngredient }) => {
  const { getInventoryCategories } = useCategories();
  const inventoryCategories = getInventoryCategories();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [stockReason, setStockReason] = useState('');

  // Nuevo insumo
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    description: '',
    category_id: inventoryCategories[0]?.id || '',
    unit: 'kg',
    stock: '',
    minStock: '5',
    unitCost: '',
    supplier: '',
    expirationDate: ''
  });

  // Filtrar solo insumos (no platos preparados)
  const ingredients = useMemo(() => {
    return inventory.filter(item => 
      inventoryCategories.some(cat => cat.id === parseInt(item.category_id)) || 
      item.isIngredient === true
    );
  }, [inventory]);

  // Filtrar insumos
  const filteredIngredients = useMemo(() => {
    let filtered = [...ingredients];

    if (searchTerm) {
      filtered = filtered.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingredient.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingredient.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(ingredient => ingredient.category_id === parseInt(categoryFilter));
    }

    if (stockFilter) {
      switch (stockFilter) {
        case 'low':
          filtered = filtered.filter(ingredient => 
            ingredient.stock <= (ingredient.minStock || STOCK_ALERTS.LOW_STOCK) && ingredient.stock > 0);
          break;
        case 'out':
          filtered = filtered.filter(ingredient => ingredient.stock === 0);
          break;
        case 'good':
          filtered = filtered.filter(ingredient => 
            ingredient.stock > (ingredient.minStock || STOCK_ALERTS.LOW_STOCK));
          break;
        default:
          break;
      }
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [ingredients, searchTerm, categoryFilter, stockFilter]);

  // Estadísticas de insumos
  const stats = useMemo(() => {
    const total = ingredients.length;
    const lowStock = ingredients.filter(item => 
      item.stock <= (item.minStock || STOCK_ALERTS.LOW_STOCK) && item.stock > 0).length;
    const outOfStock = ingredients.filter(item => item.stock === 0).length;
    const totalValue = ingredients.reduce((sum, item) => 
      sum + ((item.unitCost || 0) * item.stock), 0);

    return {
      total,
      lowStock,
      outOfStock,
      healthy: total - lowStock - outOfStock,
      totalValue
    };
  }, [ingredients]);

  const handleAddIngredient = () => {
    const ingredientData = {
      ...newIngredient,
      unitCost: parseFloat(newIngredient.unitCost) || 0,
      stock: parseInt(newIngredient.stock) || 0,
      minStock: parseInt(newIngredient.minStock) || 5,
      isIngredient: true, // Marcar como insumo
      expirationDate: newIngredient.expirationDate || null,
      category_id: newIngredient.category_id
    };
    // Remove any 'category' property that might exist
    delete ingredientData.category;
    
    onAddIngredient?.(ingredientData);
    setNewIngredient({
      name: '',
      description: '',
      category_id: inventoryCategories[0]?.id || '',
      unit: 'kg',
      stock: '',
      minStock: '5',
      unitCost: '',
      supplier: '',
      expirationDate: ''
    });
    setShowAddModal(false);
  };

  const handleEditIngredient = () => {
    if (selectedIngredient) {
      const updates = {
        ...selectedIngredient,
        unitCost: parseFloat(selectedIngredient.unitCost) || 0,
        minStock: parseInt(selectedIngredient.minStock) || 5,
        category_id: selectedIngredient.category_id
      };
      // Remove any 'category' property that might exist
      delete updates.category;
      onUpdateIngredient?.(selectedIngredient.id, updates);
      setShowEditModal(false);
      setSelectedIngredient(null);
    }
  };

  const handleUpdateStock = () => {
    if (selectedIngredient && newStock !== '') {
      onUpdateStock?.(selectedIngredient.id, parseInt(newStock), stockReason || 'Ajuste de inventario');
      setShowStockModal(false);
      setSelectedIngredient(null);
      setNewStock('');
      setStockReason('');
    }
  };

  const openStockModal = (ingredient) => {
    setSelectedIngredient(ingredient);
    setNewStock(ingredient.stock.toString());
    setShowStockModal(true);
  };

  const openEditModal = (ingredient) => {
    setSelectedIngredient({ ...ingredient });
    setShowEditModal(true);
  };

  const getStockStatus = (ingredient) => {
    if (ingredient.stock === 0) {
      return { status: 'out', color: 'text-red-600 bg-red-100', label: 'Agotado' };
    } else if (ingredient.stock <= (ingredient.minStock || STOCK_ALERTS.LOW_STOCK)) {
      return { status: 'low', color: 'text-yellow-600 bg-yellow-100', label: 'Stock Bajo' };
    } else {
      return { status: 'good', color: 'text-green-600 bg-green-100', label: 'Disponible' };
    }
  };

  const isExpiringSoon = (expirationDate) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 7 && daysUntilExpiration > 0;
  };

  const isExpired = (expirationDate) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const today = new Date();
    return expDate < today;
  };

  const stockFilterOptions = [
    { value: '', label: 'Todos los insumos' },
    { value: 'good', label: 'Stock normal' },
    { value: 'low', label: 'Stock bajo' },
    { value: 'out', label: 'Agotado' }
  ];

  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    ...inventoryCategories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
  ];

  const categorySelectOptions = inventoryCategories.map(cat => ({ 
    value: cat.id.toString(), 
    label: cat.name 
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Inventario de Insumos</h2>
          <p className="text-gray-600">Gestiona los insumos y materias primas del restaurante</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="primary" icon={Plus}>
          Agregar Insumo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <Beaker className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Insumos</div>
          </CardContent>
        </Card>
        <Card className="text-center border-l-4 border-green-400">
          <CardContent className="p-4">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
            <div className="text-sm text-gray-600">Stock Normal</div>
          </CardContent>
        </Card>
        <Card className="text-center border-l-4 border-yellow-400">
          <CardContent className="p-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
            <div className="text-sm text-gray-600">Stock Bajo</div>
          </CardContent>
        </Card>
        <Card className="text-center border-l-4 border-red-400">
          <CardContent className="p-4">
            <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            <div className="text-sm text-gray-600">Agotado</div>
          </CardContent>
        </Card>
        <Card className="text-center bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">{CURRENCY} {stats.totalValue.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Valor Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar insumos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={categoryOptions}
            />
            <Select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              options={stockFilterOptions}
            />
          </div>
          
          {(searchTerm || categoryFilter || stockFilter) && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                <span>Mostrando {filteredIngredients.length} de {ingredients.length} insumos</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setStockFilter('');
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ingredients Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Insumo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo Unitario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIngredients.map((ingredient) => {
                  const stockStatus = getStockStatus(ingredient);
                  const expiringSoon = isExpiringSoon(ingredient.expirationDate);
                  const expired = isExpired(ingredient.expirationDate);
                  
                  return (
                    <tr key={ingredient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{ingredient.name}</div>
                          {ingredient.description && (
                            <div className="text-sm text-gray-500">{ingredient.description}</div>
                          )}
                          {(expiringSoon || expired) && (
                            <div className={`text-xs mt-1 ${expired ? 'text-red-600' : 'text-yellow-600'}`}>
                              {expired ? '⚠️ Vencido' : '⏰ Vence pronto'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {inventoryCategories.find(cat => cat.id === parseInt(ingredient.category_id))?.name || 'Sin categoría'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{ingredient.stock}</div>
                        <div className="text-xs text-gray-500">Mín: {ingredient.minStock || 5}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {ingredient.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {CURRENCY} {(ingredient.unitCost || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Total: {CURRENCY} {((ingredient.unitCost || 0) * ingredient.stock).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {ingredient.supplier || 'No especificado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openStockModal(ingredient)}
                          icon={Package}
                          title="Actualizar stock"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(ingredient)}
                          icon={Edit}
                          title="Editar insumo"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteIngredient?.(ingredient.id)}
                          icon={Trash2}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar insumo"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredIngredients.length === 0 && (
              <div className="text-center py-12">
                <Beaker className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No se encontraron insumos</h3>
                <p className="text-gray-500">
                  {ingredients.length === 0 
                    ? 'No hay insumos registrados aún'
                    : 'Intenta cambiar los filtros de búsqueda'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Ingredient Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Agregar Nuevo Insumo"
        size="lg"
      >
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre del Insumo"
                placeholder="Ej: Pollo entero, Aceite vegetal"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                required
              />
              <Select
                label="Categoría"
                value={newIngredient.category_id}
                onChange={(e) => setNewIngredient({...newIngredient, category_id: e.target.value})}
                options={categorySelectOptions}
                required
              />
            </div>
            
            <Input
              label="Descripción (Opcional)"
              placeholder="Descripción del insumo..."
              value={newIngredient.description}
              onChange={(e) => setNewIngredient({...newIngredient, description: e.target.value})}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Stock Inicial"
                type="number"
                placeholder="0"
                value={newIngredient.stock}
                onChange={(e) => setNewIngredient({...newIngredient, stock: e.target.value})}
                required
              />
              <Select
                label="Unidad de Medida"
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient({...newIngredient, unit: e.target.value})}
                options={MEASUREMENT_UNITS}
                required
              />
              <Input
                label="Stock Mínimo"
                type="number"
                placeholder="5"
                value={newIngredient.minStock}
                onChange={(e) => setNewIngredient({...newIngredient, minStock: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Costo Unitario"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newIngredient.unitCost}
                onChange={(e) => setNewIngredient({...newIngredient, unitCost: e.target.value})}
                required
              />
              <Input
                label="Proveedor (Opcional)"
                placeholder="Nombre del proveedor"
                value={newIngredient.supplier}
                onChange={(e) => setNewIngredient({...newIngredient, supplier: e.target.value})}
              />
            </div>
            
            <Input
              label="Fecha de Vencimiento (Opcional)"
              type="date"
              value={newIngredient.expirationDate}
              onChange={(e) => setNewIngredient({...newIngredient, expirationDate: e.target.value})}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddIngredient}
            disabled={!newIngredient.name || !newIngredient.category_id}
          >
            Agregar Insumo
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Ingredient Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Insumo"
        size="lg"
      >
        {selectedIngredient && (
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombre del Insumo"
                  value={selectedIngredient.name}
                  onChange={(e) => setSelectedIngredient({...selectedIngredient, name: e.target.value})}
                  required
                />
                <Select
                  label="Categoría"
                  value={selectedIngredient.category_id}
                  onChange={(e) => setSelectedIngredient({...selectedIngredient, category_id: e.target.value})}
                  options={categorySelectOptions}
                  required
                />
              </div>
              
              <Input
                label="Descripción"
                value={selectedIngredient.description || ''}
                onChange={(e) => setSelectedIngredient({...selectedIngredient, description: e.target.value})}
              />
              
              <div className="grid grid-cols-3 gap-4">
                <Select
                  label="Unidad de Medida"
                  value={selectedIngredient.unit}
                  onChange={(e) => setSelectedIngredient({...selectedIngredient, unit: e.target.value})}
                  options={MEASUREMENT_UNITS}
                  required
                />
                <Input
                  label="Stock Mínimo"
                  type="number"
                  value={selectedIngredient.minStock || 5}
                  onChange={(e) => setSelectedIngredient({...selectedIngredient, minStock: e.target.value})}
                  required
                />
                <Input
                  label="Costo Unitario"
                  type="number"
                  step="0.01"
                  value={selectedIngredient.unitCost || 0}
                  onChange={(e) => setSelectedIngredient({...selectedIngredient, unitCost: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Proveedor"
                  value={selectedIngredient.supplier || ''}
                  onChange={(e) => setSelectedIngredient({...selectedIngredient, supplier: e.target.value})}
                />
                <Input
                  label="Fecha de Vencimiento"
                  type="date"
                  value={selectedIngredient.expirationDate || ''}
                  onChange={(e) => setSelectedIngredient({...selectedIngredient, expirationDate: e.target.value})}
                />
              </div>
            </div>
          </ModalBody>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleEditIngredient}>
            Guardar Cambios
          </Button>
        </ModalFooter>
      </Modal>

      {/* Update Stock Modal */}
      <Modal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        title={`Actualizar Stock - ${selectedIngredient?.name}`}
        size="md"
      >
        {selectedIngredient && (
          <ModalBody>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Stock actual:</span>
                  <span className="text-lg font-bold">{selectedIngredient.stock} {selectedIngredient.unit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Stock mínimo:</span>
                  <span className="text-sm">{selectedIngredient.minStock || 5} {selectedIngredient.unit}</span>
                </div>
              </div>
              
              <Input
                label={`Nuevo Stock (${selectedIngredient.unit})`}
                type="number"
                placeholder="Ingresa el nuevo stock"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                required
              />
              
              <Input
                label="Motivo del Ajuste (Opcional)"
                placeholder="Ej: Reposición, Merma, Corrección..."
                value={stockReason}
                onChange={(e) => setStockReason(e.target.value)}
              />
              
              {newStock && selectedIngredient && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Diferencia:</span>
                    <span className={`font-bold ${parseInt(newStock) > selectedIngredient.stock ? 'text-green-600' : parseInt(newStock) < selectedIngredient.stock ? 'text-red-600' : 'text-gray-600'}`}>
                      {parseInt(newStock) > selectedIngredient.stock ? '+' : ''}{parseInt(newStock) - selectedIngredient.stock} {selectedIngredient.unit}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowStockModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateStock}
            disabled={!newStock || newStock === selectedIngredient?.stock.toString()}
          >
            Actualizar Stock
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Inventory;
                      