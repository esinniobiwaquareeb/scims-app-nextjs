import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis 
} from '../ui/pagination';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTablePaginationConfig } from './TableConfig';

interface Column<T> {
  key?: string;
  label?: string;
  header?: string;
  accessorKey?: string;
  render?: (item: T) => React.ReactNode;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string; // Column width (e.g., "200px", "20%", "auto")
  minWidth?: string; // Minimum column width (e.g., "120px")
  maxWidth?: string; // Maximum column width (e.g., "300px")
}

/**
 * Enhanced DataTable component with responsive design and horizontal scrolling
 * 
 * Features:
 * - Responsive design with mobile card view (small screens only)
 * - Horizontal scrolling for wide tables
 * - Column width control
 * - Scroll indicators
 * - Mobile-friendly toggle (hidden on large screens)
 * 
 * Usage example:
 * ```tsx
 * const columns = [
 *   {
 *     key: 'name',
 *     label: 'Name',
 *     width: '200px',
 *     minWidth: '150px'
 *   },
 *   {
 *     key: 'description',
 *     label: 'Description',
 *     width: '300px',
 *     minWidth: '200px'
 *   }
 * ];
 * 
 * <DataTable
 *   title="Products"
 *   data={products}
 *   columns={columns}
 *   searchable={true}
 * />
 * ```
 */
interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
  onExport?: (event?: React.MouseEvent) => void;
  height?: number;
  emptyMessage?: string | React.ReactNode;
  tableName?: 'activityLogs' | 'products' | 'customers' | 'suppliers' | 'brands' | 'businesses' | 'subscriptionPlans' | 'staff' | 'categories' | 'cashiers' | 'reports' | 'superadmin' | 'sales' | 'stores';
  userRole?: string;
  pagination?: {
    enabled?: boolean;
    pageSize?: number;
    pageSizeOptions?: number[];
    showPageSizeSelector?: boolean;
    showPageInfo?: boolean;
    maxVisiblePages?: number;
  };
}

