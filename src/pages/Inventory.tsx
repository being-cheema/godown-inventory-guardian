
import React, { useState, useEffect } from 'react';
import { 
  Warehouse, 
  Filter, 
  Search, 
  RefreshCw, 
  PlusCircle
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
import { getInventoryByWarehouse, getWarehouses } from '@/lib/database';
import { InventoryRecord, Warehouse as WarehouseType } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Inventory: React.FC = () => {
  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    try {
      const fetchedWarehouses = getWarehouses();
      setWarehouses(fetchedWarehouses);
      
      // Set default warehouse if available
      if (fetchedWarehouses.length > 0) {
        setSelectedWarehouse(fetchedWarehouses[0].warehouse_id?.toString() || '');
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      toast({
        title: "Error",
        description: "Failed to load warehouses",
        variant: "destructive"
      });
    }
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      try {
        const warehouseId = parseInt(selectedWarehouse);
        const fetchedInventory = getInventoryByWarehouse(warehouseId);
        setInventoryRecords(fetchedInventory);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        toast({
          title: "Error",
          description: "Failed to load inventory records",
          variant: "destructive"
        });
      }
    }
  }, [selectedWarehouse]);

  // Filter inventory based on search term
  const filteredInventory = inventoryRecords.filter(record => 
    record.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string | undefined) => {
    if (!expiryDate) return null;
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = Math.abs(expiry.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Get badge color based on expiry
  const getExpiryBadgeColor = (expiryDate: string | undefined) => {
    if (!expiryDate) return "bg-gray-100 text-gray-800";
    
    const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
    
    if (!daysUntilExpiry) return "bg-gray-100 text-gray-800";
    
    if (daysUntilExpiry <= 7) return "bg-red-100 text-red-800";
    if (daysUntilExpiry <= 30) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold flex items-center">
          <Warehouse className="h-7 w-7 mr-2" />
          Inventory Management
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Inventory
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter by Warehouse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedWarehouse}
                onValueChange={setSelectedWarehouse}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem 
                      key={warehouse.warehouse_id} 
                      value={warehouse.warehouse_id?.toString() || ''}
                    >
                      {warehouse.warehouse_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search inventory..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle>
            Inventory Items
            {selectedWarehouse && (
              <Badge variant="outline" className="ml-2">
                {warehouses.find(w => w.warehouse_id === parseInt(selectedWarehouse))?.warehouse_name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Quantity</th>
                  <th className="text-left p-3 font-medium">Price</th>
                  <th className="text-left p-3 font-medium">Last Updated</th>
                  <th className="text-left p-3 font-medium">Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((record) => (
                  <tr key={record.record_id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{record.product_name}</td>
                    <td className="p-3">{record.category || 'N/A'}</td>
                    <td className="p-3">
                      <Badge 
                        className={`
                          ${record.quantity_in_stock > 150 
                            ? 'bg-green-100 text-green-800' 
                            : record.quantity_in_stock > 50 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                          }`
                        }
                      >
                        {record.quantity_in_stock}
                      </Badge>
                    </td>
                    <td className="p-3">${record.price?.toFixed(2) || 'N/A'}</td>
                    <td className="p-3">{record.last_updated?.split(' ')[0] || 'N/A'}</td>
                    <td className="p-3">
                      {record.expiry_date ? (
                        <Badge className={getExpiryBadgeColor(record.expiry_date)}>
                          {record.expiry_date} 
                          {getDaysUntilExpiry(record.expiry_date) !== null && (
                            <span className="ml-1">
                              ({getDaysUntilExpiry(record.expiry_date)} days)
                            </span>
                          )}
                        </Badge>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))}
                
                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">
                      {selectedWarehouse 
                        ? 'No inventory records found in this warehouse' 
                        : 'Please select a warehouse to view inventory'
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
