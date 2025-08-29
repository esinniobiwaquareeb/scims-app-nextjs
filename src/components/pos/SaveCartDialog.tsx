import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  created_at: string;
}

interface SaveCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCustomer: Customer | null;
  cartItemCount: number;
  cartTotal: number;
  onSelectCustomer: () => void;
  onSaveCart: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
}

export const SaveCartDialog: React.FC<SaveCartDialogProps> = ({
  open,
  onOpenChange,
  selectedCustomer,
  cartItemCount,
  cartTotal,
  onSelectCustomer,
  onSaveCart,
  formatCurrency,
  formatDate,
  formatTime
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Save Cart for Later</DialogTitle>
          <DialogDescription>
            Save your current cart to retrieve it later.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cart Name (Auto-generated)</Label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="font-medium text-sm text-gray-700">
                {selectedCustomer?.id === 'walk-in' ? 'Walk-in' : selectedCustomer?.name?.split(' ')[0] || 'Customer'} - {cartItemCount} items - {formatCurrency(cartTotal)} - {formatDate(new Date())} {formatTime(new Date())}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This name will be automatically generated based on customer, items, and time
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Customer</Label>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-sm">{selectedCustomer?.name}</p>
                {selectedCustomer?.phone && (
                  <p className="text-xs text-muted-foreground">{selectedCustomer.phone}</p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onSelectCustomer}
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Change
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cart Summary</Label>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between text-sm">
                <span>Items:</span>
                <span className="font-medium">{cartItemCount} products</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total:</span>
                <span className="font-medium">{formatCurrency(cartTotal)}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Saved carts will be available for loading later.
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={onSaveCart}
              className="flex-1"
              disabled={cartItemCount === 0}
            >
              Save Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
