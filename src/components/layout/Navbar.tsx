
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Warehouse, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart2,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const isMobile = useIsMobile();

  return (
    <nav className="bg-primary text-primary-foreground px-4 py-3 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-2">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        )}
        <Link to="/" className="flex items-center space-x-3">
          <Warehouse className="h-8 w-8" />
          <span className="font-bold text-xl hidden md:inline">Godown Inventory Guardian</span>
          <span className="font-bold text-xl md:hidden">GIG</span>
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        <Link to="/alerts">
          <Button variant="ghost" size="sm" className="text-primary-foreground">
            <AlertTriangle className="h-5 w-5" />
          </Button>
        </Link>
        <span className="font-medium">Admin</span>
      </div>
    </nav>
  );
};

export default Navbar;
