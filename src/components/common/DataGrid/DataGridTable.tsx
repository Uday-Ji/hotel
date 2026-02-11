import  { useRef, useEffect } from 'react';
import { ArrowDown, Filter, MoreVertical } from 'lucide-react';
//import DataGridFilterPopup from './DataGridFilterPopup';
import { Column, SortConfig } from './types';
import DataGridFilterPopup from './DataGridFilterPopup';

interface DataGridTableProps<T> {
  columns: Column<T>[];
  data: T[];
  allData: T[];
  sortConfig: SortConfig<T>;
  selectedIds: Set<string | number>;
  filters: Record<string, Set<string>>;
  openFilterKey: string | null;
  tempFilters: Set<string>;
  filterSearch: string;
  processedData: T[];
  onSort: (key: keyof T | string) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string | number) => void;
  onFilterToggle: (columnKey: string) => void;
  onViewMore?: (item: T) => void;
  getUniqueValues: (key: string) => string[];
  setTempFilters: (filters: Set<string>) => void;
  setFilterSearch: (search: string) => void;
  onApplyFilters: (columnKey: string) => void;
  onResetFilters: () => void;
}

const DataGridTable = <T extends { id: string | number }>({
  columns,
  data,
  allData,
  sortConfig,
  selectedIds,
  filters,
  openFilterKey,
  tempFilters,
  filterSearch,
  processedData,
  onSort,
  onSelectAll,
  onSelectOne,
  onFilterToggle,
  onViewMore,
  getUniqueValues,
  setTempFilters,
  setFilterSearch,
  onApplyFilters,
  onResetFilters,
}: DataGridTableProps<T>) => {
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        onFilterToggle(''); // Close filter
        setFilterSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTempFilterValue = (value: string) => {
    const next = new Set(tempFilters);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setTempFilters(next);
  };

  const toggleSelectAllTemp = (visibleValues: string[]) => {
    const allVisibleIncluded = visibleValues.every((v) => tempFilters.has(v));
    const next = new Set(tempFilters);
    if (allVisibleIncluded) {
      visibleValues.forEach((v) => next.delete(v));
    } else {
      visibleValues.forEach((v) => next.add(v));
    }
    setTempFilters(next);
  };

  const clearTempFilter = () => {
    setTempFilters(new Set());
  };

  return (
    <>
      <div className="datagrid-table-wrapper">
        <table className="datagrid-table">
          <thead>
            <tr className="datagrid-thead-row">
              <th className="datagrid-th datagrid-checkbox-cell">
                <div className="datagrid-checkbox-wrapper">
                  <input
                    type="checkbox"
                    onChange={(e) => onSelectAll(e.target.checked)}
                    checked={allData.length > 0 && selectedIds.size === allData.length}
                    className="datagrid-checkbox"
                  />
                </div>
              </th>
              {columns.map((col) => {
                const columnKey = col.key as string;
                const isFiltered = filters[columnKey] !== undefined;

                return (
                  <th key={columnKey} className="datagrid-th">
                    <div className="datagrid-th-content">
                      <div
                        className="datagrid-th-label"
                        onClick={() => col.sortable && onSort(col.key)}
                      >
                        {col.label}
                        {col.sortable && sortConfig.key === col.key && (
                          <ArrowDown
                            size={14}
                            className={`datagrid-sort-icon ${
                              sortConfig.order === 'asc' ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </div>

                      <button
                        className={`datagrid-filter-btn ${isFiltered ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onFilterToggle(columnKey);
                        }}
                      >
                        <Filter size={16} fill={isFiltered ? 'currentColor' : 'none'} />
                      </button>

                      {openFilterKey === columnKey && (
                        <DataGridFilterPopup
                          columnKey={columnKey}
                          columnLabel={col.label}
                          uniqueValues={getUniqueValues(columnKey)}
                          tempFilters={tempFilters}
                          filterSearch={filterSearch}
                          isFiltered={isFiltered}
                          onFilterSearchChange={setFilterSearch}
                          onToggleValue={toggleTempFilterValue}
                          onToggleSelectAll={toggleSelectAllTemp}
                          onClear={clearTempFilter}
                          onApply={onApplyFilters}
                          onClose={() => onFilterToggle('')}
                          filterMenuRef={filterMenuRef}
                        />
                      )}
                    </div>
                  </th>
                );
              })}
              <th className="datagrid-th datagrid-actions-cell"></th>
            </tr>
          </thead>
          <tbody className="datagrid-tbody">
            {data.map((row) => (
              <tr
                key={row.id}
                className={`datagrid-row ${selectedIds.has(row.id) ? 'selected' : ''}`}
              >
                <td className="datagrid-td datagrid-checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => onSelectOne(row.id)}
                    className="datagrid-checkbox"
                  />
                </td>
                {columns.map((col) => (
                  <td key={col.key as string} className="datagrid-td">
                    {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                  </td>
                ))}
                <td className="datagrid-td datagrid-actions-cell">
                  <button onClick={() => onViewMore?.(row)} className="datagrid-action-btn">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {processedData.length === 0 && (
        <div className="datagrid-empty-state">
          <div className="datagrid-empty-icon">
            <Filter size={32} />
          </div>
          <div>
            <p className="datagrid-empty-title">No results found</p>
            <p className="datagrid-empty-subtitle">
              Try broadening your filters or global search.
            </p>
          </div>
          <button onClick={onResetFilters} className="datagrid-empty-btn">
            Clear All
          </button>
        </div>
      )}
    </>
  );
};

export default DataGridTable;