'use client';

import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface BarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barcodeInput: string;
  onBarcodeInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const BarcodeScannerDialog: React.FC<BarcodeScannerDialogProps> = ({
  open,
  onOpenChange,
  barcodeInput,
  onBarcodeInputChange,
  onSubmit
}) => {
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Barcode Scanner</DialogTitle>
          <DialogDescription>
            Scan a product barcode or enter it manually below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            ref={barcodeInputRef}
            value={barcodeInput}
            onChange={(e) => onBarcodeInputChange(e.target.value)}
            placeholder="Scan or enter barcode..."
            autoFocus
          />
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1"
              disabled={!barcodeInput.trim()}
            >
              <Search className="w-4 h-4 mr-2" />
              Find Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
