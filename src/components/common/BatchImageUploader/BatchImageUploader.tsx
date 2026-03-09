import React, { useState, useCallback, useEffect } from 'react';
import './BatchImageUploader.css';
import UploadModal from './UploadModal';

// ── Types ─────────────────────────────────────────────────────────────────

export interface ImageRow {
  id: string;
  thumbnailFile: File | null;
  largeFile: File | null;
  thumbnailPreview: string | null;
  largePreview: string | null;
  tag: string;
  status: 'Active' | 'Inactive';
  uploadState: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
  // Added for edit mode initialization
  thumbnailUrl?: string;
  largeImageUrl?: string;
}

export interface BatchImageUploaderProps {
  onUploadComplete?: (rows: ImageRow[]) => void;
  onUploadRow?: (row: ImageRow) => Promise<void>;
  tagSuggestions?: string[];
  maxRows?: number;
  title?: string;
  subtitle?: string;
  initialRowCount?: number; // Number of rows to show initially
  initialRows?: Partial<ImageRow>[]; // For edit mode, pre-fill rows
}

// ── Component ─────────────────────────────────────────────────────────────

const BatchImageUploader: React.FC<BatchImageUploaderProps> = ({
  onUploadComplete,
  onUploadRow,
  tagSuggestions = [],
  maxRows = 50,
  title = 'Batch Image Upload',
  subtitle = 'Upload multiple package images at once with real-time progress tracking',
  initialRowCount = 1, // Default to 1 row on mount
  initialRows = [],
}) => {
  const [rows, setRows] = useState<ImageRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // ── Initialize with default or edit rows ───────────────────────────────
  useEffect(() => {
    if (rows.length === 0) {
      if (initialRows && initialRows.length > 0) {
        // Edit mode: pre-fill rows
        const editRows: ImageRow[] = initialRows.map((r, idx) => ({
          id: `row-edit-${Date.now()}-${idx}`,
          thumbnailFile: r.thumbnailFile || null,
          largeFile: r.largeFile || null,
          thumbnailPreview: r.thumbnailPreview || r.thumbnailUrl || null,
          largePreview: r.largePreview || r.largeImageUrl || null,
          tag: r.tag || '',
          status: r.status || 'Active',
          uploadState: 'pending',
          progress: 0,
          // Added for edit mode initialization
          thumbnailUrl: r.thumbnailUrl || '',
          largeImageUrl: r.largeImageUrl || '',
        }));
        setRows(editRows);
      } else if (initialRowCount > 0) {
        // Add mode: default rows
        const defaultRows: ImageRow[] = [];
        for (let i = 0; i < initialRowCount; i++) {
          defaultRows.push({
            id: `row-${Date.now()}-${i}`,
            thumbnailFile: null,
            largeFile: null,
            thumbnailPreview: null,
            largePreview: null,
            tag: '',
            status: 'Active',
            uploadState: 'pending',
            progress: 0,
            // Added for edit mode initialization
            thumbnailUrl: '',
            largeImageUrl: '',
          });
        }
        setRows(defaultRows);
      }
    }
  }, []);

  // ── Row Management ──────────────────────────────────────────────────────

  const addRow = useCallback(() => {
    if (rows.length >= maxRows) {
      alert(`Maximum ${maxRows} rows allowed`);
      return;
    }

    const newRow: ImageRow = {
      id: `row-${Date.now()}-${Math.random()}`,
      thumbnailFile: null,
      largeFile: null,
      thumbnailPreview: null,
      largePreview: null,
      tag: '',
      status: 'Active',
      uploadState: 'pending',
      progress: 0,
      // Added for edit mode initialization
      thumbnailUrl: '',
      largeImageUrl: '',
    };

    setRows((prev) => [...prev, newRow]);
  }, [rows.length, maxRows]);

  const deleteRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const updateRow = useCallback((id: string, updates: Partial<ImageRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...updates } : row))
    );
  }, []);

  // ── Image Handling ──────────────────────────────────────────────────────

  const handleImageSelect = useCallback(
    (id: string, type: 'thumbnail' | 'large', file: File | null) => {
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        
        if (type === 'thumbnail') {
          updateRow(id, {
            thumbnailFile: file,
            thumbnailPreview: preview,
          });
        } else {
          updateRow(id, {
            largeFile: file,
            largePreview: preview,
          });
        }
      };
      reader.readAsDataURL(file);
    },
    [updateRow]
  );

  // ── Validation ──────────────────────────────────────────────────────────

  const validateRows = useCallback((): boolean => {
    if (rows.length === 0) {
      alert('Please add at least one row');
      return false;
    }

    for (const row of rows) {
      // Accept either a new file or an existing preview (edit mode)
      if (!row.thumbnailFile && !row.thumbnailPreview) {
        alert('All rows must have a thumbnail image');
        return false;
      }
      if (!row.largeFile && !row.largePreview) {
        alert('All rows must have a large image');
        return false;
      }
      if (!row.tag.trim()) {
        alert('All rows must have a tag');
        return false;
      }
    }

    return true;
  }, [rows]);

  // ── Upload Process ──────────────────────────────────────────────────────

  const uploadAll = useCallback(async () => {
    if (!validateRows()) return;

    setIsModalOpen(true);
    setIsUploading(true);

    try {
      for (const row of rows) {
        // Mark as uploading
        updateRow(row.id, { uploadState: 'uploading', progress: 0 });

        try {
          // Simulate upload progress
          for (let i = 0; i <= 100; i += 10) {
            await new Promise((resolve) => setTimeout(resolve, 150));
            updateRow(row.id, { progress: i });
          }

          // Call custom upload function if provided
          if (onUploadRow) {
            await onUploadRow(row);
          }

          // Mark as success
          updateRow(row.id, { uploadState: 'success', progress: 100 });
        } catch (error) {
          // Mark as error
          updateRow(row.id, {
            uploadState: 'error',
            errorMessage: error instanceof Error ? error.message : 'Upload failed',
          });
        }
      }

      // All uploads complete
      setIsUploading(false);
      
      setTimeout(() => {
        alert('All images uploaded successfully!');
        if (onUploadComplete) {
          onUploadComplete(rows);
        }
        setIsModalOpen(false);
        setRows([]); // Clear rows after successful upload
        
        // Re-add initial rows
        if (initialRowCount > 0) {
          const initialRows: ImageRow[] = [];
          for (let i = 0; i < initialRowCount; i++) {
            initialRows.push({
              id: `row-${Date.now()}-${i}`,
              thumbnailFile: null,
              largeFile: null,
              thumbnailPreview: null,
              largePreview: null,
              tag: '',
              status: 'Active',
              uploadState: 'pending',
              progress: 0,
              // Added for edit mode initialization
              thumbnailUrl: '',
              largeImageUrl: '',
            });
          }
          setRows(initialRows);
        }
      }, 1000);
    } catch (error) {
      setIsUploading(false);
      alert('Upload process failed');
    }
  }, [rows, validateRows, updateRow, onUploadRow, onUploadComplete, initialRowCount]);

  // ── Render ──────────────────────────────────────────────────────────────

  const isUploadDisabled = rows.length === 0 || isUploading;

  return (
    <div className="batch-uploader-container">
      {title && (
        <div className="batch-uploader-header">
          <h2 className="batch-uploader-title">{title}</h2>
          <p className="batch-uploader-subtitle">{subtitle}</p>
        </div>
      )}

      <div className="batch-uploader-rows">
        {rows.map((row) => (
          <div key={row.id} className="batch-row-card">
            <div className="batch-row-content">
              {/* Thumbnail Upload */}
              <div className="batch-upload-box">
                 <label
                  className={`batch-upload-area ${row.thumbnailPreview ? 'has-image' : ''}`}
                  htmlFor={`thumb-${row.id}`}
                >
                  {row.thumbnailPreview ? (
                    <img
                      src={row.thumbnailPreview}
                      alt="Thumbnail"
                      className="batch-upload-preview"
                    />
                  ) : (
                    <span className="batch-upload-text">Upload</span>
                  )}
                  <input
                    id={`thumb-${row.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageSelect(row.id, 'thumbnail', e.target.files?.[0] || null)
                    }
                    className="batch-upload-input"
                  />
                </label>
              </div>

              {/* Large Upload */}
              <div className="batch-upload-box">
                 <label
                  className={`batch-upload-area ${row.largePreview ? 'has-image' : ''}`}
                  htmlFor={`large-${row.id}`}
                >
                  {row.largePreview ? (
                    <img
                      src={row.largePreview}
                      alt="Large"
                      className="batch-upload-preview"
                    />
                  ) : (
                    <span className="batch-upload-text">Upload</span>
                  )}
                  <input
                    id={`large-${row.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageSelect(row.id, 'large', e.target.files?.[0] || null)
                    }
                    className="batch-upload-input"
                  />
                </label>
              </div>

              {/* Tag Input */}
              <div className="batch-category-box">
                <input
                  type="text"
                  placeholder="Enter tag (e.g., hero-banner)"
                  value={row.tag}
                  onChange={(e) => updateRow(row.id, { tag: e.target.value })}
                  className="batch-category-input"
                  list={tagSuggestions.length > 0 ? `tags-${row.id}` : undefined}
                />
                {tagSuggestions.length > 0 && (
                  <datalist id={`tags-${row.id}`}>
                    {tagSuggestions.map((tag) => (
                      <option key={tag} value={tag} />
                    ))}
                  </datalist>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="batch-status-box">
                <select
                  value={row.status}
                  onChange={(e) =>
                    updateRow(row.id, { status: e.target.value as 'Active' | 'Inactive' })
                  }
                  className="batch-status-select"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => deleteRow(row.id)}
                className="batch-delete-btn"
                aria-label="Delete row"
                type="button"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Row Button */}
      <button onClick={addRow} className="batch-add-row-btn" type="button">
        + Add More Images
      </button>

      {/* Upload All Button */}
      <div className="batch-upload-all-wrapper">
        <button
          onClick={uploadAll}
          disabled={isUploadDisabled}
          className="batch-upload-all-btn"
          type="button"
        >
          Upload All
        </button>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <UploadModal
          rows={rows}
          isUploading={isUploading}
          onClose={() => !isUploading && setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default BatchImageUploader;