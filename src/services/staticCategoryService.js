// Servicio temporal para categorías estáticas hasta que se implemente la BD

// Categorías predefinidas para inventario
export const INVENTORY_CATEGORIES = [
  { id: 1, name: 'Carnes', description: 'Productos cárnicos y derivados', type: 'inventory', slug: 'carnes', color: '#ef4444', is_active: true },
  { id: 2, name: 'Pollo', description: 'Productos de pollo y aves', type: 'inventory', slug: 'pollo', color: '#f59e0b', is_active: true },
  { id: 3, name: 'Vegetales', description: 'Verduras y hortalizas frescas', type: 'inventory', slug: 'vegetales', color: '#10b981', is_active: true },
  { id: 4, name: 'Lácteos', description: 'Productos lácteos y derivados', type: 'inventory', slug: 'lacteos', color: '#06b6d4', is_active: true },
  { id: 5, name: 'Granos y Cereales', description: 'Arroz, pasta, cereales', type: 'inventory', slug: 'granos-cereales', color: '#8b5cf6', is_active: true },
  { id: 6, name: 'Condimentos', description: 'Especias, salsas y condimentos', type: 'inventory', slug: 'condimentos', color: '#f97316', is_active: true },
  { id: 7, name: 'Bebidas Embotelladas', description: 'Bebidas envasadas', type: 'inventory', slug: 'bebidas-embotelladas', color: '#84cc16', is_active: true },
  { id: 8, name: 'Aceites y Grasas', description: 'Aceites para cocinar', type: 'inventory', slug: 'aceites-grasas', color: '#eab308', is_active: true },
  { id: 9, name: 'Productos Congelados', description: 'Alimentos congelados', type: 'inventory', slug: 'productos-congelados', color: '#3b82f6', is_active: true },
  { id: 10, name: 'Otros Insumos', description: 'Otros productos e insumos', type: 'inventory', slug: 'otros-insumos', color: '#6b7280', is_active: true }
];

// Categorías predefinidas para menú
export const MENU_CATEGORIES = [
  { id: 11, name: 'Entradas', description: 'Aperitivos y entradas', type: 'menu', slug: 'entradas', color: '#f59e0b', is_active: true },
  { id: 12, name: 'Platos Principales', description: 'Platos fuertes', type: 'menu', slug: 'platos-principales', color: '#ef4444', is_active: true },
  { id: 13, name: 'Hamburguesas', description: 'Hamburguesas artesanales', type: 'menu', slug: 'hamburguesas', color: '#f97316', is_active: true },
  { id: 14, name: 'Especialidades de Pollo', description: 'Platos de pollo', type: 'menu', slug: 'especialidades-pollo', color: '#eab308', is_active: true },
  { id: 15, name: 'Carnes', description: 'Platos de carne', type: 'menu', slug: 'carnes-menu', color: '#dc2626', is_active: true },
  { id: 16, name: 'Pastas', description: 'Platos de pasta', type: 'menu', slug: 'pastas', color: '#8b5cf6', is_active: true },
  { id: 17, name: 'Ensaladas', description: 'Ensaladas frescas', type: 'menu', slug: 'ensaladas', color: '#10b981', is_active: true },
  { id: 18, name: 'Sopas y Cremas', description: 'Sopas calientes', type: 'menu', slug: 'sopas', color: '#f59e0b', is_active: true },
  { id: 19, name: 'Postres', description: 'Dulces y postres', type: 'menu', slug: 'postres', color: '#ec4899', is_active: true },
  { id: 20, name: 'Bebidas Preparadas', description: 'Bebidas hechas en casa', type: 'menu', slug: 'bebidas-preparadas', color: '#06b6d4', is_active: true },
  { id: 21, name: 'Jugos Frescos', description: 'Jugos naturales', type: 'menu', slug: 'jugos-frescos', color: '#84cc16', is_active: true },
  { id: 22, name: 'Bebidas Calientes', description: 'Café, té, chocolate', type: 'menu', slug: 'bebidas-calientes', color: '#92400e', is_active: true },
  { id: 23, name: 'Tragos y Cocteles', description: 'Bebidas alcohólicas', type: 'menu', slug: 'tragos', color: '#7c3aed', is_active: true }
];

// Todas las categorías
let ALL_CATEGORIES = [...INVENTORY_CATEGORIES, ...MENU_CATEGORIES];

// Servicio estático temporal
export const staticCategoryService = {
  // Obtener todas las categorías
  async getAllCategories() {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simular delay
      return { success: true, data: ALL_CATEGORIES.filter(cat => cat.is_active) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obtener categorías por tipo
  async getCategoriesByType(type) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simular delay
      const filteredCategories = ALL_CATEGORIES.filter(cat => cat.type === type && cat.is_active);
      return { success: true, data: filteredCategories };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Crear nueva categoría
  async createCategory(categoryData) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200)); // Simular delay
      
      const newCategory = {
        id: Math.max(...ALL_CATEGORIES.map(c => c.id)) + 1,
        name: categoryData.name,
        description: categoryData.description || null,
        type: categoryData.type,
        slug: categoryData.slug || categoryData.name.toLowerCase().replace(/\s+/g, '-'),
        color: categoryData.color || '#6366f1',
        icon: categoryData.icon || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      ALL_CATEGORIES.push(newCategory);
      return { success: true, data: newCategory };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Actualizar categoría
  async updateCategory(categoryId, updates) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200)); // Simular delay
      
      const categoryIndex = ALL_CATEGORIES.findIndex(cat => cat.id === categoryId);
      if (categoryIndex === -1) {
        throw new Error('Categoría no encontrada');
      }

      ALL_CATEGORIES[categoryIndex] = {
        ...ALL_CATEGORIES[categoryIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };

      return { success: true, data: ALL_CATEGORIES[categoryIndex] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Eliminar categoría (soft delete)
  async deleteCategory(categoryId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200)); // Simular delay
      
      const categoryIndex = ALL_CATEGORIES.findIndex(cat => cat.id === categoryId);
      if (categoryIndex === -1) {
        throw new Error('Categoría no encontrada');
      }

      // Simular verificación de productos (por ahora permitimos eliminar)
      ALL_CATEGORIES[categoryIndex].is_active = false;
      
      return { success: true, data: ALL_CATEGORIES[categoryIndex] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obtener categoría por ID
  async getCategoryById(categoryId) {
    try {
      const category = ALL_CATEGORIES.find(cat => cat.id === categoryId);
      if (!category) {
        throw new Error('Categoría no encontrada');
      }
      return { success: true, data: category };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Verificar si el slug está disponible
  async isSlugAvailable(slug, excludeId = null) {
    try {
      const existingCategory = ALL_CATEGORIES.find(cat => 
        cat.slug === slug && cat.id !== excludeId && cat.is_active
      );
      return { success: true, available: !existingCategory };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Obtener productos por categoría (simulado)
  async getProductsByCategory(categoryId) {
    try {
      // Por ahora retornamos array vacío
      return { success: true, data: [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export default staticCategoryService;