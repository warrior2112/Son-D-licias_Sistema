// Servicio para gestión de inventario con Supabase

import { supabase } from './supabase';
import { INVENTORY_MOVEMENT_TYPES } from '../utils/constants';

export const inventoryService = {
  // Obtener todos los productos
  async getAllProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener productos:', error);
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
  },

  // Crear nuevo producto
  async createProduct(productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          price: productData.price,
          category_id: productData.categoryId,
          stock: productData.stock || 0,
          min_stock: productData.minStock || 5,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al crear producto:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar producto
  async updateProduct(productId, updates) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar stock
  async updateStock(productId, newStock, reason = 'Ajuste manual') {
    try {
      // Obtener stock actual
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      const oldStock = product.stock;
      const difference = newStock - oldStock;

      // Actualizar stock
      const { data, error } = await supabase
        .from('products')
        .update({ 
          stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;

      // Registrar movimiento de inventario
      await this.recordInventoryMovement(
        productId,
        difference > 0 ? INVENTORY_MOVEMENT_TYPES.IN : INVENTORY_MOVEMENT_TYPES.OUT,
        Math.abs(difference),
        reason
      );

      return { success: true, data };
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      return { success: false, error: error.message };
    }
  },

  // Registrar movimiento de inventario
  async recordInventoryMovement(productId, movementType, quantity, reason) {
    try {
      const { data, error } = await supabase
        .from('inventory_movements')
        .insert({
          product_id: productId,
          movement_type: movementType,
          quantity: quantity,
          reason: reason
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener productos con stock bajo
  async getLowStockProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .filter('stock', 'lte', 'min_stock')
        .eq('is_active', true)
        .order('stock');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener productos con stock bajo:', error);
      return { success: false, error: error.message };
    }
  },

  // Procesar reducción de stock por venta
  async processOrderStock(orderItems) {
    try {
      const movements = [];

      for (const item of orderItems) {
        // Reducir stock
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (productError) throw productError;

        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${item.name}`);
        }

        const newStock = product.stock - item.quantity;

        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            stock: newStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.product_id);

        if (updateError) throw updateError;

        // Registrar movimiento
        movements.push({
          product_id: item.product_id,
          movement_type: INVENTORY_MOVEMENT_TYPES.OUT,
          quantity: item.quantity,
          reason: `Venta - Orden #${item.order_id || 'N/A'}`
        });
      }

      // Registrar todos los movimientos
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert(movements);

      if (movementError) throw movementError;

      return { success: true };
    } catch (error) {
      console.error('Error al procesar stock de orden:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener historial de movimientos
  async getMovementHistory(productId, limit = 50) {
    try {
      let query = supabase
        .from('inventory_movements')
        .select(`
          *,
          products (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener historial:', error);
      return { success: false, error: error.message };
    }
  }
};

export default inventoryService;