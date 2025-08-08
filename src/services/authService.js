// Servicio de autenticación con Supabase - Versión para desarrollo

import { supabase } from './supabase';
import bcrypt from 'bcryptjs';
import { USER_PERMISSIONS } from '../utils/authConstants';

export const authService = {
  // Login de usuario
  async login(username, password) {
    try {
      console.log('Intentando login con:', username); // Debug

      // Buscar usuario por username
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error consultando usuario:', error);
        if (error.code === 'PGRST116') {
          throw new Error('Usuario no encontrado');
        }
        throw error;
      }

      console.log('Usuario encontrado:', user.username); // Debug

      // Verificar contraseña (modo desarrollo vs producción)
      let isValidPassword = false;
      
      if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$')) {
        // Contraseña hasheada con bcrypt
        isValidPassword = await bcrypt.compare(password, user.password_hash);
      } else {
        // Contraseña en texto plano (solo para desarrollo)
        isValidPassword = password === user.password_hash;
        console.log('Verificando contraseña simple:', password, '===', user.password_hash, '=', isValidPassword);
      }

      if (!isValidPassword) {
        console.log('Contraseña incorrecta'); // Debug
        throw new Error('Contraseña incorrecta');
      }

      console.log('Login exitoso para:', user.username); // Debug

      // Actualizar último login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Crear sesión de usuario (sin datos sensibles)
      const userSession = {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: USER_PERMISSIONS[user.role] || {},
        lastLogin: new Date().toISOString()
      };

      return { success: true, data: userSession };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  },

  // Registro de nuevo usuario
  async register(userData) {
    try {
      // Verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('username, email')
        .or(`username.eq.${userData.username},email.eq.${userData.email}`)
        .single();

      if (existingUser) {
        if (existingUser.username === userData.username) {
          throw new Error('El nombre de usuario ya existe');
        }
        if (existingUser.email === userData.email) {
          throw new Error('El email ya está registrado');
        }
      }

      // Hashear la contraseña
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Insertar nuevo usuario
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          username: userData.username,
          password_hash: passwordHash,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'cajero'
        })
        .select('id, username, name, email, role, created_at')
        .single();

      if (error) throw error;

      return { success: true, data: newUser };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener todos los usuarios
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, name, email, role, is_active, last_login, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar usuario
  async updateUser(userId, updates) {
    try {
      // Si se actualiza la contraseña, hashearla
      if (updates.password) {
        const saltRounds = 10;
        updates.password_hash = await bcrypt.hash(updates.password, saltRounds);
        delete updates.password; // Remover la contraseña en texto plano
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('id, username, name, email, role, is_active, updated_at')
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return { success: false, error: error.message };
    }
  },

  // Desactivar usuario
  async deactivateUser(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('id, username, name, is_active')
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      return { success: false, error: error.message };
    }
  },

  // Reactivar usuario
  async reactivateUser(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('id, username, name, is_active')
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error al reactivar usuario:', error);
      return { success: false, error: error.message };
    }
  },

  // Cambiar contraseña
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Obtener usuario actual
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Verificar contraseña actual
      let isValidPassword = false;
      if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$')) {
        isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      } else {
        isValidPassword = currentPassword === user.password_hash;
      }

      if (!isValidPassword) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Hashear nueva contraseña
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      return { success: true, message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return { success: false, error: error.message };
    }
  },

  // Verificar permisos
  async verifyPermission(userId, permission) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      const userPermissions = USER_PERMISSIONS[user.role] || {};
      return { success: true, hasPermission: userPermissions[permission] || false };
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return { success: false, error: error.message };
    }
  },

  // Generar token de sesión
  generateSessionToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
};

export default authService;