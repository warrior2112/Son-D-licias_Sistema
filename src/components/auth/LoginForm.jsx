// Formulario de inicio de sesión

import React, { useState } from 'react';
import { LogIn, User, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card, { CardContent } from '../ui/Card';
import LoadingSpinner from '../common/LoadingSpinner';

const LoginForm = ({ onLogin, loading, error }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      onLogin(formData.username, formData.password);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-gray-800 bg-clip-text text-transparent">
            Son D'licias
          </h1>
          <p className="text-gray-600 mt-2">Sistema de Gestión</p>
        </div>

        {/* Formulario */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Iniciar Sesión</h2>
                <p className="text-gray-600 text-sm">Ingresa tus credenciales para continuar</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Usuario"
                name="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={formData.username}
                onChange={handleChange}
                icon={User}
                required
                disabled={loading}
              />

              <div className="relative">
                <Input
                  label="Contraseña"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  icon={Lock}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
                loading={loading}
                disabled={loading || !formData.username || !formData.password}
                icon={LogIn}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* Credenciales de prueba */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Credenciales de prueba:</h3>
              <div className="space-y-2 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Admin:</strong> admin / admin123
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Cajero:</strong> cajero1 / cajero123
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Cocina:</strong> cocina1 / cocina123
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          © 2025 Son D'licias - Sistema de Gestión
        </div>
      </div>
    </div>
  );
};

export default LoginForm;