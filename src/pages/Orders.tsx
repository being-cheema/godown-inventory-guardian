
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { executeQuery } from '@/lib/database';
import { Order } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const itemsPerPage = 10;
  const { toast } = useToast();
  
  useEffect(() => {
    try {
      // Get orders from database with customer names
      const result = executeQuery(`
        SELECT o.*, c.name as customer_name
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        ORDER BY o.order_date DESC
      `);
      
      if (result.length === 0) {
        setOrders([]);
        return;
      }
      
      const fetchedOrders = result[0].values.map((row: any[]) => ({
        order_id: row[0],
        customer_id: row[1],
        order_date: row[2],
        total_amount: row[3],
        shipping_address: row[4],
        order_status: row[5],
        customer_name: row[6]
      }));
      
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    }
  }, []);
  
  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (`#${order.order_id}`.toLowerCase()).includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? order.order_status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  // Get list of unique statuses for filtering
  const statuses = [...new Set(orders.map(order => order.order_status))].filter(Boolean) as string[];
  
  // Get badge color based on status
  const getStatusBadgeColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status) {
      case 'Delivered':
        return "bg-green-100 text-green-800";
      case 'Shipped':
        return "bg-blue-100 text-blue-800";
      case 'Processing':
        return "bg-purple-100 text-purple-800";
      case 'Pending':
      default:
        return "bg-amber-100 text-amber-800";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold flex items-center">
          <ShoppingCart className="h-7 w-7 mr-2" />
          Orders
        </h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by customer or order ID..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <div className="flex space-x-2">
            <Button 
              variant={statusFilter === '' ? "default" : "outline"} 
              size="sm" 
              className="flex-1"
              onClick={() => setStatusFilter('')}
            >
              All
            </Button>
            {statuses.map(status => (
              <Button 
                key={status} 
                variant={statusFilter === status ? "default" : "outline"} 
                size="sm"
                className="flex-1"
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Order List</span>
            <span className="text-sm font-normal text-muted-foreground">
              Total: {orders.length} orders
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3 font-medium">Order ID</th>
                  <th className="text-left p-3 font-medium">Customer</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Amount</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((order) => (
                  <tr key={order.order_id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">
                      #{order.order_id}
                    </td>
                    <td className="p-3">{order.customer_name || 'N/A'}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {new Date(order.order_date || '').toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3">${order.total_amount?.toFixed(2) || '0.00'}</td>
                    <td className="p-3">
                      <Badge 
                        className={getStatusBadgeColor(order.order_status)}
                      >
                        {order.order_status || 'Pending'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
