import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import axios from 'axios';
import API_URL from '../config';

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);

        if (token) {
            // Fetch user data to display username
            axios.get(`${API_URL}/api/users/me/`, {
                headers: { Authorization: `Token ${token}` }
            })
                .then(response => {
                    setUsername(response.data.username);
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                });
        }
    }, []);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        const token = localStorage.getItem('token');

        try {
            await axios.post(`${API_URL}/api/logout/`, {}, {
                headers: { Authorization: `Token ${token}` }
            });

            localStorage.removeItem('token');
            setIsAuthenticated(false);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }

        handleClose();
    };

    const handleProfile = () => {
        navigate('/profile');
        handleClose();
    };

    const handleDashboard = () => {
        navigate('/dashboard');
        handleClose();
    };

    const handleFiles = () => {
        navigate('/files');
        handleClose();
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        File Manager
                    </Link>
                </Typography>

                {isAuthenticated ? (
                    <Box>
                        <IconButton
                            size="large"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <AccountCircleIcon />
                            <Typography variant="body1" sx={{ ml: 1 }}>
                                {username || 'User'}
                            </Typography>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleDashboard}>
                                <HomeIcon fontSize="small" sx={{ mr: 1 }} />
                                Dashboard
                            </MenuItem>
                            <MenuItem onClick={handleProfile}>
                                <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                                Profile
                            </MenuItem>
                            <MenuItem onClick={handleFiles}>
                                <FileCopyIcon fontSize="small" sx={{ mr: 1 }} />
                                Files
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <div>
                        <Button color="inherit" component={Link} to="/login">Login</Button>
                        <Button color="inherit" component={Link} to="/register">Register</Button>
                    </div>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 