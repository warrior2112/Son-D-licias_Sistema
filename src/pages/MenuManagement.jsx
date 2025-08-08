// Página de gestión del menú digital - Solo platos preparados (sin stock)

import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Menu as MenuIcon, DollarSign, Eye, EyeOff, ChefHat } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { Select, Textarea } from '../components/ui/Input';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import { CURRENCY } from '../utils/constants';

// Categorías específicas para platos del menú
const DISH_CATEGORIES = {
  ENTRADAS: 'entradas',
  PLATOS_PRINCIPALES: 'platos-principales', 
  HAMBURGUESAS: 'hamburguesas',
  POLLO: 'pollo',
  CARNES: 'carnes',
  PASTAS: 'pastas',
  ENSALADAS: 'ensaladas',
  SOPAS: 'sopas',
  POSTRES: 'postres',
  BEBIDAS_PREPARADAS: 'bebidas-preparadas',
  JUGOS_FRESCOS: 'jugos-frescos',
  BEBIDAS_CALIENTES: 'bebidas-calientes',
  TRAGOS: 'tragos'
};

const DISH_CATEGORY_LABELS = {
  [DISH_CATEGORIES.ENTRADAS]: 'Entradas',
  [DISH_CATEGORIES.PLATOS_PRINCIPALES]: 'Platos Principales',
  [DISH_CATEGORIES.HAMBURGUESAS]: 'Hamburguesas',
  [DISH_CATEGORIES.POLLO]: 'Especialidades de Pollo',
  [DISH_CATEGORIES.CARNES]: 'Carnes',
  [DISH_CATEGORIES.PASTAS]: 'Pastas',
  [DISH_CATEGORIES.ENSALADAS]: 'Ensaladas',
  [DISH_CATEGORIES.SOPAS]: 'Sopas y Cremas',
  [DISH_CATEGORIES.POSTRES]: 'Postres',
  [DISH_CATEGORIES.BEBIDAS_PREPARADAS]: 'Bebidas Preparadas',
  [DISH_CATEGORIES.JUGOS_FRESCOS]: 'Jugos Frescos',
  [DISH_CATEGORIES.BEBIDAS_CALIENTES]: 'Bebidas Calientes',
  [DISH_CATEGORIES.TRAGOS]: 'Tragos y Cocteles'
};

