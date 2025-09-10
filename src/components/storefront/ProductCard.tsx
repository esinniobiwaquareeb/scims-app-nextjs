'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Package, Heart, Plus, Minus } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface Product {
  id: string;
  name: string;
  description: string;
  public_description?: string;
  price: number;
  image_url?: string;
  public_images?: string[];
  category?: { name: string };
  brand?: { name: string };
  store?: { name: string };
  stock_quantity: number;
  created_at: string;
}

interface Business {
  currency: { symbol: string; code: string };
}

interface ProductCardProps {
  product: Product;
  business: Business;
  onAddToCart: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onRemoveFromWishlist?: (product: Product) => void;
  onUpdateQuantity?: (product: Product, quantity: number) => void;
  cartQuantity?: number;
  isInWishlist?: boolean;
}

export default function ProductCard({ 
  product, 
  business, 
  onAddToCart, 
  onAddToWishlist,
  onRemoveFromWishlist,
  onUpdateQuantity,
  cartQuantity = 0,
  isInWishlist = false
}: ProductCardProps) {
  const isOutOfStock = product.stock_quantity === 0;
  const { isDark } = useTheme();

  return (
    <Card className={`group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col border-0 shadow-md ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Image Section with Overlay */}
      <div className={`relative h-48 bg-gradient-to-br rounded-t-lg overflow-hidden ${
        isDark 
          ? 'from-gray-700 to-gray-800' 
          : 'from-gray-50 to-gray-100'
      }`}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            width={400}
            height={192}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-300" />
          </div>
        )}
        
        {/* Stock Badge */}
        {isOutOfStock && (
          <div className="absolute top-2 right-2">
            <Badge variant="destructive" className="text-xs font-medium">
              Out of Stock
            </Badge>
          </div>
        )}
        
        {/* Category Badge */}
        {product.category && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs font-medium bg-white/90 backdrop-blur-sm">
              {product.category.name}
            </Badge>
          </div>
        )}
        
        {/* Wishlist Button */}
        {onAddToWishlist && onRemoveFromWishlist && (
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant="ghost"
              className={`w-8 h-8 p-0 rounded-full transition-all duration-200 ${
                isInWishlist 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (isInWishlist) {
                  onRemoveFromWishlist(product);
                } else {
                  onAddToWishlist(product);
                }
              }}
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </Button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Title */}
        <div className="mb-2">
          <h3 className={`font-semibold text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {product.name}
          </h3>
        </div>

        {/* Description */}
        <div className="mb-3 flex-1">
          <p className={`text-sm line-clamp-2 leading-relaxed ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {product.public_description || product.description}
          </p>
        </div>

        {/* Price and Actions */}
        <div className="space-y-3">
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              {business.currency.symbol}{product.price.toLocaleString()}
            </span>
            {product.brand && (
              <span className={`text-xs font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {product.brand.name}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {cartQuantity > 0 ? (
            /* Quantity Controls */
            <div className={`flex items-center justify-between rounded-lg p-2 ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <Button
                size="sm"
                variant="ghost"
                className={`w-8 h-8 p-0 rounded-full ${
                  isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                }`}
                onClick={() => onUpdateQuantity?.(product, cartQuantity - 1)}
                disabled={isOutOfStock}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className={`text-sm font-medium px-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{cartQuantity}</span>
              <Button
                size="sm"
                variant="ghost"
                className={`w-8 h-8 p-0 rounded-full ${
                  isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                }`}
                onClick={() => onUpdateQuantity?.(product, cartQuantity + 1)}
                disabled={isOutOfStock || cartQuantity >= product.stock_quantity}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            /* Add to Cart Button */
            <Button 
              onClick={() => onAddToCart(product)}
              className={`w-full text-sm py-2.5 font-medium transition-all duration-200 ${
                isOutOfStock 
                  ? `${
                      isDark 
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }` 
                  : 'bg-primary hover:bg-primary/90 hover:shadow-md active:scale-95'
              }`}
              disabled={isOutOfStock}
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
