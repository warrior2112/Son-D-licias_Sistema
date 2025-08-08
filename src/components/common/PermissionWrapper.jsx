// Wrapper para controlar permisos en componentes

import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

const PermissionWrapper = ({ 
  children, 
  permission, 
  currentUser, 
  fallback = null,
  showMessage = true 
}) => {
  const hasPermission = currentUser?.permissions?.[permission] || false;

  if (hasPermission) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  if (!showMessage) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
        <p className="text-gray-600 mb-4">
          No tienes permisos para acceder a esta sección.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center justify-center space-x-2 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">
              Contacta a un administrador si necesitas acceso
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionWrapper;