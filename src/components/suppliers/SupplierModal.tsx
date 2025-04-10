
import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Supplier } from '@/types';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier;
  onSuccess: () => void;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ 
  isOpen, 
  onClose, 
  supplier, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    supplier_name: '',
    first_name: '',
    last_name: '',
    contact_phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: ''
  });
  
  const { toast } = useToast();
  
  useEffect(() => {
    if (supplier) {
      setFormData({
        supplier_name: supplier.supplier_name || '',
        first_name: supplier.first_name || '',
        last_name: supplier.last_name || '',
        contact_phone: supplier.contact_phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        city: supplier.city || '',
        state: supplier.state || '',
        country: supplier.country || ''
      });
    } else {
      setFormData({
        supplier_name: '',
        first_name: '',
        last_name: '',
        contact_phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        country: ''
      });
    }
  }, [supplier, isOpen]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplier_name.trim()) {
      toast({
        title: "Error",
        description: "Supplier name is required",
        variant: "destructive"
      });
      return;
    }
    
    // In a real application, this would save to the database
    // For demo purposes, we'll just show a success message
    toast({
      title: "Success",
      description: supplier 
        ? "Supplier updated successfully" 
        : "Supplier added successfully"
    });
    
    onSuccess();
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {supplier ? 'Edit Supplier' : 'Add New Supplier'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="supplier_name">Company Name *</Label>
              <Input
                id="supplier_name"
                name="supplier_name"
                value={formData.supplier_name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contact_phone">Phone</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {supplier ? 'Update' : 'Add'} Supplier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierModal;
