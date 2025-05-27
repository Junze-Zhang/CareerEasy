// src/components/Background.js
import React from 'react';
import { Box, Typography } from '@mui/material';

export default function Background() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg,rgb(222, 232, 246) 0%,rgb(190, 222, 246) 100%)',
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      {/* Repeating watermark pattern
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          opacity: 0.08,
        }}
      >
        {[...Array(9)].map((_, index) => (
          <Typography
            key={index}
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              transform: 'rotate(-45deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            WEBSITE IN DEVELOPMENT TECH DEMO ONLY
          </Typography>
        ))}
      </Box> */}
    </Box>
  );
}