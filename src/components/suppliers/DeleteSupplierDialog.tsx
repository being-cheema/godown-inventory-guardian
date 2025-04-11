
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { deleteSupplier } from '@/lib/database';

interface DeleteSupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  supplierId: number;
  supplierName: string;
}

const DeleteSupplierDialog: React.FC<DeleteSupplierDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  supplierId,
  supplierName
}) => {
  const { toast } = useToast();
  
  const handleConfirm = () => {
    try {
      // Call the database function to delete the supplier
      if (supplierId) {
        console.log(`Deleting supplier "${supplierName}" (ID: ${supplierId}) from database...`);
        const result = deleteSupplier(supplierId);
        console.log(`Deleted supplier "${supplierName}" (affected ${result} rows)`);
        console.log(`Note: References to this supplier in products and inventory have been set to NULL`);
      }
      
      // Show success toast
      toast({
        title: "Supplier Deleted",
        description: `${supplierName} has been successfully removed.`,
        variant: "default"
      });
      
      // Call the onConfirm function passed from the parent
      onConfirm();
      
      // Close the dialog
      onClose();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast({
        title: "Error",
        description: "Failed to delete supplier. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Supplier</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{supplierName}"? This action cannot be undone.
            All references to this supplier in products and inventory will be removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSupplierDialog;
