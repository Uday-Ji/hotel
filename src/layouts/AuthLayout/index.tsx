import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper } from '@mui/material';
import styles from './AuthLayout.module.css';

const AuthLayout: React.FC = () => {
  return (
    <Box className={styles.authLayout}>
      <Container maxWidth="sm">
        <Paper elevation={3} className={styles.authPaper}>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;