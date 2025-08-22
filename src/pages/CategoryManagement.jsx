// Gestión de categorías para inventario y menú

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag, Package, Menu } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import useCategories from '../hooks/useCategories';

const CategoryManagement = ({ currentUser }) => {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError
  } = useCategories();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'inventory', 'menu'
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    type: 'inventory'
  });

  const [editCategory, setEditCategory] = useState({});

  // Filtrar categorías según el tipo seleccionado
  const filteredCategories = () => {
    switch (filterType) {
      case 'inventory':
        return categories.filter(cat => cat.type === 'inventory');
      case 'menu':
        return categories.filter(cat => cat.type === 'menu');
      default:
        return categories;
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('El nombre de la categoría es obligatorio');
      return;
    }

    const result = await createCategory({
      name: newCategory.name,
      description: newCategory.description,
      type: newCategory.type
    });

    if (result.success) {
      setNewCategory({ name: '', description: '', type: 'inventory' });
      setShowCreateModal(false);
      alert('Categoría creada exitosamente');
    } else {
      alert('Error: ' + result.error);
    }
  };

  const handleEditCategory = async () => {
    if (!editCategory.name?.trim()) {
      alert('El nombre de la categoría es obligatorio');
      return;
    }

    const result = await updateCategory(selectedCategory.id, {
      name: editCategory.name,
      description: editCategory.description,
      type: editCategory.type
    });

    if (result.success) {
      setShowEditModal(false);
      setSelectedCategory(null);
      alert('Categoría actualizada exitosamente');
    } else {
      alert('Error: ' + result.error);
    }
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setEditCategory({
      name: category.name,
      description: category.description || '',
      type: category.type
    });
    setShowEditModal(true);
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${categoryName}"? Esta acción no se puede deshacer.`)) {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        alert('Categoría eliminada exitosamente');
      } else {
        alert('Error: ' + result.error);
      }
    }
  };


  if (loading && categories.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Categorías</h2>
          <p className="text-gray-600">Administra las categorías del inventario y menú digital</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} variant="primary" icon={Plus}>
          Agregar Categoría
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">×</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select
            label="Filtrar por tipo"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: 'all', label: 'Todas las categorías' },
              { value: 'inventory', label: 'Solo Inventario' },
              { value: 'menu', label: 'Solo Menú' }
            ]}
          />
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-blue-500" />
            <span>{categories.filter(cat => cat.type === 'inventory').length} Inventario</span>
          </div>
          <div className="flex items-center space-x-2">
            <Menu className="h-4 w-4 text-green-500" />
            <span>{categories.filter(cat => cat.type === 'menu').length} Menú</span>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories().map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={openEditModal}
            onDelete={handleDeleteCategory}
          />
        ))}
        
        {filteredCategories().length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-medium text-gray-600 mb-1">No hay categorías</h3>
            <p className="text-sm">Crea tu primera categoría para organizar tus productos</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Agregar Nueva Categoría"
        size="lg"
      >
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre de la Categoría"
                placeholder="Ej: Bebidas, Carnes, etc."
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                required
              />
              <Select
                label="Tipo"
                value={newCategory.type}
                onChange={(e) => setNewCategory({...newCategory, type: e.target.value})}
                options={[
                  { value: 'inventory', label: 'Inventario' },
                  { value: 'menu', label: 'Menú Digital' }
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (Opcional)
              </label>
              <textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                placeholder="Descripción de la categoría"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateCategory}>
            Crear Categoría
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Editar Categoría: ${selectedCategory?.name}`}
        size="lg"
      >
        {selectedCategory && (
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombre de la Categoría"
                  value={editCategory.name || ''}
                  onChange={(e) => setEditCategory({...editCategory, name: e.target.value})}
                  required
                />
                <Select
                  label="Tipo"
                  value={editCategory.type || 'inventory'}
                  onChange={(e) => setEditCategory({...editCategory, type: e.target.value})}
                  options={[
                    { value: 'inventory', label: 'Inventario' },
                    { value: 'menu', label: 'Menú Digital' }
                  ]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={editCategory.description || ''}
                  onChange={(e) => setEditCategory({...editCategory, description: e.target.value})}
                  placeholder="Descripción de la categoría"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

            </div>
          </ModalBody>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleEditCategory}>
            Guardar Cambios
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

// Componente de tarjeta de categoría
const CategoryCard = ({ category, onEdit, onDelete }) => (
  <Card className="hover:shadow-lg transition-all duration-200 relative">
    <CardContent className="p-4">
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-white ${
          category.type === 'inventory' ? 'bg-blue-500' : 'bg-green-500'
        }`}>
          {category.type === 'inventory' ? (
            <Package className="h-8 w-8" />
          ) : (
            <Menu className="h-8 w-8" />
          )}
        </div>
        
        <h3 className="font-semibold text-gray-800 mb-1">{category.name}</h3>
        
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            category.type === 'inventory' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {category.type === 'inventory' ? 'Inventario' : 'Menú'}
          </span>
        </div>
        
        {category.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {category.description}
          </p>
        )}
        
        <div className="flex justify-center space-x-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
            icon={Edit}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category.id, category.name)}
            icon={Trash2}
            className="text-red-600 hover:text-red-800"
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default CategoryManagement;