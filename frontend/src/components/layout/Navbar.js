import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Box, Toolbar, Typography, Button, Container, Avatar } from '@mui/material';
import { Home, Person, Description, ExitToApp } from '@mui/icons-material';

const Navbar = ({ user, logout }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/dashboard"
                        sx={{
                            mr: 2,
                            display: 'flex',
                            textDecoration: 'none',
                            color: 'white'
                        }}
                    >
                        FileManager
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: 'flex' }}>
                        <Button
                            component={Link}
                            to="/dashboard"
                            color="inherit"
                            startIcon={<Home />}
                        >
                            Dashboard
                        </Button>
                        <Button
                            component={Link}
                            to="/files"
                            color="inherit"
                            startIcon={<Description />}
                        >
                            My Files
                        </Button>
                        <Button
                            component={Link}
                            to="/profile"
                            color="inherit"
                            startIcon={<Person />}
                        >
                            Profile
                        </Button>
                    </Box>

                    <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ mx: 1 }}>
                            {user?.username || 'User'}
                        </Typography>
                        <Avatar
                            alt={user?.username || 'User'}
                            src="/static/images/avatar/1.jpg"
                            sx={{ width: 32, height: 32, mr: 1 }}
                        />
                        <Button
                            color="inherit"
                            onClick={handleLogout}
                            startIcon={<ExitToApp />}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar; 