import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Tag, 
  Percent, 
  DollarSign, 
  Gift, 
  Package, 
  X, 
  Check,
  AlertCircle,
  Calendar,
  Users
} from 'lucide-react';
import { 
  DiscountApplication, 
  ApplicablePromotion, 
  DiscountValidationResult 
} from '@/types/discount';

interface DiscountApplicationProps {
  businessId: string;
  storeId?: string;
  customerId?: string;
  subtotal: number;
  productIds?: string[];
  onDiscountApplied: (discount: DiscountApplication | null) => void;
  appliedDiscount?: DiscountApplication | null;
  className?: string;
}

export const DiscountApplicationComponent: React.FC<DiscountApplicationProps> = ({
  businessId,
  storeId,
  customerId,
  subtotal,
  productIds,
  onDiscountApplied,
  appliedDiscount,
  className = ''
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [applicablePromotions, setApplicablePromotions] = useState<ApplicablePromotion[]>([]);
  const [isPromotionsDialogOpen, setIsPromotionsDialogOpen] = useState(false);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);

  // Load applicable promotions when component mounts or subtotal changes
  useEffect(() => {
    if (businessId && subtotal > 0) {
      loadApplicablePromotions();
    }
  }, [businessId, subtotal, productIds]);

  const loadApplicablePromotions = async () => {
    setIsLoadingPromotions(true);
    try {
      const response = await fetch('/api/discounts/applicable-promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          store_id: storeId,
          customer_id: customerId,
          subtotal,
          product_ids: productIds
        })
      });

      if (response.ok) {
        const data = await response.json();
        setApplicablePromotions(data.promotions || []);
      }
    } catch (error) {
      console.error('Error loading promotions:', error);
    } finally {
      setIsLoadingPromotions(false);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch('/api/discounts/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupon_code: couponCode.trim(),
          business_id: businessId,
          store_id: storeId,
          customer_id: customerId,
          subtotal
        })
      });

      const data = await response.json();

      if (data.result?.valid) {
        const discount: DiscountApplication = {
          type: 'coupon',
          id: data.result.coupon_id,
          code: couponCode.trim(),
          name: `Coupon: ${couponCode.trim()}`,
          discount_amount: data.result.discount_amount,
          discount_type: data.result.discount_type,
          discount_value: data.result.discount_value
        };

        onDiscountApplied(discount);
        toast.success('Coupon applied successfully!');
        setCouponCode('');
      } else {
        toast.error(data.result?.error || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast.error('Failed to validate coupon');
    } finally {
      setIsValidating(false);
    }
  };

  const applyPromotion = (promotion: ApplicablePromotion) => {
    const discount: DiscountApplication = {
      type: 'promotion',
      id: promotion.id,
      name: promotion.name,
      discount_amount: promotion.discount_amount,
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value
    };

    onDiscountApplied(discount);
    setIsPromotionsDialogOpen(false);
    toast.success('Promotion applied successfully!');
  };

  const removeDiscount = () => {
    onDiscountApplied(null);
    toast.success('Discount removed');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getDiscountTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />;
      case 'fixed_amount':
        return <DollarSign className="h-4 w-4" />;
      case 'buy_x_get_y':
        return <Gift className="h-4 w-4" />;
      case 'bulk_discount':
        return <Package className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getDiscountDisplay = (discount: DiscountApplication) => {
    const icon = getDiscountTypeIcon(discount.discount_type);
    const value = (discount.discount_type === 'percentage' || 
                   discount.discount_type === 'seasonal_discount' ||
                   discount.discount_type === 'loyalty_discount' ||
                   discount.discount_type === 'first_time_buyer' ||
                   discount.discount_type === 'referral_discount')
      ? `${discount.discount_value}%`
      : formatCurrency(discount.discount_value);

    return (
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium">{value}</span>
        <span className="text-sm text-muted-foreground">
          ({formatCurrency(discount.discount_amount)} off)
        </span>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Applied Discount Display */}
      {appliedDiscount && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Discount Applied</span>
                </div>
                <div className="text-sm text-green-700">
                  {appliedDiscount.name}
                </div>
                <div className="text-sm text-green-600">
                  {getDiscountDisplay(appliedDiscount)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeDiscount}
                className="text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coupon Code Input */}
      {!appliedDiscount && (
        <div className="space-y-2">
          <Label htmlFor="coupon-code">Coupon Code</Label>
          <div className="flex gap-2">
            <Input
              id="coupon-code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="font-mono"
              onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
            />
            <Button
              onClick={validateCoupon}
              disabled={isValidating || !couponCode.trim()}
              variant="outline"
            >
              {isValidating ? 'Validating...' : 'Apply'}
            </Button>
          </div>
        </div>
      )}

      {/* Available Promotions */}
      {!appliedDiscount && applicablePromotions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Available Promotions</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPromotionsDialogOpen(true)}
            >
              View All ({applicablePromotions.length})
            </Button>
          </div>
          
          {/* Show top 2 promotions */}
          <div className="space-y-2">
            {applicablePromotions.slice(0, 2).map((promotion) => (
              <Card key={promotion.id} className="cursor-pointer hover:bg-gray-50" onClick={() => applyPromotion(promotion)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{promotion.name}</div>
                      <div className="text-xs text-muted-foreground">{promotion.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        {getDiscountTypeIcon(promotion.discount_type)}
                        {promotion.discount_type === 'percentage' 
                          ? `${promotion.discount_value}%`
                          : formatCurrency(promotion.discount_value)
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Save {formatCurrency(promotion.discount_amount)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Promotions Dialog */}
      <Dialog open={isPromotionsDialogOpen} onOpenChange={setIsPromotionsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Available Promotions</DialogTitle>
            <DialogDescription>
              Choose a promotion to apply to your order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {isLoadingPromotions ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading promotions...</p>
              </div>
            ) : applicablePromotions.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No promotions available for this order</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applicablePromotions.map((promotion) => (
                  <Card key={promotion.id} className="cursor-pointer hover:bg-gray-50" onClick={() => applyPromotion(promotion)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{promotion.name}</div>
                          {promotion.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {promotion.description}
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Min. {formatCurrency(promotion.minimum_purchase_amount)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-lg font-medium">
                            {getDiscountTypeIcon(promotion.discount_type)}
                            {promotion.discount_type === 'percentage' 
                              ? `${promotion.discount_value}%`
                              : formatCurrency(promotion.discount_value)
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Save {formatCurrency(promotion.discount_amount)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
