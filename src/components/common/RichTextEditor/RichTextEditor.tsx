import React from 'react';
import { Box, Typography, FormHelperText } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// ── Types ─────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  helperText?: string;
  minHeight?: number;
  maxHeight?: number;
  toolbarVariant?: 'full' | 'minimal' | 'basic';
  showCharCount?: boolean;
  maxLength?: number;
}

// ── Toolbar Configurations ────────────────────────────────────────────────

const toolbarConfigs = {
  full: {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  },
  basic: {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean'],
    ],
  },
  minimal: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean'],
    ],
  },
};

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'list', 'bullet',
  'indent',
  'align',
  'blockquote', 'code-block',
  'link', 'image', 'video',
];

// ── Component ─────────────────────────────────────────────────────────────

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Start typing...',
  disabled = false,
  readOnly = false,
  error = false,
  helperText,
  minHeight = 150,
  maxHeight,
  toolbarVariant = 'basic',
  showCharCount = false,
  maxLength,
}) => {
  // Get character count (strip HTML tags)
  const getCharCount = (html: string): number => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length;
  };

  const charCount = getCharCount(value);
  const isOverLimit = maxLength ? charCount > maxLength : false;

  // Handle change with character limit
  const handleChange = (content: string) => {
    if (maxLength && getCharCount(content) > maxLength) {
      return; // Don't update if over limit
    }
    onChange(content);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Label */}
      {label && (
        <Typography
          variant="body2"
          sx={{
            mb: 1,
            fontWeight: 600,
            color: error ? '#ef4444' : '#374151',
          }}
        >
          {label}
        </Typography>
      )}

      {/* Editor Container */}
      <Box
        sx={{
          '& .quill': {
            bgcolor: disabled ? '#f9fafb' : '#fff',
            borderRadius: 2,
            border: error ? '1px solid #ef4444' : '1px solid #e5e7eb',
            transition: 'border-color 0.2s',
            '&:focus-within': {
              borderColor: error ? '#ef4444' : '#3b82f6',
              boxShadow: error
                ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
                : '0 0 0 3px rgba(59, 130, 246, 0.1)',
            },
          },
          '& .ql-toolbar': {
            borderRadius: '8px 8px 0 0',
            border: 'none',
            borderBottom: '1px solid #e5e7eb',
            bgcolor: '#f9fafb',
            padding: '8px',
          },
          '& .ql-container': {
            border: 'none',
            fontSize: '14px',
            fontFamily: 'inherit',
            minHeight: `${minHeight}px`,
            maxHeight: maxHeight ? `${maxHeight}px` : 'none',
            overflow: maxHeight ? 'auto' : 'visible',
            borderRadius: '0 0 8px 8px',
          },
          '& .ql-editor': {
            minHeight: `${minHeight}px`,
            maxHeight: maxHeight ? `${maxHeight}px` : 'none',
            padding: '12px 15px',
            '&.ql-blank::before': {
              color: '#94a3b8',
              fontStyle: 'normal',
            },
          },
          '& .ql-snow .ql-stroke': {
            stroke: '#64748b',
          },
          '& .ql-snow .ql-fill': {
            fill: '#64748b',
          },
          '& .ql-snow .ql-picker-label': {
            color: '#64748b',
          },
          '& .ql-toolbar button:hover .ql-stroke': {
            stroke: '#3b82f6',
          },
          '& .ql-toolbar button:hover .ql-fill': {
            fill: '#3b82f6',
          },
          '& .ql-toolbar button.ql-active .ql-stroke': {
            stroke: '#3b82f6',
          },
          '& .ql-toolbar button.ql-active .ql-fill': {
            fill: '#3b82f6',
          },
          '& .ql-snow.ql-toolbar button:hover, & .ql-snow .ql-toolbar button:hover': {
            bgcolor: '#e0e7ff',
            borderRadius: '4px',
          },
          '& .ql-snow.ql-toolbar button.ql-active': {
            bgcolor: '#dbeafe',
            borderRadius: '4px',
          },
        }}
      >
        <ReactQuill
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={toolbarConfigs[toolbarVariant]}
          formats={formats}
          placeholder={placeholder}
          readOnly={readOnly || disabled}
        />
      </Box>

      {/* Helper Text and Character Count */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 0.5,
        }}
      >
        {helperText && (
          <FormHelperText
            error={error}
            sx={{
              margin: 0,
              fontSize: '0.75rem',
              color: error ? '#ef4444' : '#64748b',
            }}
          >
            {helperText}
          </FormHelperText>
        )}

        {showCharCount && (
          <Typography
            variant="caption"
            sx={{
              ml: 'auto',
              color: isOverLimit ? '#ef4444' : '#94a3b8',
              fontSize: '0.75rem',
              fontWeight: isOverLimit ? 600 : 400,
            }}
          >
            {charCount}
            {maxLength && ` / ${maxLength}`}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default RichTextEditor;