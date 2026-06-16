import { ReactNode, useState } from 'react';
import { TableBody, TableHeader } from './components';
import { TablePagination } from './components/TablePagination/TablePagination';

export interface TableColumnProps<T> {
  currency?: boolean;
  cnpj?: boolean;
  date?: boolean;
  dateAndTime?: boolean;
  phone?: boolean;
  bool?: boolean;
  num?: boolean;
  disableSort?: boolean;
  sorterKey?: keyof T;
  key: keyof T;
  label?: ReactNode;
  width?: string;
  customCellRender?: (value: T) => ReactNode;
}

export interface TableSortProps {
  sorterColumnStatus?: TableSort;
  sorterColumnIndex?: number;
}

export interface TableColumnEditableProps<T> extends TableColumnProps<
  T & { actions?: ReactNode }
> {}

export type TableVariant = 'light' | 'dark';

export interface TableProps<T> {
  variant?: TableVariant;
  enablePagination?: boolean;
  countItems?: number;
  numItemsPerPage?: number;
  page?: number;
  disabled?: boolean;
  sortable?: boolean;
  columns?: Array<TableColumnEditableProps<T>>;
  dataSource?: Array<T & { actions?: ReactNode }>;
  onChangePage?: (pageNumber: number) => void;
  onSort?: (sorterColumnStatus: TableSort, sorterColumnIndex: number) => void;
  onRowClick?: (row: T, index: number) => void;
}

export enum TableSort {
  ASC = 'asc',
  DESC = 'desc',
}

export const Table = <T extends { actions: ReactNode }>({
  variant = 'light',
  columns,
  dataSource,
  sortable,
  onRowClick,
  enablePagination,
  numItemsPerPage = 1,
  countItems,
  page,
  onChangePage,
  onSort,
  ...props
}: TableProps<T>) => {
  const isDark = variant === 'dark';
  const [sorterColumnIndex, setSorterColumnIndex] = useState<number>(0);
  const [sorterColumnStatus, setSorterColumnStatus] = useState<TableSort>(
    TableSort.ASC
  );

  if (enablePagination && countItems === undefined) {
    throw new Error('countItems prop is required.');
  }

  if (enablePagination && page === undefined) {
    throw new Error('page prop is required.');
  }

  if (enablePagination && onChangePage === undefined) {
    throw new Error('onChangePage prop is required.');
  }

  const isSortableInApi = !!onSort;

  const containerClasses = [
    'w-full',
    'overflow-x-auto',
    'rounded-lg',
    'shadow-lg',
    isDark
      ? 'border border-mb-border/80 bg-mb-surface/90 backdrop-blur-xl'
      : 'bg-white',
    props.disabled && 'opacity-50 pointer-events-none',
  ]
    .filter(Boolean)
    .join(' ');

  const tableClasses = [
    'w-full',
    'border-collapse',
    'rounded-lg',
    'overflow-hidden',
    isDark ? 'bg-transparent' : 'bg-white',
  ].join(' ');

  return (
    <div className={containerClasses}>
      <table className={tableClasses} role='table'>
        <TableHeader<T>
          {...{
            variant,
            columns,
            sorterColumnStatus,
            sorterColumnIndex,
            setSorterColumnStatus,
            setSorterColumnIndex,
            sortable,
            onSort,
          }}
        />
        <TableBody<T>
          {...{
            variant,
            columns,
            dataSource,
            sorterColumnIndex,
            sorterColumnStatus,
            onRowClick,
            isSortableInApi,
          }}
        />
      </table>
      {enablePagination &&
        countItems !== undefined &&
        countItems > 0 &&
        countItems > numItemsPerPage && (
          <TablePagination
            page={page!}
            numOfPages={Math.ceil(countItems / numItemsPerPage)}
            onChangePage={onChangePage!}
          />
        )}
    </div>
  );
};
