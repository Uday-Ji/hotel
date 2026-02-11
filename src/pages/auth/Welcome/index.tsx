import React from 'react';
import { Box, Typography } from '@mui/material';

const Welcome: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome
      </Typography>
      <Typography variant="body1">
        Welcome to the Hotel Booking System
      </Typography>
    </Box>
  );
};

export default Welcome;