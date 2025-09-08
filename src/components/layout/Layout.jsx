// Layout principal del sistema Son D'licias con autenticación

import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ 
  children, 
  activeModule, 
  setActiveModule, 
  currentUser, 
  onLogout,
  onOpenUserManagement,
  orders = [],
  tables = [],
  inventory = [],
  onRefreshData
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // En móvil, el sidebar siempre está colapsado por defecto
      if (mobile) {
        setSidebarCollapsed(true);
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Responsive */}
      <Header 
        currentUser={currentUser} 
        onLogout={onLogout}
        onOpenUserManagement={onOpenUserManagement}
        orders={orders}
        tables={tables}
        inventory={inventory}
        onRefreshData={onRefreshData}
        onToggleSidebar={handleSidebarToggle}
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
      />
      
      {/* Layout flex container - responsive */}
      <div className="flex relative">
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="overlay-mobile"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - Responsive */}
        <div className={`
          ${isMobile 
            ? `sidebar-mobile ${sidebarOpen ? '' : 'closed'}` 
            : `transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`
          }
        `}>
          <Sidebar 
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            isCollapsed={sidebarCollapsed}
            setIsCollapsed={setSidebarCollapsed}
            currentUser={currentUser}
            isMobile={isMobile}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
        
        {/* Main Content - Responsive */}
        <main className={`
          flex-1 transition-all duration-300 min-h-screen
          ${!isMobile && !sidebarCollapsed ? 'ml-0' : ''}
          ${isMobile ? 'w-full' : ''}
        `}>
          <div className="min-h-[calc(100vh-64px)] container-mobile py-4 md:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;