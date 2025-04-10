
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

interface DeleteSupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  supplierName: string;
}

const DeleteSupplierDialog: React.FC<DeleteSupplierDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  supplierName
}) => {
  const { toast } = useToast();
  
  const handleConfirm = () => {
    try {
      // Call the onConfirm function passed from the parent
      onConfirm();
      
      // Show success toast
      toast({
        title: "Supplier Deleted",
        description: `${supplierName} has been successfully removed.`,
        variant: "default"
      });
      
      // Log to console for verbose output
      console.log(`Supplier "${supplierName}" has been deleted from the database.`);
      
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
