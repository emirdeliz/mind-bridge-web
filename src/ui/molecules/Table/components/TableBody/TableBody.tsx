import { ReactNode, useCallback, useMemo } from 'react';
import { Title } from '@atoms';
import { sortTableValues, buildDataSource } from './TableBody.logic';
import { TableHeaderProps } from '..';
import { TableProps, TableSortProps, type TableVariant } from '../../Table';

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
  variant = 'light',
  columns,
  dataSource,
  sorterColumnStatus,
  sorterColumnIndex,
  isSortableInApi,
  onRowClick,
}: TableBodyProps<T> & { variant?: TableVariant }) => {
  const isDark = variant === 'dark';
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
              className={`px-6 py-4 text-center border-b ${isDark ? 'border-mb-border/40' : 'border-gray-100'}`}
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
            className={`px-6 py-4 border-b ${isDark ? 'border-mb-border/40' : 'border-gray-100'}`}
            style={widthStyle}
          >
            {customCellRender ? (
              customCellRender(row)
            ) : (
              <Title s2 white={isDark}>
                {String(valueFormatted || row[keyLabel] || '')}
              </Title>
            )}
          </td>
        );
      });
      return (
        <tr
          role="row"
          key={index}
          className={[
            'border-b transition-all duration-200',
            isDark
              ? 'border-mb-border/40 hover:bg-mb-surface-elevated/60'
              : 'border-gray-100 hover:bg-gradient-to-r hover:from-primary-theme-50 hover:to-indigo-50',
            onRowClick ? 'cursor-pointer' : '',
            isDark
              ? index % 2 === 0
                ? 'bg-mb-surface/50'
                : 'bg-mb-surface-elevated/30'
              : index % 2 === 0
                ? 'bg-white'
                : 'bg-gray-25',
          ]
            .filter(Boolean)
            .join(' ')}
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
  }, [columns, dataSourceSortable, onRowClick, isDark]);

  return buildBody();
};
