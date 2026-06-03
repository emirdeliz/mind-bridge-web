import { ReactNode, useCallback, useMemo } from 'react';
import { Title } from '@atoms';
import { sortTableValues, buildDataSource } from './TableBody.logic';
import { TableHeaderProps } from '..';
import { TableProps, TableSortProps } from '../../Table';

export interface TableBodyProps<T>
  extends Omit<
      TableHeaderProps<T>,
      'setSorterColumnStatus' | 'setSorterColumnIndex'
    >,
    TableProps<T>,
  TableSortProps {
  isSortableInApi: boolean;
}

export const TableBody = <T extends { actions: ReactNode }>({
  columns,
  dataSource,
  sorterColumnStatus,
  sorterColumnIndex,
  isSortableInApi,
  onRowClick,
}: TableBodyProps<T>) => {
  const dataSourceBase = useMemo(
    () => buildDataSource<T>({ columns, dataSource }) as Array<T>,
    [columns, dataSource]
  );
  const dataSourceSortable = useMemo(() => {
    if (isSortableInApi) { 
      return dataSourceBase;
    }
    const result = sortTableValues<T>({
      dataSource: dataSourceBase,
      columns,
      sorterColumnStatus,
      sorterColumnIndex,
    });
    return result;
  }, [dataSourceBase, columns, sorterColumnStatus, sorterColumnIndex, isSortableInApi]);

  const buildBody = useCallback(() => {
    const result = dataSourceSortable?.map((row: T, index: number) => {
      const result = columns?.map((column, colIndex) => {
        const { key: keyLabel, customCellRender, width } = column;
        const valueFormatted = row[`${String(keyLabel)}Formatted` as keyof T];
        const isColumnActions = keyLabel === 'actions';
        const widthStyle = width ? { width, minWidth: width, maxWidth: width } : undefined;

        if (isColumnActions) {
          return (
            <td
              key={colIndex}
              role="cell"
              data-testid={`table-row-${index}-cell-${colIndex}`}
              className="px-6 py-4 text-center border-b border-gray-100"
              style={widthStyle}
            >
              {row.actions}
            </td>
          );
        }

        return (
          <td
            key={colIndex}
            role="cell"
            data-testid={`table-row-${index}-cell-${colIndex}`}
            className="px-6 py-4 border-b border-gray-100"
            style={widthStyle}
          >
            {customCellRender ? (
              customCellRender(row)
            ) : (
              <Title s2>{String(valueFormatted || row[keyLabel] || '')}</Title>
            )}
          </td>
        );
      });
      return (
        <tr
          role="row"
          key={index}
          className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-primary-theme-50 hover:to-indigo-50 transition-all duration-200 ${onRowClick ? 'cursor-pointer' : ''} ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
          onClick={(e) => {
            e.stopPropagation();
            onRowClick && onRowClick(row, index);
          }}
        >
          {result}
        </tr>
      );
    });
    return <tbody data-testid="table-body">{result}</tbody>;
  }, [columns, dataSourceSortable, onRowClick]);

  return buildBody();
};
