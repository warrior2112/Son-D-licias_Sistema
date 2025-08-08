// Página de gestión de usuarios

import React from 'react';
import UserManagement from '../components/auth/UserManagement';
import { Shield } from 'lucide-react';

const UserManagementPage = ({ users, onRegisterUser, onUpdateUser, onDeactivateUser, currentUser }) => {
  // Verificar permisos
  if (!currentUser?.permissions?.canManageUsers) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">
            No tienes permisos para acceder a la gestión de usuarios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <UserManagement
      users={users}
      onRegisterUser={onRegisterUser}
      onUpdateUser={onUpdateUser}
      onDeactivateUser={onDeactivateUser}
      currentUser={currentUser}
    />
  );
};

export default UserManagementPage;