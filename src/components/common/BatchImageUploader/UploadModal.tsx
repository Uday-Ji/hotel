import React from 'react';
import './BatchImageUploader.css';
import type { ImageRow } from './BatchImageUploader';

interface UploadModalProps {
  rows: ImageRow[];
  isUploading: boolean;
  onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ rows, isUploading, onClose }) => {
  return (
    <div className="batch-modal-overlay" onClick={onClose}>
      <div className="batch-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="batch-modal-header">
          <div>
            <h2 className="batch-modal-title">Uploading Images</h2>
            <p className="batch-modal-subtitle">
              {rows.filter((r) => r.uploadState === 'success').length} of {rows.length} completed
            </p>
          </div>
          <button
            onClick={onClose}
            className="batch-modal-close"
            disabled={isUploading}
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </div>

        {/* Rows List */}
        <div className="batch-modal-rows">
          {rows.map((row) => (
            <div key={row.id} className="batch-modal-row-card">
              <div className="batch-modal-row-top">
                {/* Image Previews */}
                <div className="batch-modal-image-group">
                  <div className="batch-modal-image-box">
                    <span className="batch-modal-image-label">THUMBNAIL</span>
                    <div className="batch-modal-image-preview">
                      {row.thumbnailPreview && (
                        <img src={row.thumbnailPreview} alt="Thumbnail" />
                      )}
                    </div>
                  </div>

                  <div className="batch-modal-image-box">
                    <span className="batch-modal-image-label">LARGE</span>
                    <div className="batch-modal-image-preview">
                      {row.largePreview && <img src={row.largePreview} alt="Large" />}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="batch-modal-status">
                  <span
                    className={`batch-modal-status-badge ${
                      row.status === 'Active' ? 'active' : 'inactive'
                    }`}
                  >
                    {row.status}
                  </span>
                </div>

                {/* Upload Status */}
                <div className="batch-modal-upload-status">
                  {row.uploadState === 'pending' && (
                    <span className="batch-status-pending">Pending</span>
                  )}
                  {row.uploadState === 'uploading' && (
                    <span className="batch-status-uploading">Uploading...</span>
                  )}
                  {row.uploadState === 'success' && (
                    <span className="batch-status-success">✓ Uploaded</span>
                  )}
                  {row.uploadState === 'error' && (
                    <span className="batch-status-error">✗ Failed</span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {(row.uploadState === 'uploading' || row.uploadState === 'success') && (
                <div className="batch-modal-progress-section">
                  <div className="batch-modal-progress-header">
                    <span className="batch-modal-progress-label">
                      {row.uploadState === 'success' ? 'Uploaded ✓' : 'Uploading'}
                    </span>
                    <span className="batch-modal-progress-percentage">{row.progress}%</span>
                  </div>
                  <div className="batch-modal-progress-bar">
                    <div
                      className="batch-modal-progress-fill"
                      style={{ width: `${row.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {row.uploadState === 'error' && row.errorMessage && (
                <div className="batch-modal-error-message">{row.errorMessage}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;