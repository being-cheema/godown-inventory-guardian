
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown,
  ShoppingCart,
  Clock,
  BarChart2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  getProducts,
  getLowStockProducts,
  getExpiringProducts,
  getRecentOrders
} from '@/lib/database';
import { Product, Order, AlertItem } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [expiringProducts, setExpiringProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [alertItems, setAlertItems] = useState<AlertItem[]>([]);
  
  useEffect(() => {
    try {
      // Fetch dashboard data
      const fetchedProducts = getProducts();
      const fetchedLowStockProducts = getLowStockProducts(150);
      const fetchedExpiringProducts = getExpiringProducts(30);
      const fetchedRecentOrders = getRecentOrders(5);
      
      setProducts(fetchedProducts);
      setLowStockProducts(fetchedLowStockProducts);
      setExpiringProducts(fetchedExpiringProducts);
      setRecentOrders(fetchedRecentOrders);
      
      // Create alert items
      const alerts: AlertItem[] = [
        ...fetchedLowStockProducts.map(product => ({
          type: 'low-stock' as const,
          product_id: product.product_id!,
          product_name: product.product_name,
          quantity: product.quantity_in_stock
        })),
        ...fetchedExpiringProducts.map(product => {
          const expiryDate = new Date(product.expiry_date!);
          const today = new Date();
          const diffTime = Math.abs(expiryDate.getTime() - today.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          return {
            type: 'expiring' as const,
            product_id: product.product_id!,
            product_name: product.product_name,
            expiry_date: product.expiry_date,
            days_remaining: diffDays
          };
        })
      ];
      
      setAlertItems(alerts);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, []);
  
  // Prepare chart data
  const chartData = products.slice(0, 10).map(product => ({
    name: product.product_name,
    stock: product.total_stock || 0
  }));
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Low Stock Items</p>
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-amber-500" />
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
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Recent Orders</p>
                <p className="text-2xl font-bold">{recentOrders.length}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Alerts */}
      {alertItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            Active Alerts
          </h2>
          <div className="space-y-3">
            {alertItems.slice(0, 5).map((alert, index) => (
              <Alert key={index} variant={alert.type === 'low-stock' ? 'default' : 'destructive'}>
                <AlertTitle>
                  {alert.type === 'low-stock' ? 'Low Stock Alert' : 'Expiry Alert'}
                </AlertTitle>
                <AlertDescription>
                  {alert.type === 'low-stock' 
                    ? `${alert.product_name} is running low (${alert.quantity} units left)`
                    : `${alert.product_name} will expire in ${alert.days_remaining} days (${alert.expiry_date})`
                  }
                </AlertDescription>
              </Alert>
            ))}
            {alertItems.length > 5 && (
              <p className="text-sm text-muted-foreground">
                + {alertItems.length - 5} more alerts. View all in Alerts section.
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Inventory level chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart2 className="h-5 w-5 mr-2" />
            Inventory Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Order ID</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.order_id} className="border-b hover:bg-gray-50">
                    <td className="p-2">#{order.order_id}</td>
                    <td className="p-2">{order.customer_name}</td>
                    <td className="p-2">{new Date(order.order_date!).toLocaleDateString()}</td>
                    <td className="p-2">${order.total_amount.toFixed(2)}</td>
                    <td className="p-2">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.order_status === 'Delivered' 
                            ? 'bg-green-100 text-green-800' 
                            : order.order_status === 'Shipped' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
