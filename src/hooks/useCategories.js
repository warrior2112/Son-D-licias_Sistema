// Hook para gestión de categorías

import { useState, useEffect, useCallback } from 'react';
// Usar el servicio real de Supabase
import { categoryService } from '../services/categoryService';

export const useCategories = (type = null) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar categorías
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = type 
        ? await categoryService.getCategoriesByType(type)
        : await categoryService.getAllCategories();
      
      if (result.success) {
        setCategories(result.data || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [type]);

  // Crear categoría
  const createCategory = useCallback(async (categoryData) => {
    try {
      setLoading(true);
      const result = await categoryService.createCategory(categoryData);
      
      if (result.success) {
        await loadCategories(); // Recargar lista
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al crear categoría';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadCategories]);

  // Actualizar categoría
  const updateCategory = useCallback(async (categoryId, updates) => {
    try {
      setLoading(true);
      const result = await categoryService.updateCategory(categoryId, updates);
      
      if (result.success) {
        setCategories(prev => prev.map(category => 
          category.id === categoryId ? { ...category, ...updates } : category
        ));
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al actualizar categoría';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar categoría
  const deleteCategory = useCallback(async (categoryId) => {
    try {
      setLoading(true);
      const result = await categoryService.deleteCategory(categoryId);
      
      if (result.success) {
        setCategories(prev => prev.filter(category => category.id !== categoryId));
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al eliminar categoría';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener categoría por ID
  const getCategoryById = useCallback((categoryId) => {
    return categories.find(category => category.id === categoryId);
  }, [categories]);

  // Verificar si el slug está disponible
  const isSlugAvailable = useCallback(async (slug, excludeId = null) => {
    try {
      const result = await categoryService.isSlugAvailable(slug, excludeId);
      return result;
    } catch (err) {
      console.error('Error checking slug availability:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Obtener productos por categoría
  const getProductsByCategory = useCallback(async (categoryId) => {
    try {
      const result = await categoryService.getProductsByCategory(categoryId);
      return result;
    } catch (err) {
      console.error('Error getting products by category:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Filtrar categorías por tipo
  const getInventoryCategories = useCallback(() => {
    return categories.filter(category => category.type === 'inventory');
  }, [categories]);

  const getMenuCategories = useCallback(() => {
    return categories.filter(category => category.type === 'menu');
  }, [categories]);

  return {
    categories,
    loading,
    error,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    isSlugAvailable,
    getProductsByCategory,
    getInventoryCategories,
    getMenuCategories,
    clearError
  };
};

export default useCategories;