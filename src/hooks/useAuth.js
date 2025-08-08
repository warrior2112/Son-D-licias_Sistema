// Hook para manejo de autenticación con Supabase

import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { AUTH_STORAGE_KEY, SESSION_TIMEOUT } from '../utils/authConstants';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar sesión al iniciar
  useEffect(() => {
    const loadSession = () => {
      try {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
          const { user: storedUser, timestamp } = JSON.parse(storedAuth);
          
          // Verificar si la sesión no ha expirado
          if (Date.now() - timestamp < SESSION_TIMEOUT) {
            setUser(storedUser);
          } else {
            // Sesión expirada
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
    loadUsers(); // Cargar usuarios al iniciar
  }, []);

  // Cargar usuarios desde la base de datos
  const loadUsers = useCallback(async () => {
    try {
      const result = await authService.getAllUsers();
      if (result.success) {
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, []);

  // Función de login con base de datos real
  const login = useCallback(async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.login(username, password);

      if (result.success) {
        const userSession = result.data;

        // Guardar en localStorage
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          user: userSession,
          timestamp: Date.now()
        }));

        setUser(userSession);
        return { success: true, user: userSession };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }

    } catch (error) {
      const errorMessage = error.message || 'Error de conexión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Función de logout
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setError(null);
  }, []);

  // Función para registrar nuevo usuario (solo admin)
  const registerUser = useCallback(async (userData) => {
    try {
      if (!user || !user.permissions?.canManageUsers) {
        throw new Error('No tienes permisos para registrar usuarios');
      }

      setLoading(true);

      const result = await authService.register(userData);
      
      if (result.success) {
        await loadUsers(); // Recargar lista de usuarios
        return { success: true, user: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }

    } catch (error) {
      const errorMessage = error.message || 'Error al registrar usuario';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user, loadUsers]);

  // Función para actualizar usuario
  const updateUser = useCallback(async (userId, updates) => {
    try {
      if (!user || !user.permissions?.canManageUsers) {
        throw new Error('No tienes permisos para actualizar usuarios');
      }

      const result = await authService.updateUser(userId, updates);

      if (result.success) {
        await loadUsers(); // Recargar lista de usuarios
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }

    } catch (error) {
      const errorMessage = error.message || 'Error al actualizar usuario';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user, loadUsers]);

  // Función para desactivar usuario
  const deactivateUser = useCallback(async (userId) => {
    try {
      if (!user || !user.permissions?.canManageUsers) {
        throw new Error('No tienes permisos para desactivar usuarios');
      }

      if (userId === user.id) {
        throw new Error('No puedes desactivar tu propia cuenta');
      }

      const result = await authService.deactivateUser(userId);

      if (result.success) {
        await loadUsers(); // Recargar lista de usuarios
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }

    } catch (error) {
      const errorMessage = error.message || 'Error al desactivar usuario';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user, loadUsers]);

  // Función para reactivar usuario
  const reactivateUser = useCallback(async (userId) => {
    try {
      if (!user || !user.permissions?.canManageUsers) {
        throw new Error('No tienes permisos para reactivar usuarios');
      }

      const result = await authService.reactivateUser(userId);

      if (result.success) {
        await loadUsers(); // Recargar lista de usuarios
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }

    } catch (error) {
      const errorMessage = error.message || 'Error al reactivar usuario';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user, loadUsers]);

  // Función para cambiar contraseña
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const result = await authService.changePassword(user.id, currentPassword, newPassword);

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }

    } catch (error) {
      const errorMessage = error.message || 'Error al cambiar contraseña';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Verificar permisos
  const hasPermission = useCallback((permission) => {
    return user?.permissions?.[permission] || false;
  }, [user]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refrescar datos del usuario actual
  const refreshUser = useCallback(async () => {
    if (user) {
      try {
        const result = await authService.getAllUsers();
        if (result.success) {
          const updatedUser = result.data.find(u => u.id === user.id);
          if (updatedUser) {
            const userSession = {
              ...user,
              name: updatedUser.name,
              email: updatedUser.email,
              role: updatedUser.role
            };
            
            setUser(userSession);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
              user: userSession,
              timestamp: Date.now()
            }));
          }
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
      }
    }
  }, [user]);

  return {
    // Estado
    user,
    users: users.filter(u => u.is_active), // Solo usuarios activos por defecto
    allUsers: users, // Todos los usuarios para admin
    loading,
    error,
    isAuthenticated: !!user,
    
    // Funciones
    login,
    logout,
    registerUser,
    updateUser,
    deactivateUser,
    reactivateUser,
    changePassword,
    hasPermission,
    clearError,
    loadUsers,
    refreshUser
  };
};

export default useAuth;