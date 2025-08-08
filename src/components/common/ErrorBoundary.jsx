// Error Boundary para manejar errores en Son D'licias

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from '../ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Aquí podrías enviar el error a un servicio de logging
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ¡Oops! Algo salió mal
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              Ha ocurrido un error inesperado en el sistema. Nuestro equipo ha sido notificado.
            </p>

            {/* Error details (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-gray-800 mb-2">Detalles del error:</p>
                <p className="text-xs text-red-600 font-mono break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 cursor-pointer">
                      Stack trace
                    </summary>
                    <pre className="text-xs text-gray-500 mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={this.handleRetry}
                icon={RefreshCw}
                className="flex-1"
              >
                Intentar de nuevo
              </Button>
              <Button
                variant="secondary"
                onClick={this.handleGoHome}
                icon={Home}
                className="flex-1"
              >
                Ir al inicio
              </Button>
            </div>

            {/* Footer */}
            <p className="text-xs text-gray-500 mt-6">
              Si el problema persiste, contacta al administrador del sistema.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar en componentes funcionales
export const useErrorHandler = () => {
  const handleError = (error, errorInfo = {}) => {
    console.error('Error manejado:', error, errorInfo);
    // Aquí podrías enviar a un servicio de logging
  };

  return { handleError };
};

export default ErrorBoundary;