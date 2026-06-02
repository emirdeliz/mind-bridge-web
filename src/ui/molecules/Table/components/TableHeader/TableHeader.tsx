import { GenericObject } from '@types';
import { Flex, Icon } from '@atoms';
import { useCallback } from 'react';
import { TableProps, TableSort, TableSortProps } from '../../Table';

export interface TableHeaderProps<T> extends TableProps<T> {
  sortable?: boolean;
  setSorterColumnStatus: (sorterColumnStatus: TableSort) => void;
  setSorterColumnIndex: (index: number) => void;
}

export interface TableHeaderSortProps<T>
  extends TableHeaderProps<T>,
    TableSortProps {}

export const TableHeader = <T extends GenericObject>({
  sortable,
  columns,
  sorterColumnStatus,
  sorterColumnIndex,
  setSorterColumnStatus,
  setSorterColumnIndex,
  onSort
}: TableHeaderSortProps<T>) => {
  const sortData = useCallback(
    (columnIndex: number) => {
      if (sorterColumnIndex !== columnIndex) {
        setSorterColumnIndex(columnIndex);
        setSorterColumnStatus(TableSort.DESC);
        onSort?.(TableSort.DESC, columnIndex);

      } else {
        const sorterStatus =
          sorterColumnStatus === TableSort.DESC ? TableSort.ASC : TableSort.DESC;
        setSorterColumnStatus(sorterStatus);
        onSort?.(sorterStatus, columnIndex);
      }
    },
    [
      setSorterColumnIndex,
      setSorterColumnStatus,
      sorterColumnIndex,
      sorterColumnStatus,
      onSort,
    ]
  );

  const buildHead = useCallback(() => {
    const result = columns?.map((column, index) => {
      const { label, key, disableSort, width } = column;
      const isSortAsc = sorterColumnStatus === TableSort.ASC;
      const isCurrentColumnSort = index === sorterColumnIndex ||
        (sorterColumnIndex === undefined && index === 0);
      const isActionsColumn = key === 'actions';
      return (
        <th
          key={index}
          role="columnheader"
          className={`px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-700 uppercase tracking-wide text-sm ${isActionsColumn ? 'text-center' : 'text-left'} ${disableSort ? '' : 'cursor-pointer hover:from-gray-100 hover:to-gray-200 transition-all duration-200'}`}
          style={width ? { width, minWidth: width, maxWidth: width } : undefined}
          onClick={disableSort ? undefined :() => sortData(index)}
        >
          <Flex.Row wFull alignCenter justifyStart={!isActionsColumn} justifyCenter={isActionsColumn}>
            <span
              className={[
                'font-poppins text-sm font-semibold text-inherit',
                sortable && !disableSort && !isActionsColumn
                  ? 'cursor-pointer transition-colors duration-200'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {label}
            </span>
            {sortable && !disableSort && label && !isActionsColumn && isCurrentColumnSort && (
              <Flex>
                <Icon
                  xs
                  down={!isSortAsc}
                  up={isSortAsc}
                  black
                />
              </Flex>
            )}
          </Flex.Row>
        </th>
      );
    });
    return (
      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
        <tr className="border-b border-gray-200">{result}</tr>
      </thead>
    );
  }, [columns, sortData, sortable, sorterColumnIndex, sorterColumnStatus]);
  return buildHead();
};
