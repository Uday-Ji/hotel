import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import styles from './Welcome.module.css';

const Welcome: React.FC = () => {
  return (
    <Box className={styles.container}>
      <Paper className={styles.header}>
        <Typography variant="h5" className={styles.title}>
          Welcome
        </Typography>
      </Paper>

      <Paper className={styles.content}>
        <Box className={styles.imageContainer}>
          <img
            src="/images/package-welcome.jpg"
            alt="Package Welcome"
            className={styles.welcomeImage}
            onError={(e) => {
              // Fallback for missing image
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Package+Management';
            }}
          />
        </Box>
        <Typography variant="h6" className={styles.subtitle}>
          Welcome Extranet Package
        </Typography>
      </Paper>
    </Box>
  );
};

export default Welcome;