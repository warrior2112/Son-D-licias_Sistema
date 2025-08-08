// Servicio para gestión de mesas con Supabase

import { supabase } from './supabase';

export const tableService = {
  // Obtener todas las mesas
  async getAllTables() {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('is_active', true)
        .order('table_number');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener mesas:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener mesa por ID
  async getTableById(tableId) {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('id', tableId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener mesa:', error);
      return { success: false, error: error.message };
    }
  },

  // Crear nueva mesa
  async createTable(tableData) {
    try {
      const { data, error } = await supabase
        .from('tables')
        .insert({
          table_number: tableData.tableNumber,
          capacity: tableData.capacity,
          location: tableData.location,
          status: 'available'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al crear mesa:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar mesa
  async updateTable(tableId, updates) {
    try {
      const { data, error } = await supabase
        .from('tables')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', tableId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al actualizar mesa:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar estado de mesa
  async updateTableStatus(tableId, status) {
    try {
      const { data, error } = await supabase
        .from('tables')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', tableId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al actualizar estado de mesa:', error);
      return { success: false, error: error.message };
    }
  },

  // Eliminar mesa (soft delete)
  async deleteTable(tableId) {
    try {
      const { data, error } = await supabase
        .from('tables')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', tableId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al eliminar mesa:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener mesas disponibles
  async getAvailableTables() {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('status', 'available')
        .eq('is_active', true)
        .order('table_number');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener mesas disponibles:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener mesas ocupadas
  async getOccupiedTables() {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('status', 'occupied')
        .eq('is_active', true)
        .order('table_number');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener mesas ocupadas:', error);
      return { success: false, error: error.message };
    }
  },

  // Reservar mesa
  async reserveTable(tableId, customerInfo) {
    try {
      const { data, error } = await supabase
        .from('tables')
        .update({ 
          status: 'reserved',
          updated_at: new Date().toISOString()
        })
        .eq('id', tableId)
        .select()
        .single();

      if (error) throw error;

      // Opcional: crear registro de reserva en otra tabla
      // const reservationData = {
      //   table_id: tableId,
      //   customer_name: customerInfo.name,
      //   customer_phone: customerInfo.phone,
      //   reservation_time: customerInfo.time
      // };

      return { success: true, data };
    } catch (error) {
      console.error('Error al reservar mesa:', error);
      return { success: false, error: error.message };
    }
  },

  // Liberar mesa (cambiar a disponible)
  async releaseTable(tableId) {
    try {
      const { data, error } = await supabase
        .from('tables')
        .update({ 
          status: 'available',
          updated_at: new Date().toISOString()
        })
        .eq('id', tableId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al liberar mesa:', error);
      return { success: false, error: error.message };
    }
  },

  // Ocupar mesa
  async occupyTable(tableId) {
    try {
      const { data, error } = await supabase
        .from('tables')
        .update({ 
          status: 'occupied',
          updated_at: new Date().toISOString()
        })
        .eq('id', tableId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al ocupar mesa:', error);
      return { success: false, error: error.message };
    }
  },

  // Poner mesa en mantenimiento
  async setTableMaintenance(tableId) {
    try {
      const { data, error } = await supabase
        .from('tables')
        .update({ 
          status: 'maintenance',
          updated_at: new Date().toISOString()
        })
        .eq('id', tableId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al poner mesa en mantenimiento:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener estadísticas de mesas
  async getTableStats() {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('status')
        .eq('is_active', true);

      if (error) throw error;

      const stats = {
        total: data.length,
        available: data.filter(t => t.status === 'available').length,
        occupied: data.filter(t => t.status === 'occupied').length,
        reserved: data.filter(t => t.status === 'reserved').length,
        maintenance: data.filter(t => t.status === 'maintenance').length
      };

      stats.occupancyRate = stats.total > 0 ? 
        ((stats.occupied + stats.reserved) / stats.total * 100).toFixed(1) : 0;

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error al obtener estadísticas de mesas:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener historial de mesas (opcional)
  async getTableHistory(tableId, limit = 50) {
    try {
      // Esta funcionalidad requeriría una tabla adicional de historial
      // Por ahora retornamos un array vacío
      return { success: true, data: [] };
    } catch (error) {
      console.error('Error al obtener historial de mesa:', error);
      return { success: false, error: error.message };
    }
  },

  // Buscar mesas por criterios
  async searchTables(criteria) {
    try {
      let query = supabase
        .from('tables')
        .select('*')
        .eq('is_active', true);

      if (criteria.status) {
        query = query.eq('status', criteria.status);
      }
      if (criteria.location) {
        query = query.eq('location', criteria.location);
      }
      if (criteria.capacity) {
        query = query.gte('capacity', criteria.capacity);
      }

      const { data, error } = await query.order('table_number');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al buscar mesas:', error);
      return { success: false, error: error.message };
    }
  },

  // Verificar disponibilidad de mesa
  async checkTableAvailability(tableId) {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('status, is_active')
        .eq('id', tableId)
        .single();

      if (error) throw error;

      const isAvailable = data.is_active && data.status === 'available';
      return { success: true, data: { available: isAvailable, status: data.status } };
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener mesas con órdenes activas
  async getTablesWithActiveOrders() {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select(`
          *,
          orders!inner(
            id,
            order_number,
            total,
            status,
            created_at
          )
        `)
        .eq('is_active', true)
        .in('orders.status', ['preparando', 'listo'])
        .order('table_number');

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener mesas con órdenes activas:', error);
      return { success: false, error: error.message };
    }
  }
};

export default tableService;