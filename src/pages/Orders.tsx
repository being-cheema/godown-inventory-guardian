
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Calendar, 
  Check, 
  TrendingUp,
  Search,
  Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { getRecentOrders } from '@/lib/database';
import { runInventoryTests } from '@/lib/queryUtils';
import { Order } from '@/types';
import OrderModal from '@/components/orders/OrderModal';
import OrderDetailModal from '@/components/orders/OrderDetailModal';
import { useToast } from '@/hooks/use-toast';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(undefined);
  const [isVerboseOutput, setIsVerboseOutput] = useState(true);
  const { toast } = useToast();
  
  const fetchOrders = () => {
    try {
      console.log("Fetching recent orders from database...");
      const fetchedOrders = getRecentOrders(50);
      setOrders(fetchedOrders);
      console.log(`Retrieved ${fetchedOrders.length} orders`);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_id?.toString().includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (order.order_status?.toLowerCase() === statusFilter.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusBadgeColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };
  
  const handleRunTests = () => {
    console.clear(); // Clear console before running tests
    console.log("=== Starting Inventory System Tests ===");
    runInventoryTests(isVerboseOutput);
    
    toast({
      title: "Tests Running",
      description: "Check the console for detailed results",
    });
  };
  
  const handleViewOrder = (orderId: number) => {
    console.log(`Viewing order details for order #${orderId}`);
    setSelectedOrderId(orderId);
    setIsDetailModalOpen(true);
  };
  
  const handleCreateOrder = () => {
    console.log("Opening create order modal");
    setIsCreateModalOpen(true);
  };
  
  const handleOrderStatusChange = () => {
    console.log("Order status changed, refreshing orders list");
    fetchOrders();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold flex items-center">
          <ShoppingCart className="h-7 w-7 mr-2" />
          Orders
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRunTests}>
            <Play className="h-4 w-4 mr-2" />
            Run Inventory Tests
          </Button>
          <Button onClick={handleCreateOrder}>
            Create Order
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Pending</p>
                <p className="text-2xl font-bold">
                  {orders.filter(order => order.order_status === 'Pending').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Shipped</p>
                <p className="text-2xl font-bold">
                  {orders.filter(order => order.order_status === 'Shipped').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Delivered</p>
                <p className="text-2xl font-bold">
                  {orders.filter(order => order.order_status === 'Delivered').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-md">Filter Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by order ID or customer name..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle>Order List</CardTitle>
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
                {filteredOrders.map((order) => (
                  <tr key={order.order_id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">#{order.order_id}</td>
                    <td className="p-3">{order.customer_name}</td>
                    <td className="p-3">{new Date(order.order_date || '').toLocaleDateString()}</td>
                    <td className="p-3">${order.total_amount?.toFixed(2)}</td>
                    <td className="p-3">
                      <Badge className={getStatusBadgeColor(order.order_status)}>
                        {order.order_status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewOrder(order.order_id as number)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Create Order Modal */}
      <OrderModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchOrders}
      />
      
      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        orderId={selectedOrderId}
        onStatusChange={handleOrderStatusChange}
      />
    </div>
  );
};

export default Orders;
