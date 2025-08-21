// Datos del menú completo de Son D'licias basado en la carta real

import { CATEGORIES } from '../../utils/constants';

export const menuData = {
  [CATEGORIES.BEBIDAS_GASCIFICADAS]: [
    { id: 1, name: 'Coca Cola', price: 3.50, stock: 50, minStock: 10 },
    { id: 2, name: 'Inca Cola', price: 3.50, stock: 45, minStock: 10 },
    { id: 3, name: 'Fanta', price: 3.00, stock: 40, minStock: 10 },
    { id: 4, name: 'Pepsi', price: 2.50, stock: 35, minStock: 10 },
    { id: 5, name: 'Agua Sin Gas', price: 1.50, stock: 60, minStock: 15 },
    { id: 6, name: 'Agua 1 Litro', price: 3.00, stock: 30, minStock: 8 },
    { id: 7, name: 'Pepsi 1 1/2', price: 6.50, stock: 25, minStock: 5 },
    { id: 8, name: 'Coca Cola 1 1/2', price: 8.50, stock: 20, minStock: 5 },
    { id: 9, name: 'Sporade', price: 3.00, stock: 35, minStock: 8 },
    { id: 10, name: 'Frugos del Valle', price: 2.50, stock: 40, minStock: 10 }
  ],

  [CATEGORIES.POSTRES]: [
    { id: 11, name: 'Torta de Chocolate', price: 5.50, stock: 15, minStock: 3 },
    { id: 12, name: 'Torta Tres Leches', price: 6.00, stock: 12, minStock: 3 },
    { id: 13, name: 'Crema Volteada', price: 5.00, stock: 20, minStock: 5 },
    { id: 14, name: 'Alfajor', price: 1.50, stock: 30, minStock: 10 },
    { id: 15, name: 'Ensalada de Frutas', price: 4.00, stock: 18, minStock: 5 },
    { id: 16, name: 'Empanadas', price: 3.50, stock: 25, minStock: 8 },
    { id: 17, name: 'Porción de Keke', price: 3.00, stock: 22, minStock: 5 }
  ],

  [CATEGORIES.TRAGOS]: [
    { id: 18, name: 'Chilcano Clásico', price: 14.00, stock: 10, minStock: 2 },
    { id: 19, name: 'Chilcano de Maracuyá', price: 14.00, stock: 8, minStock: 2 },
    { id: 20, name: 'Pisco Sour', price: 14.00, stock: 12, minStock: 3 },
    { id: 21, name: 'Pisco Maracuyá', price: 14.00, stock: 9, minStock: 2 },
    { id: 22, name: 'Piña Colada', price: 16.00, stock: 7, minStock: 2 },
    { id: 23, name: 'Mojito', price: 14.00, stock: 11, minStock: 3 },
    { id: 24, name: 'Machu Picchu', price: 16.00, stock: 6, minStock: 2 },
    { id: 25, name: 'Sangría', price: 40.00, stock: 5, minStock: 1 },
    { id: 26, name: 'Vino Tabernero', price: 22.00, stock: 8, minStock: 2 }
  ],

  [CATEGORIES.JUGOS]: [
    { id: 27, name: 'Jugo de Piña', price: 4.50, stock: 20, minStock: 5 },
    { id: 28, name: 'Jugo de Papaya', price: 4.50, stock: 18, minStock: 5 },
    { id: 29, name: 'Jugo de Naranja', price: 4.50, stock: 25, minStock: 8 },
    { id: 30, name: 'Jugo Surtido', price: 5.00, stock: 15, minStock: 3 },
    { id: 31, name: 'Papaya con Leche', price: 6.50, stock: 12, minStock: 3 },
    { id: 32, name: 'Plátano con Leche', price: 6.50, stock: 14, minStock: 3 },
    { id: 33, name: 'Fresa con Leche', price: 8.00, stock: 10, minStock: 2 },
    { id: 34, name: 'De Zanahoria', price: 8.00, stock: 8, minStock: 2 },
    { id: 35, name: 'De Espinaca', price: 8.00, stock: 6, minStock: 2 },
    { id: 36, name: 'De Arándano', price: 8.00, stock: 7, minStock: 2 },
    { id: 37, name: 'De Mandarina', price: 8.00, stock: 9, minStock: 2 }
  ],

  [CATEGORIES.BEBIDAS_CALIENTES]: [
    { id: 38, name: 'Café Pasado', price: 3.00, stock: 50, minStock: 15 },
    { id: 39, name: 'Café con Leche', price: 5.00, stock: 40, minStock: 10 },
    { id: 40, name: 'Té', price: 2.00, stock: 60, minStock: 20 },
    { id: 41, name: 'Milo', price: 4.00, stock: 30, minStock: 8 },
    { id: 42, name: 'Manzanilla', price: 2.00, stock: 45, minStock: 15 },
    { id: 43, name: 'Té Verde', price: 2.50, stock: 35, minStock: 10 },
    { id: 44, name: 'Té de Coca', price: 2.50, stock: 25, minStock: 8 },
    { id: 45, name: 'Chocolate Caliente', price: 6.00, stock: 20, minStock: 5 }
  ],

  [CATEGORIES.BEBIDAS_FRIAS]: [
    { id: 46, name: 'Frapuccino de Café', price: 8.00, stock: 15, minStock: 3 },
    { id: 47, name: 'Frapuccino de Mocca', price: 9.00, stock: 12, minStock: 3 },
    { id: 48, name: 'Milkshake (Oreo, fresa, tres leches)', price: 12.00, stock: 8, minStock: 2 },
    { id: 49, name: 'Chicha Morada 1/2', price: 5.00, stock: 20, minStock: 5 }
  ],

  [CATEGORIES.HAMBURGUESAS]: [
    { id: 50, name: 'Broaster', price: 5.00, stock: 20, minStock: 5, ingredients: 'Filete de pollo, papas, ensalada, cremas' },
    { id: 51, name: 'De Carne', price: 5.00, stock: 25, minStock: 5, ingredients: 'Carne artesanal, papas, ensalada, cremas' },
    { id: 52, name: 'De Chorizo', price: 5.00, stock: 18, minStock: 4, ingredients: 'Chorizo, papas, ensalada, cremas' },
    { id: 53, name: 'A lo Pobre', price: 7.50, stock: 15, minStock: 3, ingredients: 'Carne, huevo frito, plátano frito, papas, ensalada, cremas' },
    { id: 54, name: 'Jamplona', price: 8.00, stock: 12, minStock: 3, ingredients: 'Filete de pollo, hot dog, tocino, papas, ensalada, cremas' },
    { id: 55, name: 'Royal', price: 8.50, stock: 10, minStock: 2, ingredients: 'Pollo y carne, huevo frito, queso, papas, ensalada, cremas' },
    { id: 56, name: 'Hawaiana', price: 8.50, stock: 8, minStock: 2, ingredients: 'Pollo y carne, piña, queso, papas, ensalada, cremas' },
    { id: 57, name: 'A la Broster con Queso', price: 9.00, stock: 14, minStock: 3, ingredients: 'Pollo broster, queso, papas, jamón, ensalada, cremas' },
    { id: 58, name: 'Especial', price: 10.50, stock: 6, minStock: 1, ingredients: 'Carne artesanal, chorizo, huevo frito, jamón, papas, ensalada, cremas' }
  ],

  [CATEGORIES.A_LA_CARTA]: [
    { id: 59, name: 'Salchipapa Normal', price: 5.00, stock: 30, minStock: 8 },
    { id: 60, name: 'Salchipapa a lo Pobre', price: 8.00, stock: 20, minStock: 5 },
    { id: 61, name: 'Choripapa Normal', price: 6.00, stock: 25, minStock: 6 },
    { id: 62, name: 'Choripapa a lo Pobre', price: 9.00, stock: 15, minStock: 3 },
    { id: 63, name: 'Salchipollo', price: 8.00, stock: 18, minStock: 4 },
    { id: 64, name: 'Salchipollo a lo Pobre', price: 11.00, stock: 12, minStock: 3 },
    { id: 65, name: 'Alitas', price: 8.00, stock: 20, minStock: 5 },
    { id: 66, name: 'Pollo Broster', price: 11.00, stock: 15, minStock: 3 },
    { id: 67, name: 'Mostrito', price: 14.00, stock: 8, minStock: 2 },
    { id: 68, name: 'Chaufa de Pollo', price: 12.00, stock: 12, minStock: 3 },
    { id: 69, name: 'Chaufa de Carne', price: 15.00, stock: 8, minStock: 2 },
    { id: 70, name: 'Filete de Pollo', price: 12.00, stock: 15, minStock: 3 },
    { id: 71, name: 'Pollo Saltado', price: 12.00, stock: 14, minStock: 3 },
    { id: 72, name: 'Pollo Saltado a lo Pobre', price: 15.00, stock: 10, minStock: 2 },
    { id: 73, name: 'Lomo Saltado', price: 15.00, stock: 12, minStock: 3 },
    { id: 74, name: 'Lomo Saltado a lo Pobre', price: 18.00, stock: 8, minStock: 2 },
    { id: 75, name: 'Chicharrón de Pollo', price: 15.00, stock: 10, minStock: 2 },
    { id: 76, name: 'Alitas a la BBQ', price: 23.00, stock: 6, minStock: 1 },
    { id: 77, name: 'Arroz a la Cubana', price: 7.00, stock: 20, minStock: 5 }
  ]
};

// Función para obtener todos los productos en un array plano
export const getAllProducts = () => {
  const allProducts = [];
  Object.entries(menuData).forEach(([categoryKey, products]) => {
    products.forEach(product => {
      allProducts.push({
        ...product,
        category: categoryKey,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  });
  return allProducts;
};

// Función para obtener productos por categoría
export const getProductsByCategory = (categoryKey) => {
  return menuData[categoryKey] || [];
};

// Función para obtener un producto por ID
export const getProductById = (productId) => {
  const allProducts = getAllProducts();
  return allProducts.find(product => product.id === productId);
};

// Función para obtener productos con stock bajo
export const getLowStockProducts = () => {
  const allProducts = getAllProducts();
  return allProducts.filter(product => product.stock <= product.minStock);
};

// Complementos para hamburguesas
export const BURGER_COMPLEMENTS = [
  { name: 'Huevo Frito', price: 1.50 },
  { name: 'Plátano Frito', price: 1.50 },
  { name: 'Queso', price: 1.50 },
  { name: 'Jamón', price: 1.50 }
];

export default menuData;