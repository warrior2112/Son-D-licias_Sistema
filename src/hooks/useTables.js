// Hook para gestión de mesas con Supabase - Actualizado

import { useState, useEffect, useCallback } from 'react';
import tableService from '../services/tableService';

export const useTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar mesas
  const loadTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await tableService.getAllTables();
      
      if (result.success) {
        setTables(result.data || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading tables:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nueva mesa
  const createTable = useCallback(async (tableData) => {
    try {
      setLoading(true);
      const result = await tableService.createTable(tableData);
      
      if (result.success) {
        await loadTables(); // Recargar lista
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al crear mesa';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadTables]);

  // Actualizar mesa
  const updateTable = useCallback(async (tableId, updates) => {
    try {
      const result = await tableService.updateTable(tableId, updates);
      
      if (result.success) {
        setTables(prev => prev.map(table => 
          table.id === tableId ? { ...table, ...updates } : table
        ));
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al actualizar mesa';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Actualizar estado de mesa
  const updateTableStatus = useCallback(async (tableId, status) => {
    try {
      const result = await tableService.updateTableStatus(tableId, status);
      
      if (result.success) {
        setTables(prev => prev.map(table => 
          table.id === tableId ? { ...table, status } : table
        ));
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al cambiar estado';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Eliminar mesa
  const deleteTable = useCallback(async (tableId) => {
    try {
      const result = await tableService.deleteTable(tableId);
      
      if (result.success) {
        setTables(prev => prev.filter(table => table.id !== tableId));
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al eliminar mesa';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Obtener mesa por ID
  const getTableById = useCallback((tableId) => {
    return tables.find(table => table.id === parseInt(tableId));
  }, [tables]);

  // Obtener mesas disponibles
  const getAvailableTables = useCallback(() => {
    return tables.filter(table => table.status === 'available');
  }, [tables]);

  // Obtener mesas ocupadas
  const getOccupiedTables = useCallback(() => {
    return tables.filter(table => table.status === 'occupied');
  }, [tables]);

  // Estadísticas de mesas
  const getTableStats = useCallback(() => {
    const total = tables.length;
    const available = tables.filter(t => t.status === 'available').length;
    const occupied = tables.filter(t => t.status === 'occupied').length;
    const reserved = tables.filter(t => t.status === 'reserved').length;
    const maintenance = tables.filter(t => t.status === 'maintenance').length;

    return {
      total,
      available,
      occupied,
      reserved,
      maintenance,
      occupancyRate: total > 0 ? ((occupied + reserved) / total * 100).toFixed(1) : 0
    };
  }, [tables]);

  // Reservar mesa
  const reserveTable = useCallback(async (tableId, customerInfo) => {
    try {
      const result = await tableService.reserveTable(tableId, customerInfo);
      
      if (result.success) {
        setTables(prev => prev.map(table => 
          table.id === tableId ? { ...table, status: 'reserved' } : table
        ));
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al reservar mesa';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Liberar mesa
  const releaseTable = useCallback(async (tableId) => {
    try {
      const result = await tableService.releaseTable(tableId);
      
      if (result.success) {
        setTables(prev => prev.map(table => 
          table.id === tableId ? { ...table, status: 'available' } : table
        ));
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al liberar mesa';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // NUEVA FUNCIÓN: Ocupar mesa
  const occupyTable = useCallback(async (tableId) => {
    try {
      const result = await tableService.occupyTable(tableId);
      
      if (result.success) {
        setTables(prev => prev.map(table => 
          table.id === tableId ? { ...table, status: 'occupied' } : table
        ));
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al ocupar mesa';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Cargar mesas al montar el componente
  useEffect(() => {
    loadTables();
  }, [loadTables]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    tables,
    loading,
    error,
    loadTables,
    createTable,
    updateTable,
    updateTableStatus,
    deleteTable,
    getTableById,
    getAvailableTables,
    getOccupiedTables,
    getTableStats,
    reserveTable,
    releaseTable,
    occupyTable, // ← NUEVA FUNCIÓN EXPORTADA
    clearError
  };
};

export default useTables;