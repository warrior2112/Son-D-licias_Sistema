// Servicio para gestión de órdenes con Supabase - Corregido

import { supabase } from './supabase';
import { ORDER_STATUS } from '../utils/constants';

export const orderService = {
  // Obtener todas las órdenes
  async getAllOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              price
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener órdenes por estado
  async getOrdersByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              price
            )
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener órdenes por estado:', error);
      return { success: false, error: error.message };
    }
  },

  // Crear nueva orden
  async createOrder(orderData) {
    try {
      console.log('Datos de orden recibidos:', orderData); // Debug

      // Validar que tenemos los datos necesarios
      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('La orden debe tener al menos un producto');
      }

      // Asegurar que los valores numéricos estén definidos
      const subtotal = parseFloat(orderData.subtotal) || 0;
      const tax = parseFloat(orderData.tax) || 0;
      const total = parseFloat(orderData.total) || subtotal + tax;

      console.log('Valores calculados:', { subtotal, tax, total }); // Debug

      // Crear la orden principal
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: orderData.tableId || null,
          customer_name: orderData.customerName || null,
          customer_phone: orderData.customerPhone || null,
          subtotal: subtotal,
          tax: tax,
          total: total,
          status: ORDER_STATUS.PREPARANDO,
          payment_method: null, // Sin método de pago al crear
          payment_status: 'pendiente',
          notes: orderData.notes || null,
          created_by: null // Cambiar a null por ahora
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creando orden:', orderError);
        throw orderError;
      }

      console.log('Orden creada:', order); // Debug

      // Crear los items de la orden
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: parseFloat(item.price),
        subtotal: parseFloat(item.price) * item.quantity,
        notes: item.notes || null
      }));

      console.log('Items a insertar:', orderItems); // Debug

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creando items:', itemsError);
        // Si falla insertar items, eliminar la orden
        await supabase.from('orders').delete().eq('id', order.id);
        throw itemsError;
      }

      return { success: true, data: order };
    } catch (error) {
      console.error('Error al crear orden:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar orden completa
  async updateOrder(orderId, orderData) {
    try {
      // Asegurar que los valores numéricos estén definidos
      const subtotal = parseFloat(orderData.subtotal) || 0;
      const tax = parseFloat(orderData.tax) || 0;
      const total = parseFloat(orderData.total) || subtotal + tax;

      // Actualizar la orden principal
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({
          customer_name: orderData.customerName || null,
          customer_phone: orderData.customerPhone || null,
          subtotal: subtotal,
          tax: tax,
          total: total,
          notes: orderData.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (orderError) throw orderError;

      // Eliminar items existentes
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (deleteError) throw deleteError;

      // Crear los nuevos items
      if (orderData.items && orderData.items.length > 0) {
        const orderItems = orderData.items.map(item => ({
          order_id: orderId,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: parseFloat(item.price),
          subtotal: parseFloat(item.price) * item.quantity,
          notes: item.notes || null
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      return { success: true, data: order };
    } catch (error) {
      console.error('Error al actualizar orden:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar estado de orden
  async updateOrderStatus(orderId, newStatus) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al actualizar estado de orden:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar método de pago (para cuando se complete la orden)
  async updatePayment(orderId, paymentMethod, paymentStatus = 'pagado') {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al actualizar pago:', error);
      return { success: false, error: error.message };
    }
  },

  // Completar orden con pago
  async completeOrderWithPayment(orderId, paymentMethod) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: ORDER_STATUS.COMPLETADO,
          payment_method: paymentMethod,
          payment_status: 'pagado',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al completar orden:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener orden por ID
  async getOrderById(orderId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              price
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener orden:', error);
      return { success: false, error: error.message };
    }
  },

  // Eliminar orden
  async deleteOrder(orderId) {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar orden:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener estadísticas de órdenes
  async getOrderStats(startDate, endDate) {
    try {
      let query = supabase
        .from('orders')
        .select('id, total, status, created_at');

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      const stats = {
        totalOrders: data.length,
        totalSales: data.reduce((sum, order) => sum + parseFloat(order.total), 0),
        ordersByStatus: {
          preparando: data.filter(o => o.status === ORDER_STATUS.PREPARANDO).length,
          listo: data.filter(o => o.status === ORDER_STATUS.LISTO).length,
          completado: data.filter(o => o.status === ORDER_STATUS.COMPLETADO).length,
          cancelado: data.filter(o => o.status === ORDER_STATUS.CANCELADO).length
        }
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { success: false, error: error.message };
    }
  }
};

export default orderService;