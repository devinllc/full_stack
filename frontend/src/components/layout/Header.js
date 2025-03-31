import React from 'react';
import { AppBar, Toolbar, Typography, useTheme } from '@mui/material';

const Header = ({ title }) => {
    const theme = useTheme();

    return (
        <AppBar position="static" sx={{ marginBottom: 2 }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {title || 'File Manager'}
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

export default Header; 