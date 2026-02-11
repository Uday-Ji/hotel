import React from 'react';
import { Box, Typography } from '@mui/material';

const Plain: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Plain Page
      </Typography>
      <Typography variant="body1">
        This is a plain page.
      </Typography>
    </Box>
  );
};

export default Plain;