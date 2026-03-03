import React, { useCallback, useRef, useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  Chip,
} from '@mui/material';
import { CloudUpload, Close, AddPhotoAlternate, ZoomIn } from '@mui/icons-material';
import styles from './ImageUploader.module.css';

// ── Types ───────────────────────────────────────────────────────────────────
export interface UploadedImage {
  file: File;
  preview: string;
}

interface BaseProps {
  /** Hide the 'Add more' card in multi mode */
  hideAddMore?: boolean;
  /** Label shown above the uploader */
  label?: string;
  /** Accepted MIME types, e.g. "image/*" */
  accept?: string;
  /** Max file size in MB */
  maxSizeMB?: number;
  /** Show an error message below the uploader */
  error?: string;
  /** Helper text below the uploader */
  helperText?: string;
  /** Disabled state */
  disabled?: boolean;
}

// Single-mode: value is a single UploadedImage or null
interface SingleProps extends BaseProps {
  multiple?: false;
  value: UploadedImage | null;
  onChange: (image: UploadedImage | null) => void;
}

// Multi-mode: value is an array
interface MultiProps extends BaseProps {
  multiple: true;
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  /** Maximum number of images allowed (default: unlimited) */
  maxFiles?: number;
}

type ImageUploaderProps = SingleProps | MultiProps;

// ── Helpers ─────────────────────────────────────────────────────────────────

const toUploadedImage = (file: File): Promise<UploadedImage> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve({ file, preview: reader.result as string });
    reader.readAsDataURL(file);
  });

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

// ── Component ────────────────────────────────────────────────────────────────

