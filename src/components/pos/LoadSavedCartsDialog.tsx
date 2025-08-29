import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Clock } from 'lucide-react';

interface SavedCart {
  id: string;
  cart_name: string;
  created_at: string;
  cart_data?: {
    customer?: {
      id: string;
      name: string;
    };
  };
}

interface LoadSavedCartsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedCarts: SavedCart[];
  onLoadCart: (savedCart: SavedCart) => void;
  onDeleteCart: (cartId: string) => void;
  formatDate: (date: Date) => string;
}

export const LoadSavedCartsDialog: React.FC<LoadSavedCartsDialogProps> = ({
  open,
  onOpenChange,
  savedCarts,
  onLoadCart,
  onDeleteCart,
  formatDate
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Load Saved Cart</DialogTitle>
          <DialogDescription>
            Select a saved cart to load into your current session.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {savedCarts.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No saved carts found.</p>
            </div>
          ) : (
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {savedCarts.map(savedCart => (
                  <div
                    key={savedCart.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => onLoadCart(savedCart)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{savedCart.cart_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Saved on: {formatDate(new Date(savedCart.created_at))}
                      </p>
                      {savedCart.cart_data?.customer && (
                        <p className="text-xs text-muted-foreground">
                          Customer: {savedCart.cart_data.customer.id === 'walk-in' ? 'Walk-in Customer' : savedCart.cart_data.customer.name}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent dialog close
                        onDeleteCart(savedCart.id);
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            {savedCarts.length > 0 && (
              <Button 
                onClick={() => {
                  if (savedCarts.length > 0) {
                    onLoadCart(savedCarts[0]); // Load the first saved cart by default
                  }
                  onOpenChange(false);
                }}
                className="flex-1"
                disabled={savedCarts.length === 0}
              >
                <Clock className="w-4 h-4 mr-2" />
                Load First Saved
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
