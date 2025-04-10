
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
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSupplierDialog;
