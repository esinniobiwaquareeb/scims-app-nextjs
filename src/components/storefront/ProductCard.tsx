'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Package } from 'lucide-react';

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
}

export default function ProductCard({ product, business, onAddToCart }: ProductCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Image Section - Smaller Height */}
      <div className="h-48 bg-gray-100 rounded-t-lg overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content Section - Fixed Height Structure */}
      <CardContent className="p-3 flex flex-col h-48">
        {/* Header with Title and Category - Fixed Height */}
        <div className="flex justify-between items-start mb-2 h-12">
          <h3 className="font-semibold text-base line-clamp-2 flex-1 pr-2 leading-tight">{product.name}</h3>
          {product.category && (
            <Badge variant="secondary" className="ml-2 flex-shrink-0 text-xs">
              {product.category.name}
            </Badge>
          )}
        </div>

        {/* Description - Fixed Height */}
        <div className="h-10 mb-3 overflow-hidden">
          <p className="text-gray-600 text-xs line-clamp-2 leading-tight">
            {product.public_description || product.description}
          </p>
        </div>

        {/* Price - Fixed Height */}
        <div className="flex justify-between items-center mb-3 h-6">
          <span className="text-lg font-bold text-primary">
            {business.currency.symbol}{product.price.toLocaleString()}
          </span>
        </div>

        {/* Add to Cart Button - Fixed at Bottom */}
        <div className="mt-auto">
          <Button 
            onClick={() => onAddToCart(product)}
            className="w-full text-sm py-2"
            disabled={product.stock_quantity === 0}
            size="sm"
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