const MenuManagement = ({ dishes = [], onAddDish, onUpdateDish, onDeleteDish, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' o 'cards'

  const [newDish, setNewDish] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    ingredients: '',
    isAvailable: true,
    isSpecial: false,
    preparationTime: '',
    allergens: '',
    imageUrl: '',
    nutritionalInfo: ''
  });

  const [editDish, setEditDish] = useState({});

  // Filtrar solo platos del menú (no insumos)
  const menuDishes = useMemo(() => {
    return dishes.filter(item => 
      Object.values(DISH_CATEGORIES).includes(item.category) || 
      item.isDish === true ||
      !item.isIngredient // Si no está marcado como ingrediente, asumimos que es plato
    );
  }, [dishes]);

  // Filtrar platos del menú
  const filteredDishes = useMemo(() => {
    let filtered = [...menuDishes];

    if (searchTerm) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.ingredients?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(dish => dish.category === categoryFilter);
    }

    if (statusFilter) {
      switch (statusFilter) {
        case 'available':
          filtered = filtered.filter(dish => dish.isAvailable !== false);
          break;
        case 'unavailable':
          filtered = filtered.filter(dish => dish.isAvailable === false);
          break;
        case 'special':
          filtered = filtered.filter(dish => dish.isSpecial === true);
          break;
        default:
          break;
      }
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [menuDishes, searchTerm, categoryFilter, statusFilter]);

  // Estadísticas del menú
  const menuStats = useMemo(() => ({
    total: menuDishes.length,
    available: menuDishes.filter(dish => dish.isAvailable !== false).length,
    unavailable: menuDishes.filter(dish => dish.isAvailable === false).length,
    specials: menuDishes.filter(dish => dish.isSpecial === true).length,
    avgPrice: menuDishes.length > 0 ? menuDishes.reduce((sum, dish) => sum + (dish.price || 0), 0) / menuDishes.length : 0
  }), [menuDishes]);

  const handleCreateDish = async () => {
    if (!newDish.name || !newDish.price || !newDish.category) {
      alert('Nombre, precio y categoría son obligatorios');
      return;
    }

    const dishData = {
      ...newDish,
      price: parseFloat(newDish.price),
      preparationTime: parseInt(newDish.preparationTime) || null,
      isDish: true, // Marcar como plato del menú
      isIngredient: false, // No es insumo
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddDish(dishData);
    
    setNewDish({
      name: '',
      description: '',
      price: '',
      category: '',
      ingredients: '',
      isAvailable: true,
      isSpecial: false,
      preparationTime: '',
      allergens: '',
      imageUrl: '',
      nutritionalInfo: ''
    });
    setShowCreateModal(false);
    alert('Plato agregado al menú exitosamente');
  };

  const handleEditDish = async () => {
    if (!editDish.name || !editDish.price || !editDish.category) {
      alert('Nombre, precio y categoría son obligatorios');
      return;
    }

    const updates = {
      ...editDish,
      price: parseFloat(editDish.price),
      preparationTime: editDish.preparationTime ? parseInt(editDish.preparationTime) : null,
      updatedAt: new Date().toISOString()
    };

    onUpdateDish(selectedDish.id, updates);
    setShowEditModal(false);
    setSelectedDish(null);
    setEditDish({});
    alert('Plato actualizado exitosamente');
  };

  const openEditModal = (dish) => {
    setSelectedDish(dish);
    setEditDish({
      name: dish.name,
      description: dish.description || '',
      price: dish.price.toString(),
      category: dish.category,
      ingredients: dish.ingredients || '',
      isAvailable: dish.isAvailable !== false,
      isSpecial: dish.isSpecial || false,
      preparationTime: dish.preparationTime?.toString() || '',
      allergens: dish.allergens || '',
      imageUrl: dish.imageUrl || '',
      nutritionalInfo: dish.nutritionalInfo || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteDish = (dishId, dishName) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${dishName}" del menú?`)) {
      onDeleteDish(dishId);
      alert('Plato eliminado del menú');
    }
  };

  const toggleDishAvailability = (dish) => {
    onUpdateDish(dish.id, {
      isAvailable: !dish.isAvailable,
      updatedAt: new Date().toISOString()
    });
  };

  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    ...Object.entries(DISH_CATEGORY_LABELS).map(([key, label]) => ({ value: key, label }))
  ];

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'available', label: 'Disponibles' },
    { value: 'unavailable', label: 'No disponibles' },
    { value: 'special', label: 'Especiales' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Menú Digital</h2>
          <p className="text-gray-600">Gestiona los platos y precios de la carta del restaurante</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Tabla
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Tarjetas
            </button>
          </div>
          <Button onClick={() => setShowCreateModal(true)} variant="primary" icon={Plus}>
            Agregar Plato
          </Button>
        </div>
      </div>

      {/* Menu Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <ChefHat className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{menuStats.total}</div>
            <div className="text-sm text-gray-600">Total Platos</div>
          </CardContent>
        </Card>
        
        <Card className="text-center border-l-4 border-green-400">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{menuStats.available}</div>
            <div className="text-sm text-gray-600">Disponibles</div>
          </CardContent>
        </Card>
        
        <Card className="text-center border-l-4 border-red-400">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{menuStats.unavailable}</div>
            <div className="text-sm text-gray-600">No Disponibles</div>
          </CardContent>
        </Card>
        
        <Card className="text-center border-l-4 border-yellow-400">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{menuStats.specials}</div>
            <div className="text-sm text-gray-600">Especiales</div>
          </CardContent>
        </Card>
        
        <Card className="text-center bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-4">
            <DollarSign className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-600">
              {CURRENCY} {menuStats.avgPrice.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Precio Promedio</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar platos..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>
          
          {(searchTerm || categoryFilter || statusFilter) && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>Mostrando {filteredDishes.length} de {menuDishes.length} platos</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setStatusFilter('');
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dishes Display */}
      {viewMode === 'table' ? (
        <DishTable 
          dishes={filteredDishes}
          onEdit={openEditModal}
          onDelete={handleDeleteDish}
          onToggleAvailability={toggleDishAvailability}
        />
      ) : (
        <DishCards 
          dishes={filteredDishes}
          onEdit={openEditModal}
          onDelete={handleDeleteDish}
          onToggleAvailability={toggleDishAvailability}
        />
      )}

      {/* Create Dish Modal */}
      <CreateDishModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newDish={newDish}
        setNewDish={setNewDish}
        onSubmit={handleCreateDish}
        categoryOptions={categoryOptions.slice(1)}
      />

      {/* Edit Dish Modal */}
      <EditDishModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        selectedDish={selectedDish}
        editDish={editDish}
        setEditDish={setEditDish}
        onSubmit={handleEditDish}
        categoryOptions={categoryOptions.slice(1)}
      />
    </div>
  );
};

