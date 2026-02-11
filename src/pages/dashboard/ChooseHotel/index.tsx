import React from 'react';
import { Box, Typography } from '@mui/material';

const ChooseHotel: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Choose Hotel
      </Typography>
      <Typography variant="body1">
        Select a hotel to continue.
      </Typography>
    </Box>
  );
};

export default ChooseHotel;