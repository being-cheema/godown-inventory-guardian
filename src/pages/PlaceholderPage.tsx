
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Settings, Truck, Warehouse, Users, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.substring(1);
  
  // Define icons and titles based on the path
  const getIconAndTitle = () => {
    switch (path) {
      case 'inventory':
        return { icon: <Warehouse className="h-8 w-8 mb-4" />, title: 'Inventory Management' };
      case 'suppliers':
        return { icon: <Truck className="h-8 w-8 mb-4" />, title: 'Supplier Management' };
      case 'customers':
        return { icon: <Users className="h-8 w-8 mb-4" />, title: 'Customer Management' };
      case 'orders':
        return { icon: <ShoppingCart className="h-8 w-8 mb-4" />, title: 'Order Management' };
      case 'settings':
        return { icon: <Settings className="h-8 w-8 mb-4" />, title: 'Settings' };
      default:
        return { icon: <Warehouse className="h-8 w-8 mb-4" />, title: 'Page' };
    }
  };
  
  const { icon, title } = getIconAndTitle();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold capitalize">{title}</h1>
      
      <Card className="text-center">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center">
            {icon}
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <p className="text-muted-foreground mb-6">
              This page is under construction. The full implementation would include all the features described in the SRS document.
            </p>
            <p className="text-sm text-muted-foreground">
              For now, you can explore the Dashboard, Products, and Alerts pages which are fully implemented.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
