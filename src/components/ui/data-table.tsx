"use client"

import * as React from "react"
import { cn } from "./utils"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "./table"
import { JSX } from "react";

export interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

export interface Column<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface DataTableProps<T extends Record<string, unknown>> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  sortable?: boolean;
  searchable?: boolean;
  onRowClick?: (row: T) => void;
}

// Hook for sorting
function useSortableData<T extends Record<string, unknown>>(
  items: T[],
  config: SortConfig<T> | null
) {
  return React.useMemo(() => {
    if (!config) return items;

    return [...items].sort((a, b) => {
      const aVal = a[config.key];
      const bVal = b[config.key];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      return (
        (aVal < bVal ? -1 : 1) * (config.direction === 'asc' ? 1 : -1)
      );
    });
  }, [items, config]);
}

// Hook for pagination
function usePagination<T>(items: T[], pageSize: number = 10) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.ceil(items.length / pageSize);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const currentData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }, [items, currentPage, pageSize]);

  return {
    currentData,
    currentPage,
    totalPages,
    setCurrentPage,
  };
}

// Hook for searching
function useSearch<T extends Record<string, unknown>>(items: T[], searchTerm: string) {
  return React.useMemo(() => {
    if (!searchTerm) return items;

    return items.filter((item) => {
      return Object.values(item).some((value) =>
        String(value || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [items, searchTerm]);
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  sortable = true,
  searchable = true,
  className,
  onRowClick,
  ...props
}: DataTableProps<T>): JSX.Element {
  const [sortConfig, setSortConfig] = React.useState<SortConfig<T> | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  const searchedData = useSearch(data, searchTerm);
  const sortedData = useSortableData(searchedData, sortConfig) || searchedData;
  const { currentData, currentPage, totalPages, setCurrentPage } = usePagination(sortedData, pageSize);

  const handleSort = React.useCallback((key: keyof T) => {
    if (!sortable) return;

    setSortConfig((currentConfig) => {
      if (currentConfig?.key === key) {
        if (currentConfig.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        return null;
      }
      return { key, direction: 'asc' };
    });
  }, [sortable]);

  return (
    <div className={cn("w-full space-y-4", className)} {...props}>
      {searchable && (
        <div className="flex w-full items-center space-x-2">
          <input
            type="text"
            placeholder="Search..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={cn(
                    sortable && column.sortable !== false && "cursor-pointer hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {sortable && column.sortable !== false && sortConfig?.key === column.key && (
                      <span className="ml-2">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] != null
                          ? String(row[column.key])
                          : ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              )}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