// Componente de tabla de platos
const DishTable = ({ dishes, onEdit, onDelete, onToggleAvailability }) => (
  <Card>
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plato</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo Prep.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dishes.map((dish) => (
              <DishTableRow
                key={dish.id}
                dish={dish}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleAvailability={onToggleAvailability}
              />
            ))}
          </tbody>
        </table>
        
        {dishes.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No se encontraron platos</h3>
            <p className="text-gray-500">Intenta cambiar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// Fila de tabla individual
const DishTableRow = ({ dish, onEdit, onDelete, onToggleAvailability }) => {
  const isAvailable = dish.isAvailable !== false;
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <ChefHat className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
              <span>{dish.name}</span>
              {dish.isSpecial && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  ⭐ Especial
                </span>
              )}
            </div>
            {dish.description && (
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {dish.description}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {DISH_CATEGORY_LABELS[dish.category] || dish.category}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-gray-900">
          {CURRENCY} {dish.price}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {dish.preparationTime ? `${dish.preparationTime} min` : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggleAvailability(dish)}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
            isAvailable 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
        >
          {isAvailable ? (
            <>
              <Eye className="h-3 w-3 mr-1" />
              Disponible
            </>
          ) : (
            <>
              <EyeOff className="h-3 w-3 mr-1" />
              No disponible
            </>
          )}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(dish)}
          icon={Edit}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(dish.id, dish.name)}
          icon={Trash2}
          className="text-red-600 hover:text-red-800"
        />
      </td>
    </tr>
  );
};

// Vista de tarjetas
const DishCards = ({ dishes, onEdit, onDelete, onToggleAvailability }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {dishes.map((dish) => (
      <DishCard
        key={dish.id}
        dish={dish}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleAvailability={onToggleAvailability}
      />
    ))}
  </div>
);

