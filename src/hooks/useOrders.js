// Hook para gestión de órdenes con Supabase

import { useState, useEffect, useCallback } from 'react';
import orderService from '../services/orderService';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar órdenes
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await orderService.getAllOrders();
      if (result.success) {
        // Transformar datos para compatibilidad con la UI existente
        const transformedOrders = result.data?.map(order => ({
          id: order.id,
          orderNumber: order.order_number,
          tableId: order.table_id,
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          subtotal: parseFloat(order.subtotal),
          tax: parseFloat(order.tax || 0),
          total: parseFloat(order.total),
          status: order.status,
          paymentMethod: order.payment_method,
          paymentStatus: order.payment_status,
          notes: order.notes,
          createdBy: order.created_by,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          items: order.order_items?.map(item => ({
            id: item.product_id,
            name: item.products?.name || 'Producto desconocido',
            price: parseFloat(item.unit_price),
            quantity: item.quantity,
            subtotal: parseFloat(item.subtotal),
            notes: item.notes
          })) || []
        })) || [];
        
        setOrders(transformedOrders);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear orden
  const createOrder = useCallback(async (orderData) => {
    try {
      setLoading(true);
      
      // Transformar datos para la API
      const apiOrderData = {
        tableId: orderData.tableId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentStatus || 'pendiente',
        notes: orderData.notes,
        createdBy: orderData.createdBy,
        items: orderData.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      const result = await orderService.createOrder(apiOrderData);
      
      if (result.success) {
        await loadOrders(); // Recargar órdenes
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadOrders]);

  // Actualizar estado de orden
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      const result = await orderService.updateOrderStatus(orderId, newStatus);
      
      if (result.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
            : order
        ));
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Actualizar método de pago
  const updatePayment = useCallback(async (orderId, paymentMethod, paymentStatus = 'pagado') => {
    try {
      // Este método necesitaría ser implementado en orderService
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, paymentMethod, paymentStatus }
          : order
      ));
      return { success: true };
    } catch (err) {
      console.error('Error updating payment:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Eliminar orden
  const deleteOrder = useCallback(async (orderId) => {
    try {
      const result = await orderService.deleteOrder(orderId);
      
      if (result.success) {
        setOrders(prev => prev.filter(order => order.id !== orderId));
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Obtener órdenes por estado
  const getOrdersByStatus = useCallback((status) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Obtener estadísticas
  const getOrderStats = useCallback(() => {
    const total = orders.length;
    const preparando = orders.filter(o => o.status === 'preparando').length;
    const listo = orders.filter(o => o.status === 'listo').length;
    const completado = orders.filter(o => o.status === 'completado').length;
    const cancelado = orders.filter(o => o.status === 'cancelado').length;
    const totalSales = orders
      .filter(o => o.status === 'completado')
      .reduce((sum, order) => sum + parseFloat(order.total), 0);

    return {
      total,
      preparando,
      listo,
      completado,
      cancelado,
      totalSales
    };
  }, [orders]);

  // Cargar órdenes al montar
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    orders,
    loading,
    error,
    loadOrders,
    createOrder,
    updateOrderStatus,
    updatePayment,
    deleteOrder,
    getOrdersByStatus,
    getOrderStats,
    clearError
  };
};

export default useOrders;