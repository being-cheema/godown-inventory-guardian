
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PackageCheck, Truck, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: number;
  onStatusChange?: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  orderId,
  onStatusChange
}) => {
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && orderId) {
      setIsLoading(true);
      
      // In a real application, this would fetch from the database
      // For demo purposes, we'll create a mock order
      const mockOrder = {
        order_id: orderId,
        customer_name: "Test Customer",
        order_date: new Date().toISOString(),
        total_amount: 132.45,
        shipping_address: "123 Test St, Test City, TC 12345",
        order_status: "Pending"
      };
      
      const mockOrderItems = [
        { product_name: "Rice", quantity: 2, price: 12.99, total: 25.98 },
        { product_name: "Chicken", quantity: 3, price: 8.99, total: 26.97 },
        { product_name: "Milk", quantity: 1, price: 3.49, total: 3.49 }
      ];
      
      setOrder(mockOrder);
      setOrderItems(mockOrderItems);
      setIsLoading(false);
    }
  }, [isOpen, orderId]);

  const handleUpdateStatus = (newStatus: string) => {
    if (!order) return;
    
    // In a real application, this would update the database
    setOrder({
      ...order,
      order_status: newStatus
    });
    
    toast({
      title: "Status Updated",
      description: `Order has been ${newStatus.toLowerCase()}`,
      variant: "default"
    });
    
    if (onStatusChange) {
      onStatusChange();
    }
  };
  
  const getStatusActions = () => {
    if (!order) return null;
    
    switch (order.order_status.toLowerCase()) {
      case 'pending':
        return (
          <Button onClick={() => handleUpdateStatus('Shipped')} className="gap-2">
            <Truck className="h-4 w-4" />
            Mark as Shipped
          </Button>
        );
      case 'shipped':
        return (
          <Button onClick={() => handleUpdateStatus('Delivered')} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Mark as Delivered
          </Button>
        );
      default:
        return null;
    }
  };
  
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

  if (!order && !isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Order #{orderId}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-8 text-center">Loading order details...</div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="flex justify-between items-center">
                <div className="font-medium">Status</div>
                <Badge className={getStatusBadgeColor(order.order_status)}>
                  {order.order_status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Customer</div>
                  <div className="font-medium">{order.customer_name}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Order Date</div>
                  <div className="font-medium">{new Date(order.order_date).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Shipping Address</div>
                <div className="font-medium">{order.shipping_address}</div>
              </div>
              
              <div className="mt-4">
                <div className="font-medium mb-2">Order Items</div>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted text-xs">
                      <tr>
                        <th className="p-2 text-left">Product</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{item.product_name}</td>
                          <td className="p-2 text-center">{item.quantity}</td>
                          <td className="p-2 text-right">${item.price.toFixed(2)}</td>
                          <td className="p-2 text-right">${item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/50">
                      <tr className="border-t">
                        <td className="p-2 font-medium" colSpan={3}>
                          Total
                        </td>
                        <td className="p-2 text-right font-bold">
                          ${order.total_amount.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={onClose}>Close</Button>
              {getStatusActions()}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;
