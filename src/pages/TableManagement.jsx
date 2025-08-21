// Gestión de mesas del restaurante

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, MapPin, AlertCircle, CheckCircle, Clock, Settings, ShoppingCart } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { Select } from '../components/ui/Input';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';
import OrderModal from '../components/common/OrderModal';
import useTables from '../hooks/useTables';
import useOrders from '../hooks/useOrders';

const TableManagement = ({ 
  currentUser, 
  orders: ordersFromApp,
  onCreateOrder: createOrderFromApp,
  onUpdateOrder: updateOrderFromApp,
  onDeleteOrder: deleteOrderFromApp,
  onReloadOrders: reloadOrdersFromApp
}) => {
  const {
    tables,
    loading,
    error,
    createTable,
    updateTable,
    updateTableStatus,
    deleteTable,
    getTableStats,
    clearError
  } = useTables();

  // Usar las órdenes y funciones que vienen del App.js para sincronización global
  const orders = ordersFromApp || [];
  const ordersLoading = false; // Se maneja a nivel global
  
  // Funciones locales solo para casos donde no se pasan desde App.js
  const {
    createOrder: localCreateOrder,
    updateOrder: localUpdateOrder,
    deleteOrder: localDeleteOrder
  } = useOrders();
  
  // Usar funciones de App.js si están disponibles, sino usar las locales
  const createOrder = createOrderFromApp || localCreateOrder;
  const updateOrder = updateOrderFromApp || localUpdateOrder;
  const removeOrder = deleteOrderFromApp || localDeleteOrder;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTableOrder, setSelectedTableOrder] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'

  const [newTable, setNewTable] = useState({
    tableNumber: '',
    capacity: 4,
    location: 'Interior'
  });

  const [editTable, setEditTable] = useState({});

  const stats = getTableStats();

  const handleCreateTable = async () => {
    if (!newTable.tableNumber) {
      alert('El número de mesa es obligatorio');
      return;
    }

    const result = await createTable(newTable);
    if (result.success) {
      setNewTable({ tableNumber: '', capacity: 4, location: 'Interior' });
      setShowCreateModal(false);
      alert('Mesa creada exitosamente');
    } else {
      alert('Error: ' + result.error);
    }
  };

  const handleEditTable = async () => {
    if (!editTable.table_number || !editTable.capacity) {
      alert('Número de mesa y capacidad son obligatorios');
      return;
    }

    const result = await updateTable(selectedTable.id, {
      table_number: editTable.table_number,
      capacity: parseInt(editTable.capacity),
      location: editTable.location
    });

    if (result.success) {
      setShowEditModal(false);
      setSelectedTable(null);
      alert('Mesa actualizada exitosamente');
    } else {
      alert('Error: ' + result.error);
    }
  };

  const openEditModal = (table) => {
    setSelectedTable(table);
    setEditTable({
      table_number: table.table_number,
      capacity: table.capacity,
      location: table.location
    });
    setShowEditModal(true);
  };

  const handleDeleteTable = async (tableId, tableNumber) => {
    if (window.confirm(`¿Estás seguro de eliminar la mesa ${tableNumber}?`)) {
      const result = await deleteTable(tableId);
      if (result.success) {
        alert('Mesa eliminada exitosamente');
      } else {
        alert('Error: ' + result.error);
      }
    }
  };

  const handleStatusChange = async (tableId, newStatus) => {
    const result = await updateTableStatus(tableId, newStatus);
    if (!result.success) {
      alert('Error al cambiar estado: ' + result.error);
    }
  };

  // Manejar click en mesa
  const handleTableClick = (table) => {
    // Verificar si la mesa tiene un pedido activo
    const activeOrder = orders.find(order => 
      order.tableId === table.id && 
      (order.status === 'preparando' || order.status === 'listo')
    );

    setSelectedTable(table);
    setSelectedTableOrder(activeOrder || null);
    setShowOrderModal(true);
  };

  // Crear pedido
  const handleCreateOrder = async (orderData) => {
    const result = await createOrder(orderData);
    if (result.success) {
      // Cambiar estado de mesa a ocupada
      await updateTableStatus(orderData.tableId, 'occupied');
      // La recarga de órdenes se hace a nivel global en App.js
      alert('Pedido creado exitosamente');
      return true;
    } else {
      alert('Error al crear pedido: ' + result.error);
      return false;
    }
  };

  // Actualizar pedido
  const handleUpdateOrder = async (orderId, orderData) => {
    const result = await updateOrder(orderId, orderData);
    if (result.success) {
      // La recarga de órdenes se hace a nivel global en App.js
      alert('Pedido actualizado exitosamente');
      return true;
    } else {
      alert('Error al actualizar pedido: ' + result.error);
      return false;
    }
  };

  // Eliminar pedido
  const handleDeleteOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const result = await removeOrder(orderId);
      if (result.success) {
        // Cambiar estado de mesa a disponible
        await updateTableStatus(order.tableId, 'available');
        // La recarga de órdenes se hace a nivel global en App.js
        alert('Pedido eliminado exitosamente');
        return true;
      } else {
        alert('Error al eliminar pedido: ' + result.error);
        return false;
      }
    }
    return false;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'occupied':
        return <Users className="h-4 w-4" />;
      case 'reserved':
        return <Clock className="h-4 w-4" />;
      case 'maintenance':
        return <Settings className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const statusOptions = [
    { value: 'available', label: 'Disponible' },
    { value: 'occupied', label: 'Ocupada' },
    { value: 'reserved', label: 'Reservada' },
    { value: 'maintenance', label: 'Mantenimiento' }
  ];

  const locationOptions = [
    { value: 'Interior', label: 'Interior' },
    { value: 'Terraza', label: 'Terraza' },
    { value: 'VIP', label: 'VIP' },
    { value: 'Patio', label: 'Patio' }
  ];

  if (loading && tables.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Cargando mesas...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Mesas</h2>
          <p className="text-gray-600">Administra las mesas del restaurante</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Cuadrícula
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Lista
            </button>
          </div>
          <Button onClick={() => setShowCreateModal(true)} variant="primary" icon={Plus}>
            Agregar Mesa
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">×</button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Mesas</div>
          </CardContent>
        </Card>
        
        <Card className="text-center border-l-4 border-green-400">
          <CardContent className="p-4">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <div className="text-sm text-gray-600">Disponibles</div>
          </CardContent>
        </Card>
        
        <Card className="text-center border-l-4 border-red-400">
          <CardContent className="p-4">
            <Users className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
            <div className="text-sm text-gray-600">Ocupadas</div>
          </CardContent>
        </Card>
        
        <Card className="text-center border-l-4 border-yellow-400">
          <CardContent className="p-4">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{stats.reserved}</div>
            <div className="text-sm text-gray-600">Reservadas</div>
          </CardContent>
        </Card>
        
        <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.occupancyRate}%</div>
            <div className="text-sm text-gray-600">Ocupación</div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onEdit={openEditModal}
              onDelete={handleDeleteTable}
              onStatusChange={handleStatusChange}
              onTableClick={handleTableClick}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              hasActiveOrder={orders.some(order => 
                order.tableId === table.id && 
                (order.status === 'preparando' || order.status === 'listo')
              )}
            />
          ))}
        </div>
      ) : (
        <TableList
          tables={tables}
          onEdit={openEditModal}
          onDelete={handleDeleteTable}
          onStatusChange={handleStatusChange}
          onTableClick={handleTableClick}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          statusOptions={statusOptions}
          orders={orders}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Agregar Nueva Mesa"
      >
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Número de Mesa"
                placeholder="Ej: 1, A1, VIP-1"
                value={newTable.tableNumber}
                onChange={(e) => setNewTable({...newTable, tableNumber: e.target.value})}
                required
              />
              <Input
                label="Capacidad"
                type="number"
                min="1"
                max="20"
                value={newTable.capacity}
                onChange={(e) => setNewTable({...newTable, capacity: parseInt(e.target.value)})}
                required
              />
            </div>
            
            <Select
              label="Ubicación"
              value={newTable.location}
              onChange={(e) => setNewTable({...newTable, location: e.target.value})}
              options={locationOptions}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateTable}>
            Crear Mesa
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Editar Mesa ${selectedTable?.table_number}`}
      >
        {selectedTable && (
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Número de Mesa"
                  value={editTable.table_number || ''}
                  onChange={(e) => setEditTable({...editTable, table_number: e.target.value})}
                  required
                />
                <Input
                  label="Capacidad"
                  type="number"
                  min="1"
                  max="20"
                  value={editTable.capacity || ''}
                  onChange={(e) => setEditTable({...editTable, capacity: e.target.value})}
                  required
                />
              </div>
              
              <Select
                label="Ubicación"
                value={editTable.location || selectedTable.location}
                onChange={(e) => setEditTable({...editTable, location: e.target.value})}
                options={locationOptions}
              />
            </div>
          </ModalBody>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleEditTable}>
            Guardar Cambios
          </Button>
        </ModalFooter>
      </Modal>

      {/* Order Modal */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedTable(null);
          setSelectedTableOrder(null);
        }}
        table={selectedTable}
        existingOrder={selectedTableOrder}
        onCreateOrder={handleCreateOrder}
        onUpdateOrder={handleUpdateOrder}
        onDeleteOrder={handleDeleteOrder}
        loading={ordersLoading}
      />
    </div>
  );
};

// Componente de tarjeta de mesa
const TableCard = ({ table, onEdit, onDelete, onStatusChange, onTableClick, getStatusColor, getStatusIcon, hasActiveOrder }) => (
  <Card className="hover:shadow-lg transition-all duration-200 relative cursor-pointer" onClick={() => onTableClick(table)}>
    <CardContent className="p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-xl font-bold text-indigo-600">
            {table.table_number}
          </span>
        </div>
        
        <h3 className="font-semibold text-gray-800 mb-1">Mesa {table.table_number}</h3>
        
        {hasActiveOrder && (
          <div className="flex items-center justify-center space-x-1 mb-2">
            <ShoppingCart className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-orange-600 font-medium">Pedido Activo</span>
          </div>
        )}
        
        <div className="flex items-center justify-center space-x-1 mb-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{table.capacity} personas</span>
        </div>
        
        <div className="flex items-center justify-center space-x-1 mb-3">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{table.location}</span>
        </div>
        
        <select
          value={table.status}
          onChange={(e) => onStatusChange(table.id, e.target.value)}
          className={`w-full px-2 py-1 rounded-full text-xs font-medium border cursor-pointer ${getStatusColor(table.status)}`}
        >
          <option value="available">Disponible</option>
          <option value="occupied">Ocupada</option>
          <option value="reserved">Reservada</option>
          <option value="maintenance">Mantenimiento</option>
        </select>
        
        <div className="flex justify-center space-x-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(table);
            }}
            icon={Edit}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(table.id, table.table_number);
            }}
            icon={Trash2}
            className="text-red-600 hover:text-red-800"
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Componente de lista de mesas
const TableList = ({ tables, onEdit, onDelete, onStatusChange, onTableClick, getStatusColor, getStatusIcon, statusOptions, orders }) => (
  <Card>
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mesa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tables.map((table) => {
              const hasActiveOrder = orders.some(order => 
                order.tableId === table.id && 
                (order.status === 'preparando' || order.status === 'listo')
              );
              
              return (
              <tr key={table.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onTableClick(table)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-indigo-600">{table.table_number}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Mesa {table.table_number}</div>
                      {hasActiveOrder && (
                        <div className="flex items-center space-x-1 mt-1">
                          <ShoppingCart className="h-3 w-3 text-orange-500" />
                          <span className="text-xs text-orange-600">Pedido Activo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{table.location}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{table.capacity}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={table.status}
                    onChange={(e) => onStatusChange(table.id, e.target.value)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer ${getStatusColor(table.status)}`}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(table);
                    }}
                    icon={Edit}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(table.id, table.table_number);
                    }}
                    icon={Trash2}
                    className="text-red-600 hover:text-red-800"
                  />
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

export default TableManagement;