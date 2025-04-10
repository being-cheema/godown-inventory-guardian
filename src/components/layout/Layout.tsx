
import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        <Sidebar open={isMobile ? sidebarOpen : true} setOpen={setSidebarOpen} />
        <main className={`flex-1 p-6 transition-all duration-300 ${isMobile ? '' : 'ml-64'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
