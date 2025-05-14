// src/layouts/MainLayout.js
import React from 'react';
import { Box } from '@mui/material';

function MainLayout({ children }) {
    return (
        <Box>
            {/* We can add common elements like header, footer, etc. here later */}
            {children}
        </Box>
    );
}

export default MainLayout;