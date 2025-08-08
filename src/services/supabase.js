// Configuración de Supabase para Son D'licias

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('Make sure to set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env.local file');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Funciones helper para operaciones comunes
export const supabaseHelpers = {
  // Test de conexión
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      return { success: true, message: 'Conexión exitosa con Supabase' };
    } catch (error) {
      console.error('Error de conexión con Supabase:', error);
      return { success: false, message: 'Error de conexión', error };
    }
  },

  // Manejo de errores
  handleError(error, operation = 'operación') {
    console.error(`Error en ${operation}:`, error);
    return {
      success: false,
      error: error.message || `Error en ${operation}`,
      details: error
    };
  },

  // Formatear respuesta exitosa
  formatSuccess(data, message = 'Operación exitosa') {
    return {
      success: true,
      data,
      message
    };
  }
};

// Configuración para tiempo real (si necesitas actualizaciones en vivo)
export const realtimeConfig = {
  // Suscribirse a cambios en órdenes
  subscribeToOrders(callback) {
    return supabase
      .channel('orders_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        callback
      )
      .subscribe();
  },

  // Suscribirse a cambios en inventario
  subscribeToInventory(callback) {
    return supabase
      .channel('products_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        callback
      )
      .subscribe();
  },

  // Desuscribirse de un canal
  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
};

export default supabase;