const DishCard = ({ dish, onEdit, onDelete, onToggleAvailability }) => {
  const isAvailable = dish.isAvailable !== false;
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-800 flex-1">{dish.name}</h3>
          <div className="text-lg font-bold ml-2 bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
            {CURRENCY} {dish.price}
          </div>
        </div>
        
        {dish.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {dish.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {DISH_CATEGORY_LABELS[dish.category]}
          </span>
          <div className="flex items-center space-x-2">
            {dish.preparationTime && (
              <span className="text-xs text-gray-500">
                🕒 {dish.preparationTime} min
              </span>
            )}
            {dish.isSpecial && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                ⭐ Especial
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onToggleAvailability(dish)}
            className={`text-xs px-2 py-1 rounded-full ${
              isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {isAvailable ? 'Disponible' : 'No disponible'}
          </button>
        </div>
        
        <div className="flex justify-between items-center">
          {dish.ingredients && (
            <span className="text-xs text-gray-500 truncate flex-1 mr-2">
              {dish.ingredients}
            </span>
          )}
          <div className="space-x-2 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onEdit(dish)} icon={Edit} />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(dish.id, dish.name)} 
              icon={Trash2}
              className="text-red-600 hover:text-red-800"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Modal para crear plato
const CreateDishModal = ({ isOpen, onClose, newDish, setNewDish, onSubmit, categoryOptions }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Agregar Nuevo Plato" size="xl">
    <ModalBody>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre del Plato"
            placeholder="Ej: Lomo Saltado"
            value={newDish.name}
            onChange={(e) => setNewDish({...newDish, name: e.target.value})}
            required
          />
          <Input
            label="Precio"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={newDish.price}
            onChange={(e) => setNewDish({...newDish, price: e.target.value})}
            required
          />
        </div>
        
        <Textarea
          label="Descripción"
          placeholder="Descripción del plato..."
          value={newDish.description}
          onChange={(e) => setNewDish({...newDish, description: e.target.value})}
          rows={3}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Categoría"
            value={newDish.category}
            onChange={(e) => setNewDish({...newDish, category: e.target.value})}
            options={categoryOptions}
            required
          />
          <Input
            label="Tiempo de Preparación (min)"
            type="number"
            placeholder="15"
            value={newDish.preparationTime}
            onChange={(e) => setNewDish({...newDish, preparationTime: e.target.value})}
          />
        </div>
        
        <Textarea
          label="Ingredientes Principales"
          placeholder="Lista de ingredientes principales..."
          value={newDish.ingredients}
          onChange={(e) => setNewDish({...newDish, ingredients: e.target.value})}
          rows={2}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="URL de Imagen (Opcional)"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={newDish.imageUrl}
            onChange={(e) => setNewDish({...newDish, imageUrl: e.target.value})}
          />
          <Input
            label="Alérgenos (Opcional)"
            placeholder="Gluten, lácteos, frutos secos..."
            value={newDish.allergens}
            onChange={(e) => setNewDish({...newDish, allergens: e.target.value})}
          />
        </div>
        
        <Textarea
          label="Información Nutricional (Opcional)"
          placeholder="Calorías, proteínas, carbohidratos..."
          value={newDish.nutritionalInfo}
          onChange={(e) => setNewDish({...newDish, nutritionalInfo: e.target.value})}
          rows={2}
        />
        
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newDish.isAvailable}
              onChange={(e) => setNewDish({...newDish, isAvailable: e.target.checked})}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Disponible en el menú</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newDish.isSpecial}
              onChange={(e) => setNewDish({...newDish, isSpecial: e.target.checked})}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Plato Especial del Chef</span>
          </label>
        </div>
      </div>
    </ModalBody>
    <ModalFooter>
      <Button variant="secondary" onClick={onClose}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={onSubmit}>
        Agregar al Menú
      </Button>
    </ModalFooter>
  </Modal>
);

// Modal para editar plato
const EditDishModal = ({ isOpen, onClose, selectedDish, editDish, setEditDish, onSubmit, categoryOptions }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={`Editar: ${selectedDish?.name}`} size="xl">
    {selectedDish && (
      <ModalBody>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre del Plato"
              value={editDish.name || ''}
              onChange={(e) => setEditDish({...editDish, name: e.target.value})}
              required
            />
            <Input
              label="Precio"
              type="number"
              step="0.01"
              value={editDish.price || ''}
              onChange={(e) => setEditDish({...editDish, price: e.target.value})}
              required
            />
          </div>
          
          <Textarea
            label="Descripción"
            value={editDish.description || ''}
            onChange={(e) => setEditDish({...editDish, description: e.target.value})}
            rows={3}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Categoría"
              value={editDish.category || selectedDish.category}
              onChange={(e) => setEditDish({...editDish, category: e.target.value})}
              options={categoryOptions}
              required
            />
            <Input
              label="Tiempo de Preparación (min)"
              type="number"
              value={editDish.preparationTime || ''}
              onChange={(e) => setEditDish({...editDish, preparationTime: e.target.value})}
            />
          </div>
          
          <Textarea
            label="Ingredientes Principales"
            value={editDish.ingredients || ''}
            onChange={(e) => setEditDish({...editDish, ingredients: e.target.value})}
            rows={2}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="URL de Imagen"
              value={editDish.imageUrl || ''}
              onChange={(e) => setEditDish({...editDish, imageUrl: e.target.value})}
            />
            <Input
              label="Alérgenos"
              value={editDish.allergens || ''}
              onChange={(e) => setEditDish({...editDish, allergens: e.target.value})}
            />
          </div>
          
          <Textarea
            label="Información Nutricional"
            value={editDish.nutritionalInfo || ''}
            onChange={(e) => setEditDish({...editDish, nutritionalInfo: e.target.value})}
            rows={2}
          />
          
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editDish.isAvailable !== false}
                onChange={(e) => setEditDish({...editDish, isAvailable: e.target.checked})}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Disponible en el menú</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editDish.isSpecial || false}
                onChange={(e) => setEditDish({...editDish, isSpecial: e.target.checked})}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Plato Especial del Chef</span>
            </label>
          </div>
        </div>
      </ModalBody>
    )}
    <ModalFooter>
      <Button variant="secondary" onClick={onClose}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={onSubmit}>
        Guardar Cambios
      </Button>
    </ModalFooter>
  </Modal>
);

export default MenuManagement;