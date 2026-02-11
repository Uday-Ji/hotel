import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { Construction } from '@mui/icons-material';
import styles from './PageTemplate.module.css';

const PageTemplate: React.FC = () => {
  const location = useLocation();
  
  // Extract page name from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageName = pathParts[pathParts.length - 1]
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <Box className={styles.container}>
      <Paper className={styles.paper}>
        <Box className={styles.header}>
          <Construction sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
          <Typography variant="h5" component="h1" gutterBottom>
            {pageName}
          </Typography>
          <Chip label="Ready for Implementation" color="primary" size="small" />
        </Box>
        <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
          This page is part of the {pathParts[0].toUpperCase()} module and is ready for development.
        </Typography>
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            <strong>Path:</strong> {location.pathname}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PageTemplate;