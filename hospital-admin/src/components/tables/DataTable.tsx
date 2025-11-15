import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import clsx from 'clsx';
import Spinner from '../feedback/Spinner';
import EmptyState from '../feedback/EmptyState';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

/**
 * DataTable - Table component using TanStack Table
 * 
 * Features:
 * - Sorting
 * - Filtering
 * - Pagination
 * - Responsive design
 * - Loading and empty states
 */
function DataTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'No data available',
  emptyIcon = 'table_chart',
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyMessage} />;
  }

  return (
    <div className={clsx('w-full', className)}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
          <thead className="bg-background-light dark:bg-background-dark">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={clsx(
                      'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider',
                      'text-subtle-light dark:text-subtle-dark',
                      header.column.getCanSort() && 'cursor-pointer select-none hover:text-foreground-light dark:hover:text-foreground-dark'
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <span className="material-symbols-outlined text-sm">
                          {header.column.getIsSorted() === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-card-light dark:bg-card-dark divide-y divide-border-light dark:divide-border-dark">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={clsx(
                  'hover:bg-background-light dark:hover:bg-background-dark transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 whitespace-nowrap text-sm text-foreground-light dark:text-foreground-dark"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border-light dark:border-border-dark sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-subtle-light dark:text-subtle-dark">
            Showing{' '}
            <span className="font-medium text-foreground-light dark:text-foreground-dark">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-foreground-light dark:text-foreground-dark">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                data.length
              )}
            </span>{' '}
            of <span className="font-medium text-foreground-light dark:text-foreground-dark">{data.length}</span> results
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-2 text-sm font-medium rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-2 text-sm font-medium rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;

