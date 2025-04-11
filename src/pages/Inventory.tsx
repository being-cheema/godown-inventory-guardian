import React, { useState, useEffect } from 'react';
import { getWarehouses, getInventoryByWarehouse } from '@/lib/database';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, Calendar, AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import RestockModal from '@/components/inventory/RestockModal';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useToast } from "@/hooks/use-toast";

const Inventory = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
  const { refreshData, lastRefresh } = useDatabase();
  const { toast } = useToast();
  
  useEffect(() => {
    loadWarehouses();
  }, [lastRefresh]);
  
  const loadWarehouses = () => {
    try {
      const fetchedWarehouses = getWarehouses();
      setWarehouses(fetchedWarehouses);
      
      if (fetchedWarehouses.length > 0 && !selectedWarehouse) {
        setSelectedWarehouse(fetchedWarehouses[0].warehouse_id.toString());
        loadInventory(fetchedWarehouses[0].warehouse_id);
      } else if (selectedWarehouse) {
        loadInventory(parseInt(selectedWarehouse));
      }
    } catch (error) {
      console.error('Error loading warehouses:', error);
      toast({
        title: "Error",
        description: "Failed to load warehouses",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  const loadInventory = (warehouseId: number) => {
    setIsLoading(true);
    try {
      console.log(`Loading inventory for warehouse ID ${warehouseId}...`);
      const fetchedInventory = getInventoryByWarehouse(warehouseId);
      console.log(`Retrieved ${fetchedInventory.length} inventory records`);
      setInventory(fetchedInventory);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleWarehouseChange = (value: string) => {
    setSelectedWarehouse(value);
    loadInventory(parseInt(value));
  };
  
  const handleRefresh = () => {
    console.log("Refreshing inventory data...");
    refreshData();
    toast({
      title: "Refreshed",
      description: "Inventory data has been refreshed",
    });
  };
  
  const handleRestock = (productId?: number) => {
    setSelectedProductId(productId);
    setIsRestockModalOpen(true);
  };
  
  const handleRestockSuccess = () => {
    console.log("Restock successful, refreshing inventory...");
    loadInventory(parseInt(selectedWarehouse));
    refreshData();
  };
  
  const isExpiringSoon = (date: string) => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const today = new Date();
    const timeDiff = expiryDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 30 && daysDiff > 0;
  };
  
  const isLowStock = (quantity: number) => {
    return quantity < 100;
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const groupByCategory = () => {
    const grouped: Record<string, any[]> = {};
    inventory.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    });
    return grouped;
  };
  
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Dairy': 'bg-blue-100 text-blue-800',
      'Meat': 'bg-red-100 text-red-800',
      'Vegetables': 'bg-green-100 text-green-800',
      'Fruits': 'bg-yellow-100 text-yellow-800',
      'Grains': 'bg-amber-100 text-amber-800',
      'Bakery': 'bg-orange-100 text-orange-800',
      'Seafood': 'bg-cyan-100 text-cyan-800',
      'Spices': 'bg-purple-100 text-purple-800',
      'Baking': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Package className="mr-2 h-8 w-8" />
          Inventory Management
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => handleRestock()}>
            <Plus className="h-4 w-4 mr-2" />
            Restock Inventory
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-64">
          <label className="text-sm font-medium block mb-2">Select Warehouse</label>
          <Select value={selectedWarehouse} onValueChange={handleWarehouseChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map(warehouse => (
                <SelectItem key={warehouse.warehouse_id} value={warehouse.warehouse_id.toString()}>
                  {warehouse.warehouse_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            <AlertTriangle className="h-3 w-3 mr-1" /> Low Stock: &lt; 100 units
          </Badge>
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            <Calendar className="h-3 w-3 mr-1" /> Expiring Soon: &lt; 30 days
          </Badge>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="byCategory">By Category</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Inventory Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">Loading inventory data...</TableCell>
                      </TableRow>
                    ) : inventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">No inventory items found in this warehouse.</TableCell>
                      </TableRow>
                    ) : (
                      inventory.map(item => (
                        <TableRow key={item.record_id}>
                          <TableCell className="font-medium">{item.product_name}</TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(item.category)}>
                              {item.category || 'Uncategorized'}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.supplier_name || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <span className={isLowStock(item.quantity_in_stock) ? "text-red-600 font-bold" : ""}>
                              {item.quantity_in_stock}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={isExpiringSoon(item.expiry_date) ? "text-orange-600 font-bold" : ""}>
                              {formatDate(item.expiry_date)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">${item.price?.toFixed(2) || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleRestock(item.product_id)}>
                              Restock
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="byCategory" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupByCategory()).map(([category, items]) => (
              <Card key={category}>
                <CardHeader className={`pb-2 ${getCategoryColor(category)}`}>
                  <CardTitle>{category} ({items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead>Expiry</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map(item => (
                          <TableRow key={item.record_id}>
                            <TableCell className="font-medium">{item.product_name}</TableCell>
                            <TableCell className="text-right">
                              <span className={isLowStock(item.quantity_in_stock) ? "text-red-600 font-bold" : ""}>
                                {item.quantity_in_stock}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={isExpiringSoon(item.expiry_date) ? "text-orange-600 font-bold" : ""}>
                                {formatDate(item.expiry_date)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        onSuccess={handleRestockSuccess}
        productId={selectedProductId}
      />
    </div>
  );
};

export default Inventory;
