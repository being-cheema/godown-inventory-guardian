
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCustomers, getProducts, addOrder, addOrderItems, updateInventoryRecord, getInventoryByWarehouse } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([{ product_id: '', quantity: 1 }]);
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      try {
        const fetchedCustomers = getCustomers();
        const fetchedProducts = getProducts();
        setCustomers(fetchedCustomers);
        setProducts(fetchedProducts);
        
        // Set default values
        if (fetchedCustomers.length > 0) {
          setSelectedCustomer(fetchedCustomers[0].customer_id.toString());
          setShippingAddress(fetchedCustomers[0].shipping_address || '');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load customers or products",
          variant: "destructive"
        });
      }
    }
  }, [isOpen]);

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId);
    const customer = customers.find(c => c.customer_id.toString() === customerId);
    if (customer && customer.shipping_address) {
      setShippingAddress(customer.shipping_address);
    } else {
      setShippingAddress('');
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleItemChange = (index: number, field: 'product_id' | 'quantity', value: string | number) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      if (!item.product_id) return total;
      const product = products.find(p => p.product_id.toString() === item.product_id.toString());
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = () => {
    // Validate
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive"
      });
      return;
    }

    if (orderItems.length === 0 || !orderItems.every(item => item.product_id && item.quantity > 0)) {
      toast({
        title: "Error",
        description: "Please add at least one valid product",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Creating new order in database...");
      
      // Calculate total amount
      const totalAmount = calculateTotal();
      
      // Create order record
      const orderId = addOrder({
        customer_id: parseInt(selectedCustomer),
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        order_status: 'Pending'
      });
      
      console.log(`Order created with ID: ${orderId}`);
      
      // Prepare order items
      const orderItemsToAdd = orderItems.map(item => {
        const product = products.find(p => p.product_id.toString() === item.product_id.toString());
        return {
          order_id: orderId,
          product_id: parseInt(item.product_id),
          quantity_ordered: item.quantity,
          item_price: product ? product.price : 0,
          total_price: product ? product.price * item.quantity : 0
        };
      });
      
      // Add order items
      const itemsAdded = addOrderItems(orderItemsToAdd);
      console.log(`Added ${itemsAdded} items to order #${orderId}`);
      
      // Update inventory records (deduct stock)
      orderItems.forEach(item => {
        const productId = parseInt(item.product_id);
        const quantity = item.quantity;
        
        // Get inventory records for this product (using first warehouse for simplicity)
        const warehouseId = 1; // Using first warehouse for demo
        const inventory = getInventoryByWarehouse(warehouseId);
        const inventoryRecord = inventory.find(record => record.product_id === productId);
        
        if (inventoryRecord) {
          // Update inventory record with reduced quantity
          const newQuantity = Math.max(0, inventoryRecord.quantity_in_stock - quantity);
          updateInventoryRecord({
            ...inventoryRecord,
            quantity_in_stock: newQuantity
          });
          
          console.log(`Updated inventory: Product ID ${productId} - New quantity: ${newQuantity}`);
        }
      });
      
      // Show success message
      toast({
        title: "Success",
        description: `Order #${orderId} created successfully`
      });
      
      // Reset form
      setSelectedCustomer('');
      setShippingAddress('');
      setOrderItems([{ product_id: '', quantity: 1 }]);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer</label>
            <Select value={selectedCustomer} onValueChange={handleCustomerChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.customer_id} value={customer.customer_id.toString()}>
                    {customer.name || `${customer.first_name} ${customer.last_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Shipping Address</label>
            <Input 
              value={shippingAddress} 
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Shipping address"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Order Items</label>
              <Button type="button" size="sm" onClick={handleAddItem}>Add Item</Button>
            </div>
            
            {orderItems.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-grow">
                  <Select 
                    value={item.product_id.toString()} 
                    onValueChange={(value) => handleItemChange(index, 'product_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.product_id} value={product.product_id.toString()}>
                          {product.product_name} (${product.price.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-20">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveItem(index)}
                  disabled={orderItems.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="text-right font-bold">
            Total: ${calculateTotal().toFixed(2)}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;
