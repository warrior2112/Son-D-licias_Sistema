// Servicio para gestión de categorías con Supabase

import { supabase } from './supabase';

export const categoryService = {
  // Obtener todas las categorías
  async getAllCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener categorías por tipo
  async getCategoriesByType(type) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener categorías por tipo:', error);
      return { success: false, error: error.message };
    }
  },

  // Crear nueva categoría
  async createCategory(categoryData) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description || null,
          type: categoryData.type || 'inventory',
          slug: categoryData.slug || categoryData.name.toLowerCase()
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/[ñ]/g, 'n')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, ''),
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al crear categoría:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar categoría
  async updateCategory(categoryId, updates) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      return { success: false, error: error.message };
    }
  },

  // Eliminar categoría (soft delete)
  async deleteCategory(categoryId) {
    try {
      // Verificar si hay productos asociados a esta categoría
      const { data: productsCount, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .eq('category_id', categoryId)
        .eq('is_active', true);

      if (countError) throw countError;

      if (productsCount && productsCount.length > 0) {
        return { 
          success: false, 
          error: `No se puede eliminar la categoría porque tiene ${productsCount.length} productos asociados. Elimine o reasigne los productos primero.` 
        };
      }

      const { data, error } = await supabase
        .from('categories')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener categoría por ID
  async getCategoryById(categoryId) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      return { success: false, error: error.message };
    }
  },

  // Verificar si el slug está disponible
  async isSlugAvailable(slug, excludeId = null) {
    try {
      let query = supabase
        .from('categories')
        .select('id')
        .eq('slug', slug);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, available: data.length === 0 };
    } catch (error) {
      console.error('Error al verificar slug:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener productos por categoría
  async getProductsByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      return { success: false, error: error.message };
    }
  }
};

export default categoryService;