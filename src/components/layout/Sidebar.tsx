
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Warehouse, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart2,
  Truck,
  Settings,
  AlertTriangle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <BarChart2 className="h-5 w-5" /> },
    { name: 'Products', path: '/products', icon: <Package className="h-5 w-5" /> },
    { name: 'Inventory', path: '/inventory', icon: <Warehouse className="h-5 w-5" /> },
    { name: 'Suppliers', path: '/suppliers', icon: <Truck className="h-5 w-5" /> },
    { name: 'Customers', path: '/customers', icon: <Users className="h-5 w-5" /> },
    { name: 'Orders', path: '/orders', icon: <ShoppingCart className="h-5 w-5" /> },
    { name: 'Alerts', path: '/alerts', icon: <AlertTriangle className="h-5 w-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  // If on mobile and sidebar is open, add overlay
  const sidebarClasses = cn(
    "h-screen bg-white shadow-lg fixed top-0 left-0 z-40 transition-all duration-300 ease-in-out",
    isMobile ? (open ? "w-64" : "w-0 -translate-x-full") : "w-64"
  );
  
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setOpen(false)}
        />
      )}
      
      <aside className={sidebarClasses}>
        <div className="h-full flex flex-col">
          {isMobile && (
            <div className="px-4 py-3 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
          
          <div className="flex-1 py-8 px-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-gray-100"
                )}
                onClick={() => isMobile && setOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
          
          <div className="px-4 py-6 border-t">
            <div className="flex items-center space-x-3 px-4">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                A
              </div>
              <div>
                <p className="font-medium">Admin User</p>
                <p className="text-xs text-gray-500">admin@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