const ImageUploader: React.FC<ImageUploaderProps> = (props) => {
  const {
    label,
    accept = 'image/*',
    maxSizeMB = 10,
    error,
    helperText,
    disabled = false,
    hideAddMore = false,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const isMulti = props.multiple === true;
  const currentImages: UploadedImage[] = isMulti
    ? (props as MultiProps).value
    : (props as SingleProps).value
    ? [(props as SingleProps).value as UploadedImage]
    : [];

  const maxFiles = isMulti ? (props as MultiProps).maxFiles ?? Infinity : 1;
  const canAddMore = currentImages.length < maxFiles;

  // ── File processing ──────────────────────────────────────────────────────

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      const valid: File[] = [];

      for (const file of arr) {
        if (!file.type.startsWith('image/')) {
          alert(`"${file.name}" is not an image file.`);
          continue;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          alert(`"${file.name}" exceeds the ${maxSizeMB} MB limit.`);
          continue;
        }
        valid.push(file);
      }

      if (!valid.length) return;

      if (!isMulti) {
        const img = await toUploadedImage(valid[0]);
        (props as SingleProps).onChange(img);
      } else {
        const p = props as MultiProps;
        const slots = maxFiles - p.value.length;
        const capped = valid.slice(0, slots);
        const newImages = await Promise.all(capped.map(toUploadedImage));
        p.onChange([...p.value, ...newImages]);
      }
    },
    [isMulti, maxSizeMB, maxFiles, props]
  );

  // ── Remove ───────────────────────────────────────────────────────────────

  const removeImage = (index: number) => {
    if (!isMulti) {
      (props as SingleProps).onChange(null);
    } else {
      const p = props as MultiProps;
      p.onChange(p.value.filter((_, i) => i !== index));
    }
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────

  const onDragOver = (e: React.DragEvent) => { 
    e.preventDefault(); 
    if (!disabled) setDragging(true); 
  };
  
  const onDragLeave = () => setDragging(false);
  
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled && canAddMore) processFiles(e.dataTransfer.files);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const shouldShowDropZone = currentImages.length === 0 || (!hideAddMore && isMulti && canAddMore && currentImages.length > 0);

  return (
    <Box className={styles.root}>
      {label && (
        <Typography variant="body2" fontWeight={600} mb={0.75} color="#374151">
          {label}
        </Typography>
      )}

      {/* Drop zone — shown when no images OR in multi mode with hideAddMore=false */}
      {currentImages.length === 0 && (
        <Box
          className={`${styles.dropZone} ${dragging ? styles.dragging : ''} ${error ? styles.hasError : ''} ${disabled ? styles.disabled : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !disabled && canAddMore && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            hidden
            accept={accept}
            multiple={isMulti}
            onChange={(e) => e.target.files && processFiles(e.target.files)}
          />
          <CloudUpload className={styles.uploadIcon} />
          <Typography variant="body2" fontWeight={500} color="#374151" mt={1}>
            {dragging ? 'Drop to upload' : 'Drag & drop or click to browse'}
          </Typography>
          <Typography variant="caption" color="#9ca3af" mt={0.25}>
            {isMulti
              ? `Up to ${maxFiles === Infinity ? '∞' : maxFiles} images · max ${maxSizeMB} MB each`
              : `Max ${maxSizeMB} MB`}
          </Typography>
        </Box>
      )}

      {/* Preview grid - REPLACES drop zone when images exist */}
      {currentImages.length > 0 && (
        <Box className={`${styles.previewGrid} ${isMulti ? styles.multiGrid : styles.singleGrid}`}>
          {currentImages.map((img, i) => (
            <Box key={i} className={styles.previewCard}>
              <img src={img.preview} alt={`upload-${i}`} className={styles.previewImg} />

              {/* Overlay actions */}
              <Box className={styles.overlay}>
                <Tooltip title="Preview">
                  <IconButton
                    size="small"
                    onClick={() => setLightbox(img.preview)}
                    sx={{ color: '#fff', background: 'rgba(0,0,0,0.4)', '&:hover': { background: 'rgba(0,0,0,0.65)' } }}
                  >
                    <ZoomIn fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove">
                  <IconButton
                    size="small"
                    onClick={() => removeImage(i)}
                    disabled={disabled}
                    sx={{ color: '#fff', background: 'rgba(220,38,38,0.7)', '&:hover': { background: 'rgba(220,38,38,0.9)' } }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* File info */}
              <Box className={styles.fileInfo}>
                <Typography
                  variant="caption"
                  noWrap
                  sx={{ maxWidth: '70%', display: 'block', color: '#374151' }}
                  title={img.file.name}
                >
                  {img.file.name}
                </Typography>
                <Typography variant="caption" color="#9ca3af">
                  {formatSize(img.file.size)}
                </Typography>
              </Box>
            </Box>
          ))}

          {/* "Add more" card in multi mode INSIDE the preview grid */}
          {isMulti && canAddMore && !hideAddMore && (
            <Box
              className={`${styles.previewCard} ${styles.addMoreCard}`}
              onClick={() => inputRef.current?.click()}
            >
              <AddPhotoAlternate sx={{ fontSize: 32, color: '#9ca3af' }} />
              <Typography variant="caption" color="#9ca3af" mt={0.5}>
                Add more
              </Typography>
              <Typography variant="caption" color="#9ca3af" fontSize="0.7rem">
                {currentImages.length}/{maxFiles === Infinity ? '∞' : maxFiles}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Hidden input for "Add more" functionality */}
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        multiple={isMulti}
        onChange={(e) => e.target.files && processFiles(e.target.files)}
      />

      {/* Error / helper */}
      {error && (
        <Typography variant="caption" color="error" mt={0.5} display="block">
          {error}
        </Typography>
      )}
      {!error && helperText && (
        <Typography variant="caption" color="#9ca3af" mt={0.5} display="block">
          {helperText}
        </Typography>
      )}

      {/* Lightbox */}
      {lightbox && (
        <Box className={styles.lightboxBackdrop} onClick={() => setLightbox(null)}>
          <Box className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <IconButton
              onClick={() => setLightbox(null)}
              sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', background: 'rgba(0,0,0,0.5)' }}
            >
              <Close />
            </IconButton>
            <img src={lightbox} alt="preview" style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 8 }} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ImageUploader;