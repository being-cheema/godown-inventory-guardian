
import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getSuppliers } from '@/lib/database';
import { Supplier } from '@/types';
import { useToast } from '@/hooks/use-toast';
import SupplierModal from '@/components/suppliers/SupplierModal';
import DeleteSupplierDialog from '@/components/suppliers/DeleteSupplierDialog';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>(undefined);
  const itemsPerPage = 10;
  const { toast } = useToast();
  
  const fetchSuppliers = () => {
    try {
      const fetchedSuppliers = getSuppliers();
      setSuppliers(fetchedSuppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast({
        title: "Error",
        description: "Failed to load suppliers",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    fetchSuppliers();
  }, []);
  
  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSuppliers.slice(indexOfFirstItem, indexOfLastItem);
  
  const handleAddSupplier = () => {
    setSelectedSupplier(undefined);
    setIsModalOpen(true);
  };
  
  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (selectedSupplier) {
      // In a real app, this would delete from the database
      setSuppliers(suppliers.filter(s => s.supplier_id !== selectedSupplier.supplier_id));
      toast({
        title: "Success",
        description: "Supplier deleted successfully"
      });
    }
    setIsDeleteDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold flex items-center">
          <Truck className="h-7 w-7 mr-2" />
          Suppliers
        </h1>
        <Button onClick={handleAddSupplier}>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search suppliers..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Card>
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-lg">Supplier List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3 font-medium">Company Name</th>
                  <th className="text-left p-3 font-medium">Contact Person</th>
                  <th className="text-left p-3 font-medium">Contact</th>
                  <th className="text-left p-3 font-medium">Location</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((supplier) => (
                  <tr key={supplier.supplier_id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{supplier.supplier_name}</td>
                    <td className="p-3">
                      {supplier.first_name && supplier.last_name 
                        ? `${supplier.first_name} ${supplier.last_name}`
                        : 'N/A'
                      }
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col space-y-1">
                        {supplier.contact_phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                            {supplier.contact_phone}
                          </div>
                        )}
                        {supplier.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                            {supplier.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>
                          {[
                            supplier.city, 
                            supplier.state, 
                            supplier.country
                          ].filter(Boolean).join(', ') || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditSupplier(supplier)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(supplier)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      No suppliers found
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
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSuppliers.length)} of {filteredSuppliers.length} suppliers
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
      
      {/* Supplier Modal */}
      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        supplier={selectedSupplier}
        onSuccess={fetchSuppliers}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteSupplierDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        supplierName={selectedSupplier?.supplier_name || ''}
      />
    </div>
  );
};

export default Suppliers;
