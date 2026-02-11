import { useState, useMemo } from 'react';
import DataGridHeader from './DataGridHeader';
import DataGridTable from './DataGridTable';
import DataGridPagination from './DataGridPagination';
import { DataGridProps, SortConfig, SortOrder } from './types';
import './dataGrid.css';

const DataGrid = <T extends { id: string | number }>({
  title,
  data,
  columns,
  onViewMore,
  isLoading = false,
}: DataGridProps<T>) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: 'id',
    order: 'desc',
  });
  console.log(isLoading)
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<Record<string, Set<string>>>({});
  const [tempFilters, setTempFilters] = useState<Set<string>>(new Set());
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);
  const [filterSearch, setFilterSearch] = useState('');

  // Handlers
  const handleSort = (key: keyof T | string) => {
    let order: SortOrder = 'asc';
    if (sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    } else if (sortConfig.key === key && sortConfig.order === 'desc') {
      order = null;
    }
    setSortConfig({ key, order });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(data.map((item) => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string | number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleFilterToggle = (columnKey: string) => {
    const nextKey = openFilterKey === columnKey ? null : columnKey;
    setOpenFilterKey(nextKey);
    setFilterSearch('');

    if (nextKey) {
      const uniqueValues = getUniqueValues(columnKey);
      if (filters[columnKey]) {
        setTempFilters(new Set(filters[columnKey]));
      } else {
        setTempFilters(new Set(uniqueValues));
      }
    }
  };

  const handleApplyFilters = (columnKey: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: new Set(tempFilters),
    }));
    setOpenFilterKey(null);
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters({});
    setSearchTerm('');
    setPage(0);
  };

  const getUniqueValues = (key: string) => {
    const values = data.map((item) => String(item[key as keyof T] ?? ''));
    return Array.from(new Set(values)).sort();
  };

  // Data processing
  const processedData = useMemo(() => {
    let result = data.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    Object.entries(filters).forEach(([key, selectedValues]) => {
      result = result.filter((item) =>
        (selectedValues as Set<string>).has(String(item[key as keyof T] ?? ''))
      );
    });

    if (sortConfig.order && sortConfig.key) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortConfig.key as keyof T];
        const bVal = b[sortConfig.key as keyof T];
        if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return processedData.slice(start, start + rowsPerPage);
  }, [processedData, page, rowsPerPage]);

  return (
    <div className="datagrid-container">
      <DataGridHeader
        title={title}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        hasActiveFilters={Object.keys(filters).length > 0}
        onResetFilters={handleResetFilters}
      />

      <DataGridTable
        columns={columns}
        data={paginatedData}
        allData={data}
        sortConfig={sortConfig}
        selectedIds={selectedIds}
        filters={filters}
        openFilterKey={openFilterKey}
        onSort={handleSort}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onFilterToggle={handleFilterToggle}
        onViewMore={onViewMore}
        getUniqueValues={getUniqueValues}
        tempFilters={tempFilters}
        setTempFilters={setTempFilters}
        filterSearch={filterSearch}
        setFilterSearch={setFilterSearch}
        onApplyFilters={handleApplyFilters}
        processedData={processedData}
        onResetFilters={handleResetFilters}
      />

      <DataGridPagination
        page={page}
        rowsPerPage={rowsPerPage}
        totalItems={processedData.length}
        selectedCount={selectedIds.size}
        onPageChange={setPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(0);
        }}
      />
    </div>
  );
};

export default DataGrid;