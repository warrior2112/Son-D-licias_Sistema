# Configuración de Notas de Venta PDF

## Personalizar Información de la Empresa

Para personalizar la información que aparece en las notas de venta PDF, edita el archivo:
`src/services/invoiceService.js`

### Datos a modificar:

```javascript
const COMPANY_INFO = {
  name: "Son D'licias",                   
  ruc: "20123456789",                      
  address: "Av. Principal 123, Lima, Perú", 
  phone: "01-234-5678",                    
  email: "info@sondelicias.com"           
```

## Funcionalidades

✅ **Generación automática**: Se genera PDF automáticamente al procesar el pago (opcional)
✅ **Información completa**: Incluye datos de la empresa, orden, productos, totales y pago
✅ **Descarga automática**: El PDF se descarga automáticamente al navegador
✅ **Nombre único**: Cada PDF tiene un nombre único con ID de orden y fecha

## Contenido del PDF

- **Header**: Logo, nombre y datos de la empresa
- **Información de venta**: Número de orden, fecha, mesa, cliente
- **Detalles de pago**: Método, vuelto (si aplica)
- **Tabla de productos**: Cantidad, nombre, precio unitario, subtotal
- **Totales**: Subtotal, IGV (si aplica), total
- **Footer**: Mensaje de agradecimiento e información de contacto

## Personalización Adicional

Para cambios más avanzados en el diseño del PDF, modifica los métodos en `InvoiceService`:

- `addCompanyHeader()`: Header con logo y datos de empresa
- `addTitle()`: Título del documento
- `addSaleInfo()`: Información de la venta
- `addProductsTable()`: Tabla de productos
- `addTotals()`: Sección de totales
- `addFooter()`: Footer con información adicional

## Formato de Nombre de Archivo

Los PDFs se generan con el formato:
`nota-venta-{ID_ORDEN}-{FECHA}.pdf`

Ejemplo: `nota-venta-123-2024-01-15.pdf`