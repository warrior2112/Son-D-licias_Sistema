// Componente para gestión de usuarios (solo admin)

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, Shield, Eye, EyeOff } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input, { Select } from '../ui/Input';
import Modal, { ModalBody, ModalFooter } from '../ui/Modal';
import { USER_ROLES, USER_ROLE_LABELS } from '../../utils/authConstants';
import { TableLoadingSpinner, FormLoadingSpinner } from '../common/LoadingSpinner';

const UserManagement = ({ users, onRegisterUser, onUpdateUser, onDeactivateUser, currentUser, loading = false }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [submitting, setSubmitting] = useState(false);


  // Función helper para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    
    try {
      const date = new Date(dateString);
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };
  
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: USER_ROLES.CAJERO
  });

  const [editUser, setEditUser] = useState({});

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.name || !newUser.email) {
      alert('Todos los campos son obligatorios');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onRegisterUser(newUser);
      if (result.success) {
        setNewUser({
          username: '',
          password: '',
          name: '',
          email: '',
          role: USER_ROLES.CAJERO
        });
        setShowCreateModal(false);
        alert('Usuario creado exitosamente');
      } else {
        alert('Error: ' + result.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    setSubmitting(true);
    try {
      const result = await onUpdateUser(selectedUser.id, editUser);
      if (result.success) {
        setShowEditModal(false);
        setSelectedUser(null);
        setEditUser({});
        alert('Usuario actualizado exitosamente');
      } else {
        alert('Error: ' + result.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setShowEditModal(true);
  };

  const handleDeactivateUser = async (userId, userName) => {
    if (window.confirm(`¿Estás seguro de que deseas desactivar al usuario "${userName}"?`)) {
      const result = await onDeactivateUser(userId);
      if (result.success) {
        alert('Usuario desactivado exitosamente');
      } else {
        alert('Error: ' + result.error);
      }
    }
  };

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const roleOptions = [
    { value: USER_ROLES.ADMIN, label: USER_ROLE_LABELS[USER_ROLES.ADMIN] },
    { value: USER_ROLES.CAJERO, label: USER_ROLE_LABELS[USER_ROLES.CAJERO] },
    { value: USER_ROLES.COCINA, label: USER_ROLE_LABELS[USER_ROLES.COCINA] }
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'bg-red-100 text-red-800';
      case USER_ROLES.CAJERO:
        return 'bg-blue-100 text-blue-800';
      case USER_ROLES.COCINA:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Usuarios</h2>
          <p className="text-gray-600">Administra usuarios y sus permisos en el sistema</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} variant="primary" icon={Plus}>
          Crear Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{users.length}</div>
            <div className="text-sm text-gray-600">Total Usuarios</div>
          </CardContent>
        </Card>
        
        <Card className="text-center border-l-4 border-red-400">
          <CardContent className="p-4">
            <Shield className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === USER_ROLES.ADMIN).length}
            </div>
            <div className="text-sm text-gray-600">Administradores</div>
          </CardContent>
        </Card>
        
        <Card className="text-center border-l-4 border-blue-400">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === USER_ROLES.CAJERO).length}
            </div>
            <div className="text-sm text-gray-600">Cajeros</div>
          </CardContent>
        </Card>
        
        <Card className="text-center border-l-4 border-green-400">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === USER_ROLES.COCINA).length}
            </div>
            <div className="text-sm text-gray-600">Cocina</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Información</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contraseña</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Registro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4">
                      <TableLoadingSpinner />
                    </td>
                  </tr>
                ) : users && users.length > 0 ? (
                  users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">@{user.username}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {USER_ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono">
                          {showPasswords[user.id] ? user.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(user.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords[user.id] ? 
                            <EyeOff className="h-4 w-4" /> : 
                            <Eye className="h-4 w-4" />
                          }
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(user)}
                        icon={Edit}
                        disabled={user.id === currentUser.id && user.role === USER_ROLES.ADMIN}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeactivateUser(user.id, user.name)}
                        icon={Trash2}
                        className="text-red-600 hover:text-red-800"
                        disabled={user.id === currentUser.id}
                      />
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay usuarios registrados</p>
                      <p className="text-sm">Crea el primer usuario para comenzar</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Usuario"
        size="lg"
      >
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre Completo"
                placeholder="Ej: Juan Pérez"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="ejemplo@sondlicias.com"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Usuario"
                placeholder="nombreusuario"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                required
              />
              <Input
                label="Contraseña"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
              />
            </div>
            
            <Select
              label="Rol del Usuario"
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              options={roleOptions}
              required
            />

            {/* Permisos del rol seleccionado */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">
                Permisos del rol "{USER_ROLE_LABELS[newUser.role]}":
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className={`${newUser.role === USER_ROLES.ADMIN ? 'text-green-600' : 'text-gray-400'}`}>
                  ✓ Gestionar usuarios
                </div>
                <div className={`${[USER_ROLES.ADMIN].includes(newUser.role) ? 'text-green-600' : 'text-gray-400'}`}>
                  ✓ Ver reportes
                </div>
                <div className={`${[USER_ROLES.ADMIN].includes(newUser.role) ? 'text-green-600' : 'text-gray-400'}`}>
                  ✓ Gestionar inventario
                </div>
                <div className={`${[USER_ROLES.ADMIN, USER_ROLES.CAJERO].includes(newUser.role) ? 'text-green-600' : 'text-gray-400'}`}>
                  ✓ Procesar órdenes
                </div>
                <div className={`${[USER_ROLES.ADMIN, USER_ROLES.COCINA].includes(newUser.role) ? 'text-green-600' : 'text-gray-400'}`}>
                  ✓ Ver producción
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateUser}
            loading={submitting}
            disabled={submitting}
          >
            {submitting ? 'Creando...' : 'Crear Usuario'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Editar Usuario: ${selectedUser?.name}`}
        size="lg"
      >
        {selectedUser && (
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nombre Completo"
                  value={editUser.name || ''}
                  onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={editUser.email || ''}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  required
                />
              </div>
              
              <Select
                label="Rol del Usuario"
                value={editUser.role || selectedUser.role}
                onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                options={roleOptions}
                required
                disabled={selectedUser.id === currentUser.id} // No puede cambiar su propio rol
              />

              {selectedUser.id === currentUser.id && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    ⚠️ No puedes cambiar tu propio rol por seguridad
                  </p>
                </div>
              )}
            </div>
          </ModalBody>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleEditUser}
            loading={submitting}
            disabled={submitting}
          >
            {submitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default UserManagement;