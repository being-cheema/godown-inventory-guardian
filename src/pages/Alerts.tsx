
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, BarChart, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLowStockProducts, getExpiringProducts } from '@/lib/database';
import { Product, AlertItem } from '@/types';

const Alerts: React.FC = () => {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [expiringProducts, setExpiringProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    try {
      const fetchedLowStockProducts = getLowStockProducts(150);
      const fetchedExpiringProducts = getExpiringProducts(30);
      
      setLowStockProducts(fetchedLowStockProducts);
      setExpiringProducts(fetchedExpiringProducts);
    } catch (error) {
      console.error("Error fetching alerts data:", error);
    }
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <AlertTriangle className="h-7 w-7 mr-2 text-amber-500" />
          Alerts
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Low Stock Items</p>
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <BarChart className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Expiring Soon</p>
                <p className="text-2xl font-bold">{expiringProducts.length}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="low-stock">
        <TabsList>
          <TabsTrigger value="low-stock" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            Low Stock
          </TabsTrigger>
          <TabsTrigger value="expiring" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Expiring Soon
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="low-stock" className="mt-4">
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-lg flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-amber-500" />
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-3 font-medium">Product</th>
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-left p-3 font-medium">Current Stock</th>
                      <th className="text-left p-3 font-medium">Supplier</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((product) => (
                      <tr key={product.product_id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{product.product_name}</td>
                        <td className="p-3">{product.category || 'N/A'}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                            {product.quantity_in_stock}
                          </span>
                        </td>
                        <td className="p-3">{product.supplier_name || 'N/A'}</td>
                        <td className="p-3">
                          <Button variant="outline" size="sm">
                            Restock
                          </Button>
                        </td>
                      </tr>
                    ))}
                    
                    {lowStockProducts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          No low stock items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expiring" className="mt-4">
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-red-500" />
                Items Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-3 font-medium">Product</th>
                      <th className="text-left p-3 font-medium">Category</th>
                      <th className="text-left p-3 font-medium">Expiry Date</th>
                      <th className="text-left p-3 font-medium">Warehouse</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiringProducts.map((product) => {
                      const expiryDate = new Date(product.expiry_date!);
                      const today = new Date();
                      const diffTime = Math.abs(expiryDate.getTime() - today.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      return (
                        <tr key={product.product_id} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{product.product_name}</td>
                          <td className="p-3">{product.category || 'N/A'}</td>
                          <td className="p-3">
                            <span 
                              className={`px-2 py-1 rounded-full text-xs ${
                                diffDays > 14
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : diffDays > 7
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {product.expiry_date} ({diffDays} days)
                            </span>
                          </td>
                          <td className="p-3">{product.warehouse_name}</td>
                          <td className="p-3">
                            <Button variant="outline" size="sm">
                              Mark for Priority
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    
                    {expiringProducts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          No expiring items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Alert Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Low Stock Threshold</label>
                <Input type="number" defaultValue="150" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Expiry Alert Days</label>
                <Input type="number" defaultValue="30" />
              </div>
            </div>
            
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Temp Input component until we reach that page
const Input = (props: any) => (
  <input
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  />
);

export default Alerts;
