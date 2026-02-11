import React from 'react';
import { Search, X } from 'lucide-react';
import { DataGridHeaderProps } from './types';

const DataGridHeader: React.FC<DataGridHeaderProps> = ({
  title,
  searchTerm,
  onSearchChange,
  hasActiveFilters,
  onResetFilters,
}) => {
  return (
    <div className="datagrid-header">
      <div className="datagrid-header-left">
        <h2 className="datagrid-title">{title}</h2>
        {hasActiveFilters && (
          <button onClick={onResetFilters} className="datagrid-reset-btn">
            <X size={12} strokeWidth={3} /> Reset filters
          </button>
        )}
      </div>
      <div className="datagrid-search-wrapper">
        <input
          type="text"
          placeholder="Global search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="datagrid-search-input"
        />
        <Search className="datagrid-search-icon" size={20} />
      </div>
    </div>
  );
};

export default DataGridHeader;