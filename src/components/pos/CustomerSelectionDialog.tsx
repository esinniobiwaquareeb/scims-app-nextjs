import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, Phone, UserPlus } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  created_at: string;
}

interface CustomerSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  selectedCustomer: Customer | null;
  customerSearchTerm: string;
  customerName: string;
  customerPhone: string;
  onCustomerSearchChange: (term: string) => void;
  onCustomerNameChange: (name: string) => void;
  onCustomerPhoneChange: (phone: string) => void;
  onSelectCustomer: (customer: Customer) => void;
  onAddCustomer: () => void;
}

export const CustomerSelectionDialog: React.FC<CustomerSelectionDialogProps> = ({
  open,
  onOpenChange,
  customers,
  selectedCustomer,
  customerSearchTerm,
  customerName,
  customerPhone,
  onCustomerSearchChange,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onSelectCustomer,
  onAddCustomer
}) => {
  const filteredCustomers = customers.filter(customer => {
    if (!customerSearchTerm.trim()) return true;
    const searchLower = customerSearchTerm.toLowerCase();
    return customer.name.toLowerCase().includes(searchLower) ||
           customer.phone.includes(customerSearchTerm.trim());
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Select Customer</DialogTitle>
          <DialogDescription>
            Choose a customer or create a new one for this transaction.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Customer Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search customers..."
              value={customerSearchTerm}
              onChange={(e) => onCustomerSearchChange(e.target.value)}
              className="pl-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>

          {/* Customer List */}
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {filteredCustomers.map(customer => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => onSelectCustomer(customer)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{customer.name}</p>
                    {customer.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </p>
                    )}
                  </div>
                  {selectedCustomer?.id === customer.id && (
                    <Badge variant="default">Selected</Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator />

          {/* Add New Customer */}
          <div className="space-y-3">
            <Label className="font-medium">Add New Customer</Label>
            <div className="space-y-2">
              <Input
                placeholder="Customer name"
                value={customerName}
                onChange={(e) => onCustomerNameChange(e.target.value)}
              />
              <Input
                placeholder="Phone number"
                value={customerPhone}
                onChange={(e) => onCustomerPhoneChange(e.target.value)}
              />
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={onAddCustomer}
              className="flex-1"
              disabled={!customerName.trim() || !customerPhone.trim()}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
