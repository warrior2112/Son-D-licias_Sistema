// Hook para gestión de productos con Supabase - Versión final corregida

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar productos
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading products:', error);
        throw error;
      }

      // Transformar datos para mantener compatibilidad
      const transformedProducts = data?.map(product => ({
        ...product,
        category: product.categories?.slug || 'sin-categoria',
        // Mapear campos con nombres diferentes
        minStock: product.min_stock,
        unitCost: product.unit_cost,
        preparationTime: product.preparation_time,
        isAvailable: product.is_available,
        isSpecial: product.is_special,
        isIngredient: product.is_ingredient,
        isDish: product.is_dish,
        expirationDate: product.expiration_date,
        imageUrl: product.image_url,
        nutritionalInfo: product.nutritional_info
      })) || [];

      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar categorías
  const loadCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading categories:', error);
        throw error;
      }
      
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err.message);
    }
  }, []);

  // Crear producto
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      
      // Determinar category_id
      let categoryId;
      if (productData.category_id) {
        // Si ya viene category_id, usarlo directamente
        categoryId = parseInt(productData.category_id);
      } else if (productData.category) {
        // Si viene category (slug), buscarlo
        const category = categories.find(cat => cat.slug === productData.category);
        if (!category) {
          const availableCategories = categories.map(c => `${c.name} (${c.slug})`).join(', ');
          throw new Error(`Categoría "${productData.category}" no encontrada. Categorías disponibles: ${availableCategories}`);
        }
        categoryId = category.id;
      } else {
        throw new Error('Debe especificar una categoría (category_id o category)');
      }

      // Preparar datos del producto (solo campos que existen en la tabla)
      const productToInsert = {
        name: productData.name,
        description: productData.description || null,
        price: parseFloat(productData.price) || 0,
        category_id: categoryId,
        stock: parseInt(productData.stock) || 0,
        min_stock: parseInt(productData.minStock) || 5,
        ingredients: productData.ingredients || null,
        allergens: productData.allergens || null,
        preparation_time: parseInt(productData.preparationTime) || null,
        is_available: productData.isAvailable !== false,
        is_special: productData.isSpecial || false,
        is_ingredient: productData.isIngredient || false,
        is_dish: productData.isDish || false,
        unit: productData.unit || null,
        unit_cost: parseFloat(productData.unitCost) || 0,
        supplier: productData.supplier || null,
        expiration_date: productData.expirationDate || null,
        image_url: productData.imageUrl || null,
        nutritional_info: productData.nutritionalInfo || null
      };

      console.log('Datos a insertar:', productToInsert); // Debug

      const { data, error } = await supabase
        .from('products')
        .insert(productToInsert)
        .select('*')
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }
      
      await loadProducts();
      return { success: true, data };
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [categories, loadProducts]);

  // Actualizar producto
  const updateProduct = useCallback(async (productId, updates) => {
    try {
      const updateData = {};
      
      // Mapear campos del frontend a la base de datos
      Object.keys(updates).forEach(key => {
        switch (key) {
          case 'category':
            // Buscar category_id por slug
            const category = categories.find(cat => cat.slug === updates[key]);
            if (category) {
              updateData.category_id = category.id;
            }
            break;
          case 'category_id':
            // Usar directamente el category_id
            updateData.category_id = parseInt(updates[key]);
            break;
          case 'minStock':
            updateData.min_stock = parseInt(updates[key]);
            break;
          case 'unitCost':
            updateData.unit_cost = parseFloat(updates[key]);
            break;
          case 'preparationTime':
            updateData.preparation_time = parseInt(updates[key]) || null;
            break;
          case 'isAvailable':
            updateData.is_available = updates[key];
            break;
          case 'isSpecial':
            updateData.is_special = updates[key];
            break;
          case 'isIngredient':
            updateData.is_ingredient = updates[key];
            break;
          case 'isDish':
            updateData.is_dish = updates[key];
            break;
          case 'expirationDate':
            updateData.expiration_date = updates[key];
            break;
          case 'imageUrl':
            updateData.image_url = updates[key];
            break;
          case 'nutritionalInfo':
            updateData.nutritional_info = updates[key];
            break;
          case 'updatedAt':
          case 'createdAt':
            // Ignore timestamp fields - they should be handled by database triggers or not used
            break;
          default:
            updateData[key] = updates[key];
        }
      });

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .select('*')
        .single();

      if (error) throw error;
      
      await loadProducts();
      return { success: true, data };
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [categories, loadProducts]);

  // Eliminar producto (soft delete)
  const deleteProduct = useCallback(async (productId) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', productId);

      if (error) throw error;
      
      await loadProducts();
      return { success: true };
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [loadProducts]);

  // Actualizar stock
  const updateStock = useCallback(async (productId, newStock, reason = 'Ajuste manual') => {
    try {
      // Actualizar stock del producto
      const { error: stockError } = await supabase
        .from('products')
        .update({ 
          stock: newStock
        })
        .eq('id', productId);

      if (stockError) throw stockError;

      // Registrar movimiento de inventario si la tabla existe
      const product = products.find(p => p.id === productId);
      if (product) {
        const difference = newStock - product.stock;
        if (difference !== 0) {
          try {
            await supabase
              .from('inventory_movements')
              .insert({
                product_id: productId,
                movement_type: difference > 0 ? 'in' : 'out',
                quantity: Math.abs(difference),
                reason
              });
          } catch (movementError) {
            console.warn('No se pudo registrar el movimiento de inventario:', movementError);
            // No bloquear la actualización de stock si falla el movimiento
          }
        }
      }

      await loadProducts();
      return { success: true };
    } catch (err) {
      console.error('Error updating stock:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [products, loadProducts]);

  // Obtener productos por categoría
  const getProductsByCategory = useCallback((categorySlug) => {
    return products.filter(product => product.category === categorySlug);
  }, [products]);

  // Obtener productos con stock bajo
  const getLowStockProducts = useCallback(() => {
    return products.filter(product => product.stock <= (product.minStock || 5));
  }, [products]);

  // Cargar datos al montar
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      loadProducts();
    }
  }, [categories, loadProducts]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    products,
    categories,
    loading,
    error,
    loadProducts,
    loadCategories,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    getProductsByCategory,
    getLowStockProducts,
    clearError
  };
};

export default useProducts;
