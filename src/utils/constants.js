// Configuración y constantes del sistema Son D'licias

export const ORDER_STATUS = {
  PREPARANDO: 'preparando',
  LISTO: 'listo',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado'
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PREPARANDO]: 'Preparando',
  [ORDER_STATUS.LISTO]: 'Listo',
  [ORDER_STATUS.COMPLETADO]: 'Completado',
  [ORDER_STATUS.CANCELADO]: 'Cancelado'
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PREPARANDO]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUS.LISTO]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUS.COMPLETADO]: 'bg-green-100 text-green-800',
  [ORDER_STATUS.CANCELADO]: 'bg-red-100 text-red-800'
};

export const INVENTORY_MOVEMENT_TYPES = {
  IN: 'in',
  OUT: 'out',
  ADJUSTMENT: 'adjustment'
};

export const CATEGORIES = {
  BEBIDAS_GASCIFICADAS: 'bebidas-gascificadas',
  POSTRES: 'postres',
  TRAGOS: 'tragos',
  JUGOS: 'jugos-batidos',
  BEBIDAS_CALIENTES: 'bebidas-calientes',
  BEBIDAS_FRIAS: 'bebidas-frias',
  HAMBURGUESAS: 'hamburguesas',
  A_LA_CARTA: 'a-la-carta'
};

export const CATEGORY_LABELS = {
  [CATEGORIES.BEBIDAS_GASCIFICADAS]: 'Bebidas Gascificadas',
  [CATEGORIES.POSTRES]: 'Postres',
  [CATEGORIES.TRAGOS]: 'Tragos',
  [CATEGORIES.JUGOS]: 'Jugos y Batidos',
  [CATEGORIES.BEBIDAS_CALIENTES]: 'Bebidas Calientes',
  [CATEGORIES.BEBIDAS_FRIAS]: 'Bebidas Frías',
  [CATEGORIES.HAMBURGUESAS]: 'Hamburguesas',
  [CATEGORIES.A_LA_CARTA]: 'A la Carta'
};

export const CURRENCY = 'S/';

export const COLORS = {
  primary: 'orange',
  secondary: 'amber',
  success: 'green',
  warning: 'yellow',
  danger: 'red',
  info: 'blue'
};

// Agregar en ROUTES:
export const ROUTES = {
  DASHBOARD: 'dashboard',
  POS: 'pos',
  ORDERS: 'orders',
  INVENTORY: 'inventory',
  PRODUCTION: 'production',
  REPORTS: 'reports',
  MENU: 'menu'  // ← Agregar esta línea
};
export const STOCK_ALERTS = {
  LOW_STOCK: 10,
  CRITICAL_STOCK: 5,
  OUT_OF_STOCK: 0
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};