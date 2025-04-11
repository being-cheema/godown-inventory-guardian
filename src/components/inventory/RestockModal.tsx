
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  getProducts,
  getSuppliers,
  getWarehouses,
  addInventoryRecord,
  getInventoryByProduct
} from '@/lib/database';
import { useToast } from '@/hooks/use-toast';
import { Product, Supplier, Warehouse } from '@/types';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId?: number;
}

const RestockModal: React.FC<RestockModalProps> = ({ isOpen, onClose, onSuccess, productId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(100);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Set default expiry date to 1 year from now
  useEffect(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    setExpiryDate(date.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (isOpen) {
      try {
        console.log("Loading data for restock form...");
        const fetchedProducts = getProducts();
        const fetchedSuppliers = getSuppliers();
        const fetchedWarehouses = getWarehouses();
        
        setProducts(fetchedProducts);
        setSuppliers(fetchedSuppliers);
        setWarehouses(fetchedWarehouses);
        
        // Set default values
        if (productId) {
          setSelectedProduct(productId.toString());
          updateCurrentStock(productId);
          
          // Find the default supplier for this product
          const product = fetchedProducts.find(p => p.product_id === productId);
          if (product && product.supplier_id) {
            setSelectedSupplier(product.supplier_id.toString());
          } else if (fetchedSuppliers.length > 0) {
            setSelectedSupplier(fetchedSuppliers[0].supplier_id?.toString() || '');
          }
        } else if (fetchedProducts.length > 0) {
          setSelectedProduct(fetchedProducts[0].product_id?.toString() || '');
          updateCurrentStock(fetchedProducts[0].product_id as number);
          
          if (fetchedProducts[0].supplier_id && fetchedProducts[0].supplier_id > 0) {
            setSelectedSupplier(fetchedProducts[0].supplier_id.toString());
          } else if (fetchedSuppliers.length > 0) {
            setSelectedSupplier(fetchedSuppliers[0].supplier_id?.toString() || '');
          }
        }
        
        if (fetchedWarehouses.length > 0) {
          setSelectedWarehouse(fetchedWarehouses[0].warehouse_id?.toString() || '');
        }
      } catch (error) {
        console.error("Error fetching data for restock form:", error);
        toast({
          title: "Error",
          description: "Failed to load form data",
          variant: "destructive"
        });
      }
    }
  }, [isOpen, productId]);

  const updateCurrentStock = (productId: number) => {
    if (!productId) return;
    
    const inventoryRecords = getInventoryByProduct(productId);
    const totalStock = inventoryRecords.reduce((sum, record) => sum + record.quantity_in_stock, 0);
    setCurrentStock(totalStock);
  };

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    updateCurrentStock(parseInt(productId));
    
    // Update supplier based on product selection
    const product = products.find(p => p.product_id?.toString() === productId);
    if (product && product.supplier_id) {
      setSelectedSupplier(product.supplier_id.toString());
    }
  };

  const handleSubmit = () => {
    if (!selectedProduct || !selectedSupplier || !selectedWarehouse || !quantity || !expiryDate) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Adding inventory stock to database...");
      
      const result = addInventoryRecord({
        product_id: parseInt(selectedProduct),
        warehouse_id: parseInt(selectedWarehouse),
        quantity_in_stock: quantity,
        expiry_date: expiryDate,
        supplier_id: parseInt(selectedSupplier)
      });
      
      console.log(`Inventory record added. Rows modified: ${result}`);
      
      toast({
        title: "Stock Added",
        description: `Successfully added ${quantity} units to inventory`,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding inventory:", error);
      toast({
        title: "Error",
        description: "Failed to add inventory",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductDetails = () => {
    const product = products.find(p => p.product_id?.toString() === selectedProduct);
    if (!product) return null;
    
    return (
      <div className="text-sm space-y-1 mt-2 p-2 bg-muted rounded-md">
        <p>Price: ${product.price.toFixed(2)}</p>
        <p>Category: {product.category || 'N/A'}</p>
        <p>Current Stock: {currentStock} units</p>
        <p>Supplier: {product.supplier_name || 'N/A'}</p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Restock Inventory</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Product</label>
            <Select value={selectedProduct} onValueChange={handleProductChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.product_id} value={product.product_id?.toString() || ''}>
                    {product.product_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProduct && getProductDetails()}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Supplier</label>
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.supplier_id} value={supplier.supplier_id?.toString() || ''}>
                    {supplier.supplier_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Warehouse</label>
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger>
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map(warehouse => (
                  <SelectItem key={warehouse.warehouse_id} value={warehouse.warehouse_id?.toString() || ''}>
                    {warehouse.warehouse_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity to Add</label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Expiry Date</label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Adding Stock...' : 'Add Stock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RestockModal;
