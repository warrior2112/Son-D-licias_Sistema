// Constantes para el sistema de autenticación

export const USER_ROLES = {
  ADMIN: 'admin',
  CAJERO: 'cajero',
  COCINA: 'cocina'
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.CAJERO]: 'Cajero',
  [USER_ROLES.COCINA]: 'Cocina'
};

export const USER_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    canManageUsers: true,
    canViewReports: true,
    canManageInventory: true,
    canProcessOrders: true,
    canViewProduction: true,
    canManageSystem: true
  },
  [USER_ROLES.CAJERO]: {
    canManageUsers: false,
    canViewReports: false,
    canManageInventory: false,
    canProcessOrders: true,
    canViewProduction: false,
    canManageSystem: false
  },
  [USER_ROLES.COCINA]: {
    canManageUsers: false,
    canViewReports: false,
    canManageInventory: false,
    canProcessOrders: false,
    canViewProduction: true,
    canManageSystem: false
  }
};

export const AUTH_STORAGE_KEY = 'son_dlicias_auth';
export const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 horas en millisegundos