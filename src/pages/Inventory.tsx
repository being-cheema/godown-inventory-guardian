
import React, { useState, useEffect } from 'react';
import { Package, Warehouse, ShoppingCart, Search, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  getInventoryByWarehouse, 
  getWarehouses, 
  getProducts,
  getSuppliers
} from '@/lib/database';
import RestockModal from '@/components/inventory/RestockModal';
import { Warehouse as WarehouseType, InventoryRecord } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useDatabase } from '@/contexts/DatabaseContext';
import OrderModal from '@/components/orders/OrderModal';

const Inventory = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserView, setIsUserView] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { toast } = useToast();
  const { refreshData, lastRefresh } = useDatabase();
  
  // Fetch warehouses and set default selection
  useEffect(() => {
    try {
      const fetchedWarehouses = getWarehouses();
      setWarehouses(fetchedWarehouses);
      
      if (fetchedWarehouses.length > 0 && !selectedWarehouse) {
        setSelectedWarehouse(fetchedWarehouses[0].warehouse_id.toString());
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      toast({
        title: "Error",
        description: "Failed to load warehouses",
        variant: "destructive"
      });
    }
  }, [lastRefresh]);
  
  // Fetch inventory when warehouse selection changes
  useEffect(() => {
    if (selectedWarehouse) {
      try {
        const fetchedInventory = getInventoryByWarehouse(parseInt(selectedWarehouse));
        setInventory(fetchedInventory);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        toast({
          title: "Error",
          description: "Failed to load inventory data",
          variant: "destructive"
        });
      }
    }
  }, [selectedWarehouse, lastRefresh]);
  
  // Filter inventory based on search term
  const filteredInventory = inventory.filter(item => 
    item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleRefresh = () => {
    refreshData();
    toast({
      title: "Refreshed",
      description: "Inventory data has been refreshed",
    });
  };
  
  const handleRestock = (product: any) => {
    setSelectedProduct(product);
    setIsRestockModalOpen(true);
  };
  
  const handleCreateOrder = () => {
    setIsOrderModalOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold flex items-center">
          {isUserView ? (
            <>
              <ShoppingCart className="h-7 w-7 mr-2" />
              Order Products
            </>
          ) : (
            <>
              <Package className="h-7 w-7 mr-2" />
              Inventory Management
            </>
          )}
        </h1>
        <div className="flex space-x-2 items-center">
          <div className="flex items-center space-x-2">
            <Label htmlFor="user-view" className="text-sm font-medium">Staff View</Label>
            <Switch 
              id="user-view" 
              checked={isUserView} 
              onCheckedChange={setIsUserView} 
            />
            <Label htmlFor="user-view" className="text-sm font-medium">Customer View</Label>
          </div>
          
          {isUserView ? (
            <Button onClick={handleCreateOrder}>
              Place Order
            </Button>
          ) : (
            <Button onClick={handleRefresh} variant="outline" size="icon">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {isUserView ? (
        // Customer View
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Available Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => (
                      <TableRow key={item.record_id}>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          {item.quantity_in_stock > 20 ? (
                            <Badge className="bg-green-100 text-green-800">In Stock ({item.quantity_in_stock})</Badge>
                          ) : item.quantity_in_stock > 0 ? (
                            <Badge className="bg-amber-100 text-amber-800">Low Stock ({item.quantity_in_stock})</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell>${item.price?.toFixed(2)}</TableCell>
                        <TableCell>{item.supplier_name}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled={item.quantity_in_stock <= 0}
                            onClick={handleCreateOrder}
                          >
                            Add to Order
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        No inventory records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <OrderModal 
            isOpen={isOrderModalOpen}
            onClose={() => setIsOrderModalOpen(false)}
            onSuccess={() => {
              setIsOrderModalOpen(false);
              refreshData();
              toast({
                title: "Order Placed",
                description: "Your order has been successfully placed",
              });
            }}
          />
        </div>
      ) : (
        // Staff View
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Select Warehouse</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.warehouse_id} value={warehouse.warehouse_id.toString()}>
                        {warehouse.warehouse_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by product name or category..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{warehouses.find(w => w.warehouse_id.toString() === selectedWarehouse)?.warehouse_name} Inventory</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {filteredInventory.length} Products
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.length > 0 ? (
                      filteredInventory.map((item) => (
                        <TableRow key={item.record_id}>
                          <TableCell className="font-medium">{item.product_name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>
                            {item.quantity_in_stock > 20 ? (
                              <Badge className="bg-green-100 text-green-800">{item.quantity_in_stock}</Badge>
                            ) : item.quantity_in_stock > 0 ? (
                              <Badge className="bg-amber-100 text-amber-800">{item.quantity_in_stock}</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">{item.quantity_in_stock}</Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(item.last_updated || '').toLocaleDateString()}</TableCell>
                          <TableCell>
                            {item.expiry_date ? (
                              new Date(item.expiry_date) < new Date() ? (
                                <Badge variant="destructive">Expired</Badge>
                              ) : (
                                new Date(item.expiry_date).toLocaleDateString()
                              )
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell>{item.supplier_name}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRestock(item)}
                            >
                              Restock
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                          No inventory records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Restock Modal */}
      <RestockModal 
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        product={selectedProduct}
        onSuccess={() => {
          setIsRestockModalOpen(false);
          refreshData();
          toast({
            title: "Restock Successful",
            description: `Successfully restocked ${selectedProduct?.product_name}`,
          });
        }}
      />
    </div>
  );
};

export default Inventory;
