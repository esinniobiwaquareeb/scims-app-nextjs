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
      {/* Image Section - Fixed Height */}
      <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content Section - Flexible Height */}
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Header with Title and Category */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-2 flex-1 pr-2">{product.name}</h3>
          {product.category && (
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              {product.category.name}
            </Badge>
          )}
        </div>

        {/* Description - Fixed Height */}
        <div className="h-12 mb-3 overflow-hidden">
          <p className="text-gray-600 text-sm line-clamp-2">
            {product.public_description || product.description}
          </p>
        </div>

        {/* Price and Stock - Fixed Height */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-primary">
            {business.currency.symbol}{product.price.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">
            Stock: {product.stock_quantity}
          </span>
        </div>

        {/* Add to Cart Button - Fixed at Bottom */}
        <div className="mt-auto">
          <Button 
            onClick={() => onAddToCart(product)}
            className="w-full"
            disabled={product.stock_quantity === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
