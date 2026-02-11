import React from 'react';
import { Search } from 'lucide-react';
import { DataGridFilterPopupProps } from './types';

interface ExtendedDataGridFilterPopupProps extends DataGridFilterPopupProps {
  filterMenuRef: React.RefObject<HTMLDivElement>;
}

const DataGridFilterPopup: React.FC<ExtendedDataGridFilterPopupProps> = ({
  columnKey,
  columnLabel,
  uniqueValues,
  tempFilters,
  filterSearch,
  onFilterSearchChange,
  onToggleValue,
  onToggleSelectAll,
  onClear,
  onApply,
  filterMenuRef,
}) => {
  const filteredValues = uniqueValues.filter((v) =>
    v.toLowerCase().includes(filterSearch.toLowerCase())
  );

  const allVisibleChecked =
    filteredValues.length > 0 && filteredValues.every((v) => tempFilters.has(v));

  return (
    <div ref={filterMenuRef} className="datagrid-filter-popup" onClick={(e) => e.stopPropagation()}>
      {/* Search Header */}
      <div className="datagrid-filter-header">
        <div className="datagrid-filter-search-wrapper">
          <Search size={16} className="datagrid-filter-search-icon" />
          <input
            autoFocus
            type="text"
            placeholder={`Search ${columnLabel.toLowerCase()}...`}
            value={filterSearch}
            onChange={(e) => onFilterSearchChange(e.target.value)}
            className="datagrid-filter-search-input"
          />
        </div>
      </div>

      {/* Select All / Clear */}
      <div className="datagrid-filter-controls">
        <label className="datagrid-filter-select-all">
          <input
            type="checkbox"
            className="datagrid-checkbox"
            checked={allVisibleChecked}
            onChange={() => onToggleSelectAll(filteredValues)}
          />
          <span className="datagrid-filter-select-all-label">(Select All)</span>
        </label>
        <button onClick={onClear} className="datagrid-filter-clear-btn">
          Clear
        </button>
      </div>

      {/* Filter Options */}
      <div className="datagrid-filter-list">
        {filteredValues.map((val) => (
          <label key={val} className="datagrid-filter-item">
            <input
              type="checkbox"
              checked={tempFilters.has(val)}
              onChange={() => onToggleValue(val)}
              className="datagrid-checkbox"
            />
            <span className="datagrid-filter-item-label">
              {val === '' ? '(Blanks)' : val}
            </span>
          </label>
        ))}
        {filteredValues.length === 0 && (
          <div className="datagrid-filter-empty">No items found</div>
        )}
      </div>

      {/* Apply Button */}
      <div className="datagrid-filter-footer">
        <button onClick={() => onApply(columnKey)} className="datagrid-filter-apply-btn">
          Apply
        </button>
      </div>
    </div>
  );
};

export default DataGridFilterPopup;