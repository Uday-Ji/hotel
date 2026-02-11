import React from 'react';
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ArrowDown,
} from 'lucide-react';
import { DataGridPaginationProps } from './types';

const DataGridPagination: React.FC<DataGridPaginationProps> = ({
  page,
  rowsPerPage,
  totalItems,
  selectedCount,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startRange = page * rowsPerPage + 1;
  const endRange = Math.min((page + 1) * rowsPerPage, totalItems);

  return (
    <div className="datagrid-pagination">
      <div className="datagrid-pagination-left">
        <div className="datagrid-rows-per-page">
          <span className="datagrid-pagination-label">Show</span>
          <div className="datagrid-select-wrapper">
            <select
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
              className="datagrid-select"
            >
              {[5, 10, 20, 50].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <ArrowDown size={14} className="datagrid-select-icon" />
          </div>
        </div>
        <span className="datagrid-pagination-label">{selectedCount} Items Selected</span>
      </div>

      <div className="datagrid-pagination-right">
        <div className="datagrid-pagination-info">
          {totalItems > 0 ? (
            <span>
              {startRange} - {endRange} <span className="datagrid-pagination-separator">/</span>{' '}
              {totalItems}
            </span>
          ) : (
            '0 / 0'
          )}
        </div>

        <div className="datagrid-pagination-controls">
          <button
            onClick={() => onPageChange(0)}
            disabled={page === 0}
            className="datagrid-pagination-btn"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="datagrid-pagination-btn"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="datagrid-pagination-btn"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => onPageChange(totalPages - 1)}
            disabled={page >= totalPages - 1}
            className="datagrid-pagination-btn"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataGridPagination;