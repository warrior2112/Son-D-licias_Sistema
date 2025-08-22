# Sistema de Gestión de Categorías - Son D'licias

## 🎯 Descripción
Se ha implementado un sistema completo de gestión de categorías dinámicas para inventario y menú digital. Ahora puedes crear, modificar y eliminar categorías desde la interfaz de usuario.

## 📋 Funcionalidades Implementadas

### ✅ **Gestión Completa de Categorías**
- **Crear** nuevas categorías para inventario o menú
- **Editar** categorías existentes (nombre, descripción, color)
- **Eliminar** categorías (con validación de productos asociados)
- **Filtrar** categorías por tipo (Inventario/Menú)
- **Colores personalizables** para cada categoría

### ✅ **Interfaz de Usuario**
- Nueva página "Categorías" en el menú principal
- Modal para crear/editar categorías
- Vista en tarjetas con colores distintivos
- Iconos diferenciados para inventario y menú
- Estadísticas en tiempo real

## 🔧 **Archivos Creados/Modificados**

### **Nuevos Archivos:**
- `src/services/categoryService.js` - Servicio para CRUD de categorías
- `src/hooks/useCategories.js` - Hook para gestión de estado
- `src/pages/CategoryManagement.jsx` - Página principal de gestión
- `database/categories_schema.sql` - Schema de base de datos
- `database/migrate_categories.sql` - Script de migración

### **Archivos Modificados:**
- `src/components/layout/Sidebar.jsx` - Agregado enlace "Categorías"
- `src/App.js` - Agregada ruta para CategoryManagement

## 🗄️ **Configuración de Base de Datos**

### **Paso 1: Crear la Tabla de Categorías**
Ejecutar en Supabase SQL Editor:
```sql
-- Copiar y pegar el contenido de database/categories_schema.sql
```

### **Paso 2: Migrar Productos Existentes**
Ejecutar en Supabase SQL Editor:
```sql
-- Copiar y pegar el contenido de database/migrate_categories.sql
```

## 📊 **Estructura de la Tabla Categories**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | ID único (clave primaria) |
| `name` | VARCHAR | Nombre de la categoría |
| `description` | TEXT | Descripción opcional |
| `type` | VARCHAR | 'inventory' o 'menu' |
| `slug` | VARCHAR | Identificador único amigable |
| `color` | VARCHAR | Color en formato hex (#6366f1) |
| `icon` | VARCHAR | Nombre del icono |
| `is_active` | BOOLEAN | Estado activo/inactivo |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de actualización |

## 🎨 **Categorías Pre-definidas**

### **Inventario (10 categorías):**
- Carnes
- Pollo  
- Vegetales
- Lácteos
- Granos y Cereales
- Condimentos
- Bebidas Embotelladas
- Aceites y Grasas
- Productos Congelados
- Otros Insumos

### **Menú Digital (13 categorías):**
- Entradas
- Platos Principales
- Hamburguesas
- Especialidades de Pollo
- Carnes
- Pastas
- Ensaladas
- Sopas y Cremas
- Postres
- Bebidas Preparadas
- Jugos Frescos
- Bebidas Calientes
- Tragos y Cocteles

## 🚀 **Cómo Usar el Sistema**

### **Acceder a Gestión de Categorías:**
1. Ir al menú lateral → **"Categorías"**
2. Se requiere permiso `canManageInventory`

### **Crear Nueva Categoría:**
1. Hacer clic en **"Agregar Categoría"**
2. Llenar formulario:
   - **Nombre:** Nombre de la categoría
   - **Tipo:** Inventario o Menú Digital
   - **Descripción:** (Opcional) Descripción detallada
   - **Color:** Seleccionar color distintivo
3. Hacer clic en **"Crear Categoría"**

### **Editar Categoría:**
1. Hacer clic en el ícono de edición en la tarjeta
2. Modificar campos deseados
3. Hacer clic en **"Guardar Cambios"**

### **Eliminar Categoría:**
1. Hacer clic en el ícono de eliminación
2. Confirmar acción
3. **Nota:** No se puede eliminar si tiene productos asociados

### **Filtrar Categorías:**
- Usar el dropdown **"Filtrar por tipo"**
- Opciones: Todas / Solo Inventario / Solo Menú

## ⚠️ **Consideraciones Importantes**

### **Migración de Datos:**
- Los productos existentes se migrarán automáticamente
- La columna antigua `category` se mantiene por compatibilidad
- Se agrega nueva columna `category_id` con referencias a la tabla `categories`

### **Permisos:**
- Requiere permiso `canManageInventory` para gestionar categorías
- Los usuarios sin permisos no verán la opción en el menú

### **Validaciones:**
- No se pueden eliminar categorías con productos asociados
- Los nombres de categorías deben ser únicos
- Los slugs se generan automáticamente

## 🔄 **Integración Futura**

Este sistema está preparado para integrarse con:
- Páginas de Inventario (filtrar por categorías dinámicas)
- Páginas de Menú Digital (organizar platos por categorías)
- Reportes (análisis por categorías)
- Sistema de productos (asignación de categorías)

## 🛠️ **Próximos Pasos**

1. **Ejecutar scripts de base de datos** en Supabase
2. **Probar funcionalidades** en el entorno de desarrollo
3. **Actualizar páginas de Inventario y Menú** para usar categorías dinámicas
4. **Configurar permisos** según usuarios del sistema

## 📞 **Soporte**

Si encuentras algún problema durante la implementación:
1. Verificar que los scripts SQL se ejecutaron correctamente
2. Revisar permisos de usuario
3. Comprobar logs de consola para errores

---

**¡El sistema de categorías dinámicas está listo para usar! 🎉**