// Layout principal del sistema Son D'licias con autenticación

import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ 
  children, 
  activeModule, 
  setActiveModule, 
  currentUser, 
  onLogout,
  onOpenUserManagement 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header 
        currentUser={currentUser} 
        onLogout={onLogout}
        onOpenUserManagement={onOpenUserManagement}
      />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
          currentUser={currentUser}
        />
        
        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : 'ml-0'}`}>
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;