'use client';

import React, { useRef } from 'react';
import { useSystem } from '@/contexts/SystemContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Search, Filter, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  sku: string;
  barcode?: string;
  description?: string;
  stock_quantity: number;
  category_id?: string;
  category?: { id: string; name: string };
  supplier_id?: string;
  supplier?: { id: string; name: string };
  brand_id?: string;
  brand?: { id: string; name: string };
  is_active: boolean;
  image_url?: string;
}

interface ProductGridProps {
  products: Product[];
  categories: string[];
  searchTerm: string;
  selectedCategory: string;
  onSearchChange: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onProductClick: (product: Product) => void;
  onScanBarcode: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  searchTerm,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onProductClick,
  onScanBarcode
}) => {
  const { translate, formatCurrency } = useSystem();
  const productScrollRef = useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (product.barcode && product.barcode.includes(searchTerm)) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 w-full flex flex-col space-y-2 min-h-0">
      {/* Search and Filter Controls */}
      <Card className="flex-shrink-0 border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
        <CardContent className="p-2 sm:p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <Input
                placeholder={translate('pos.searchProducts') || 'Search products...'}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 sm:pl-10 pr-16 sm:pr-20 h-9 sm:h-10 text-sm sm:text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-sm transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-12 sm:right-16 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
              <Button
                onClick={onScanBarcode}
                size="sm"
                variant="outline"
                className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 h-7 sm:h-8 px-1.5 sm:px-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300"
                title="Scan Barcode"
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </Button>
            </div>
            
            {/* Category Filter */}
            <div className="w-full sm:w-44">
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-full h-9 sm:h-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-sm transition-all duration-200 text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                  <SelectValue placeholder={translate('pos.allCategories') || 'All Categories'} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Search Results Summary */}
          {searchTerm && (
            <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-600/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredProducts.length} of {products.length} products
                {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Grid Container */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full" ref={productScrollRef}>
          <div style={{ minHeight: 'fit-content' }}>
            {filteredProducts.length === 0 ? (
              <Card className="border-0 shadow-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="text-muted-foreground">
                    <Filter className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-40" />
                    <p className="text-sm sm:text-base font-medium mb-1 text-gray-900 dark:text-gray-100">{translate('pos.noProductsFound') || 'No products found'}</p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Try adjusting your search terms or category filter</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-2.5 md:gap-3 pb-4">
                {filteredProducts.map(product => (
                  <Card 
                    key={`${product.id}-${product.stock_quantity}`} 
                    className={`transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation group border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md active:shadow-sm ${
                      product.stock_quantity <= 0 
                        ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' 
                        : 'cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600 active:bg-gray-100 dark:active:bg-gray-600'
                    }`}
                    onClick={() => product.stock_quantity > 0 && onProductClick(product)}
                  >
                    <CardContent className="p-2 sm:p-2.5 md:p-3">
                      <div className="aspect-square mb-2 sm:mb-2.5 md:mb-3 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                        <ImageWithFallback
                          src={product.image_url || undefined}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                          <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 md:top-2 md:right-2">
                            <Badge variant="destructive" className="text-[9px] sm:text-[10px] md:text-xs px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-0.5 md:py-1 font-medium">
                              Low
                            </Badge>
                          </div>
                        )}
                        {product.stock_quantity <= 0 && (
                          <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 md:top-2 md:right-2">
                            <Badge variant="secondary" className="text-[9px] sm:text-[10px] md:text-xs px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-0.5 md:py-1 font-medium bg-gray-500 dark:bg-gray-600 text-white">
                              Out
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-0.5 sm:space-y-1">
                        <p className="font-medium text-[11px] sm:text-xs md:text-sm line-clamp-2 leading-tight text-gray-900 dark:text-gray-100 min-h-[2.5em]">{product.name}</p>
                        <p className="text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(product.price)}
                        </p>
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {product.stock_quantity} in stock
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