export function DataTable<T extends { id: string }>({
  title,
  data,
  columns,
  searchable = false,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  actions,
  onExport,
  height = 600,
  emptyMessage = "No data available",
  tableName,
  userRole,
  pagination
}: DataTableProps<T>) {
  // Get centralized pagination config and merge with any overrides
  const defaultPaginationConfig = getTablePaginationConfig(tableName, userRole);
  const paginationConfig = {
    ...defaultPaginationConfig,
    ...pagination
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(paginationConfig.pageSize);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check if we're on mobile and set initial view
  React.useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchable || !searchValue.trim()) {
      return data;
    }
    
    const searchLower = searchValue.toLowerCase();
    return data.filter(item => {
      // Search through all properties of the item, including nested objects
      return Object.entries(item).some(([key, value]) => {
        // Skip id
        if (key === 'id') return false;
        
        // Handle string values
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        }
        
        // Handle nested objects (like sale_items, products, customers)
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return Object.entries(value).some(([, nestedValue]) => {
            if (typeof nestedValue === 'string') {
              return nestedValue.toLowerCase().includes(searchLower);
            }
            return false;
          });
        }
        
        // Handle arrays (like sale_items array)
        if (Array.isArray(value)) {
          return (value as unknown[]).some((arrayItem: unknown) => {
            if (arrayItem && typeof arrayItem === 'object') {
              return Object.entries(arrayItem as Record<string, unknown>).some(([, arrayValue]) => {
                if (typeof arrayValue === 'string') {
                  return arrayValue.toLowerCase().includes(searchLower);
                }
                return false;
              });
            }
            return false;
          });
        }
        
        return false;
      });
    });
  }, [data, searchValue, searchable]);

  // Calculate pagination based on filtered data
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = paginationConfig.enabled ? filteredData.slice(startIndex, endIndex) : filteredData;

  // Reset to first page when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  // Handle scroll indicators and responsive behavior
  React.useEffect(() => {
    const tableContainer = document.querySelector('.overflow-x-auto');
    const scrollIndicator = document.getElementById('scroll-indicator');
    const scrollToTopButton = document.querySelector('.overflow-x-auto button');
    
    if (!tableContainer || !scrollIndicator) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth, scrollTop } = tableContainer as HTMLElement;
      const canScroll = scrollWidth > clientWidth;
      
      if (canScroll) {
        scrollIndicator.style.opacity = '1';
        
        // Hide indicator after 2 seconds
        setTimeout(() => {
          scrollIndicator.style.opacity = '0';
        }, 2000);
      }
      
      // Show/hide scroll to top button
      if (scrollToTopButton) {
        if (scrollTop > 100) {
          scrollToTopButton.classList.remove('opacity-0');
        } else {
          scrollToTopButton.classList.add('opacity-0');
        }
      }
    };

    // Check on mount and resize
    const checkScrollable = () => {
      const { scrollWidth, clientWidth } = tableContainer as HTMLElement;
      if (scrollWidth > clientWidth) {
        scrollIndicator.style.opacity = '1';
        setTimeout(() => {
          scrollIndicator.style.opacity = '0';
        }, 2000);
      }
    };

    tableContainer.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkScrollable);
    
    // Initial check
    checkScrollable();

    return () => {
      tableContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [currentData.length]);

  // Generate page numbers to display
  const getVisiblePages = () => {
    const maxVisible = paginationConfig.maxVisiblePages;
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size: number = parseInt(newPageSize);
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Calculate table width based on columns
  const tableWidth = useMemo(() => {
    const totalWidth = columns.reduce((acc, column) => {
      if (column.width) {
        // Parse width values (e.g., "200px", "20%", "auto")
        const width = column.width;
        if (width.endsWith('px')) {
          return acc + parseInt(width);
        } else if (width.endsWith('%')) {
          return acc + (parseInt(width) * 10); // Approximate percentage to pixels
        }
        return acc + 150; // Default column width
      }
      return acc + 150; // Default column width
    }, 0);
    
    return Math.max(totalWidth, 800); // Minimum table width
  }, [columns]);

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <CardTitle className="text-base sm:text-lg font-semibold">
            {title}
          </CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* Mobile view toggle - only show on small screens */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsMobileView(!isMobileView)}
              className="w-full sm:hidden touch-manipulation"
            >
              {isMobileView ? (
                <>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Table View
                </>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Card View
                </>
              )}
            </Button>
            
            {onExport && (
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onExport(e);
                }} 
                size="sm"
                type="button"
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}
            {actions}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {searchable && (
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          )}
          
          {paginationConfig.enabled && paginationConfig.showPageSizeSelector && (
            <div className="flex items-center gap-2 justify-center sm:justify-end">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Show:</span>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paginationConfig.pageSizeOptions.map(size => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground whitespace-nowrap">per page</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-6">
        {/* Mobile Card View - only on small screens */}
        {isMobileView && (
          <div className="space-y-3 sm:space-y-4">
            {currentData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {emptyMessage}
              </div>
            ) : (
              currentData.map((item, idx) => (
                <Card key={item.id || `card-${idx}-${JSON.stringify(item).slice(0, 50)}`} className="p-3 sm:p-4 border shadow-sm">
                  <div className="space-y-2.5 sm:space-y-3">
                    {columns.map((column, index) => {
                      const value = column.render ? column.render(item) : 
                                   column.cell ? column.cell(item) :
                                   column.key ? String((item as Record<string, unknown>)[column.key] || '') :
                                   column.accessorKey ? String((item as Record<string, unknown>)[column.accessorKey] || '') :
                                   'N/A';
                      // Skip empty values in mobile view for cleaner display
                      if (!value || value === 'N/A' || (typeof value === 'string' && value.trim() === '')) {
                        return null;
                      }
                      return (
                        <div key={column.key || column.accessorKey || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 pb-2 sm:pb-0 border-b sm:border-b-0 last:border-b-0">
                          <span className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5 sm:mb-0">
                            {column.label || column.header}:
                          </span>
                          <div className="text-xs sm:text-sm text-foreground break-words">
                            {value}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Table View - always on large screens, toggleable on mobile */}
        {!isMobileView && (
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto relative">
              {/* Horizontal scroll indicator */}
              <div className="absolute top-2 right-2 bg-muted/80 text-muted-foreground text-xs px-2 py-1 rounded-md opacity-0 transition-opacity duration-200 pointer-events-none" 
                   id="scroll-indicator">
                Scroll horizontally
              </div>
              
              {/* Scroll to top button */}
              <Button
                variant="outline"
                size="sm"
                className="absolute bottom-2 right-2 opacity-0 transition-opacity duration-200 hover:opacity-100"
                onClick={() => {
                  const container = document.querySelector('.overflow-x-auto');
                  if (container) {
                    container.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                ↑ Top
              </Button>
              
              <div style={{ minWidth: `${tableWidth}px` }}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column, index) => (
                        <TableHead 
                          key={column.key || column.accessorKey || index} 
                          className="whitespace-nowrap bg-muted/50 sticky top-0 z-10"
                          style={{
                            width: column.width || 'auto',
                            minWidth: column.minWidth || '120px',
                            maxWidth: column.maxWidth || 'none'
                          }}
                        >
                          {column.label || column.header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                          {emptyMessage}
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentData.map((item, idx) => {
                        // Generate a unique key - prefer id, fallback to index + first column value
                        const uniqueKey = item.id || 
                          (columns[0]?.key && (item as Record<string, unknown>)[columns[0].key] 
                            ? `${columns[0].key}-${(item as Record<string, unknown>)[columns[0].key]}-${idx}`
                            : `row-${idx}`);
                        return (
                        <TableRow key={uniqueKey} className="hover:bg-muted/50">
                          {columns.map((column, index) => (
                            <TableCell 
                              key={column.key || column.accessorKey || index} 
                              className="whitespace-nowrap"
                              style={{
                                width: column.width || 'auto',
                                minWidth: column.minWidth || '120px',
                                maxWidth: column.maxWidth || 'none'
                              }}
                            >
                              {column.render ? column.render(item) : 
                               column.cell ? column.cell(item) :
                               column.key ? String((item as Record<string, unknown>)[column.key] || '') :
                               column.accessorKey ? String((item as Record<string, unknown>)[column.accessorKey] || '') :
                               'N/A'}
                            </TableCell>
                          ))}
                        </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
        
        {/* Pagination */}
        {paginationConfig.enabled && totalPages > 1 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {paginationConfig.showPageInfo && (
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length.toLocaleString()} results
                {filteredData.length !== data.length && (
                  <span className="text-blue-600 ml-1">
                    (filtered from {data.length.toLocaleString()})
                  </span>
                )}
              </div>
            )}
            
            <Pagination className="mx-0">
              <PaginationContent className="flex-wrap justify-center">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} text-xs sm:text-sm`}
                  />
                </PaginationItem>
                
                {getVisiblePages().map((page, index) => (
                  <PaginationItem key={index} className="hidden sm:inline-flex">
                    {page === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => handlePageChange(page as number)}
                        isActive={currentPage === page}
                        className="cursor-pointer text-xs sm:text-sm"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                {/* Mobile: Show current page info */}
                <PaginationItem className="sm:hidden">
                  <span className="px-3 py-2 text-xs text-muted-foreground">
                    {currentPage} of {totalPages}
                  </span>
                </PaginationItem>
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} text-xs sm:text-sm`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}