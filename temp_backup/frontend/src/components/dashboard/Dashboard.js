import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import API_URL from '../../config';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_files: 0,
        total_size: 0,
        recent_files: 0,
        file_types: {},
        files_per_user: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dashboard stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication required');
                    setLoading(false);
                    return;
                }

                const res = await axios.get(`${API_URL}/api/dashboard-stats/`, {
                    headers: { Authorization: `Token ${token}` }
                });
                setStats(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error loading dashboard data:', err);
                setError('Error loading dashboard data');
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Pie chart data for recent vs older files
    const recentFilesChartData = {
        labels: ['Recent Files (30 Days)', 'Older Files'],
        datasets: [
            {
                label: 'Files',
                data: [stats.recent_files, Math.max(0, stats.total_files - stats.recent_files)],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Pie chart data for file types
    const fileTypeChartData = {
        labels: Object.keys(stats.file_types).map(type =>
            type.charAt(0).toUpperCase() + type.slice(1)
        ),
        datasets: [
            {
                label: 'File Types',
                data: Object.values(stats.file_types),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(199, 199, 199, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Bar chart data for files per user
    const filesByUserChartData = {
        labels: Object.keys(stats.files_per_user),
        datasets: [
            {
                label: 'Files per User',
                data: Object.values(stats.files_per_user),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                {/* Total Files Card */}
                <Grid item xs={12} md={4}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 140,
                        }}
                    >
                        <Typography component="h2" variant="h5" color="primary" gutterBottom>
                            Total Files
                        </Typography>
                        <Typography component="p" variant="h3">
                            {stats.total_files || 0}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Total Size Card */}
                <Grid item xs={12} md={4}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 140,
                        }}
                    >
                        <Typography component="h2" variant="h5" color="primary" gutterBottom>
                            Total Size
                        </Typography>
                        <Typography component="p" variant="h3">
                            {formatFileSize(stats.total_size || 0)}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Recent Files Card */}
                <Grid item xs={12} md={4}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 140,
                        }}
                    >
                        <Typography component="h2" variant="h5" color="primary" gutterBottom>
                            Recent Files (30 days)
                        </Typography>
                        <Typography component="p" variant="h3">
                            {stats.recent_files || 0}
                        </Typography>
                    </Paper>
                </Grid>

                {/* File Types Chart */}
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 300,
                        }}
                    >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            File Types
                        </Typography>
                        <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center' }}>
                            {stats.total_files > 0 && Object.keys(stats.file_types).length > 0 ? (
                                <Pie data={fileTypeChartData} options={{ maintainAspectRatio: false }} />
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No files uploaded yet
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Recent vs Older Files Chart */}
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 300,
                        }}
                    >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Recent vs Older Files
                        </Typography>
                        <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center' }}>
                            {stats.total_files > 0 ? (
                                <Pie data={recentFilesChartData} options={{ maintainAspectRatio: false }} />
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No files uploaded yet
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Files per User Chart */}
                <Grid item xs={12}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 300,
                        }}
                    >
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Files by User
                        </Typography>
                        <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center' }}>
                            {stats.total_files > 0 && Object.keys(stats.files_per_user).length > 0 ? (
                                <Bar
                                    data={filesByUserChartData}
                                    options={{
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    stepSize: 1
                                                }
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No files uploaded yet
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard; 