// Hook para gestión de inventario en Son D'licias

import { useState, useEffect, useCallback } from 'react';
import { STOCK_ALERTS } from '../utils/constants';

export const useInventory = (initialInventory = []) => {
  const [inventory, setInventory] = useState(initialInventory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Actualizar stock de producto
  const updateStock = useCallback((productId, newStock) => {
    try {
      setInventory(prevInventory => 
        prevInventory.map(item => 
          item.id === productId 
            ? { ...item, stock: newStock, updatedAt: new Date().toISOString() }
            : item
        )
      );
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Reducir stock (para ventas)
  const reduceStock = useCallback((productId, quantity) => {
    try {
      const product = inventory.find(item => item.id === productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      
      if (product.stock < quantity) {
        throw new Error('Stock insuficiente');
      }

      const newStock = product.stock - quantity;
      return updateStock(productId, newStock);
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [inventory, updateStock]);

  // Aumentar stock (para reposición)
  const increaseStock = useCallback((productId, quantity) => {
    try {
      const product = inventory.find(item => item.id === productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const newStock = product.stock + quantity;
      return updateStock(productId, newStock);
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [inventory, updateStock]);

  // Obtener productos con stock bajo
  const getLowStockProducts = useCallback(() => {
    return inventory.filter(item => 
      item.stock <= (item.minStock || STOCK_ALERTS.LOW_STOCK)
    );
  }, [inventory]);

  // Obtener productos sin stock
  const getOutOfStockProducts = useCallback(() => {
    return inventory.filter(item => item.stock === 0);
  }, [inventory]);

  // Obtener productos por categoría
  const getProductsByCategory = useCallback((category) => {
    return inventory.filter(item => item.category === category);
  }, [inventory]);

  // Buscar productos
  const searchProducts = useCallback((searchTerm) => {
    if (!searchTerm) return inventory;
    
    return inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory]);

  // Obtener estadísticas de inventario
  const getInventoryStats = useCallback(() => {
    const totalProducts = inventory.length;
    const lowStock = getLowStockProducts().length;
    const outOfStock = getOutOfStockProducts().length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.stock), 0);

    return {
      totalProducts,
      lowStock,
      outOfStock,
      totalValue,
      stockStatus: {
        healthy: totalProducts - lowStock - outOfStock,
        warning: lowStock,
        critical: outOfStock
      }
    };
  }, [inventory, getLowStockProducts, getOutOfStockProducts]);

  // Validar disponibilidad para orden
  const validateOrderAvailability = useCallback((orderItems) => {
    const unavailableItems = [];
    
    orderItems.forEach(orderItem => {
      const product = inventory.find(item => item.id === orderItem.id);
      if (!product || product.stock < orderItem.quantity) {
        unavailableItems.push({
          ...orderItem,
          availableStock: product ? product.stock : 0
        });
      }
    });

    return {
      isAvailable: unavailableItems.length === 0,
      unavailableItems
    };
  }, [inventory]);

  // Procesar orden (reducir stock de múltiples productos)
  const processOrder = useCallback((orderItems) => {
    try {
      const validation = validateOrderAvailability(orderItems);
      if (!validation.isAvailable) {
        throw new Error('Algunos productos no tienen stock suficiente');
      }

      // Reducir stock de todos los productos
      const updatedInventory = inventory.map(item => {
        const orderItem = orderItems.find(oi => oi.id === item.id);
        if (orderItem) {
          return {
            ...item,
            stock: item.stock - orderItem.quantity,
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      });

      setInventory(updatedInventory);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [inventory, validateOrderAvailability]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    inventory,
    loading,
    error,
    updateStock,
    reduceStock,
    increaseStock,
    getLowStockProducts,
    getOutOfStockProducts,
    getProductsByCategory,
    searchProducts,
    getInventoryStats,
    validateOrderAvailability,
    processOrder,
    clearError,
    setInventory
  };
};

export default useInventory;