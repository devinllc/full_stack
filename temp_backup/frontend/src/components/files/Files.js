import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
} from '@mui/material';
import { UploadFile, Download, Delete } from '@mui/icons-material';
import { format } from 'date-fns';

const Files = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState({ success: false, message: '' });

    // Fetch files on component mount
    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/files/');
            setFiles(res.data);
            setLoading(false);
        } catch (err) {
            setError('Error loading files. Please try again later.');
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            setUploadStatus({ success: false, message: '' });

            // Create form data to send file to backend
            const formData = new FormData();
            formData.append('file', file);
            formData.append('filename', file.name);
            formData.append('file_type', file.name.split('.').pop().toLowerCase());
            formData.append('file_size', file.size);

            // Upload file through Django backend (which will handle S3 upload)
            const res = await axios.post('/files/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFiles([...files, res.data]);
            setUploadStatus({
                success: true,
                message: `File "${res.data.filename}" uploaded successfully!`
            });
        } catch (err) {
            setUploadStatus({
                success: false,
                message: `Error uploading file: ${err.message || 'Unknown error'}`
            });
        } finally {
            setUploading(false);
            // Reset file input
            event.target.value = '';
        }
    };

    const handleDownload = (fileUrl, fileName) => {
        // Create a temporary anchor element to download the file
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (fileId) => {
        try {
            // Delete through backend (backend will handle S3 deletion)
            await axios.delete(`/files/${fileId}/`);

            setFiles(files.filter(file => file.id !== fileId));
            setUploadStatus({
                success: true,
                message: 'File deleted successfully!'
            });
        } catch (err) {
            setUploadStatus({
                success: false,
                message: `Error deleting file: ${err.message || 'Unknown error'}`
            });
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, 'MMM dd, yyyy hh:mm a');
        } catch (e) {
            return dateString;
        }
    };

    const getFileTypeLabel = (fileType) => {
        const types = {
            'pdf': 'PDF',
            'excel': 'Excel',
            'txt': 'Text',
            'docx': 'Word',
            'other': 'Other',
        };
        return types[fileType] || fileType;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                My Files
            </Typography>

            {/* File upload section */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Upload New File
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<UploadFile />}
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : 'Choose File'}
                        <input
                            type="file"
                            hidden
                            onChange={handleFileUpload}
                        />
                    </Button>
                    {uploading && <CircularProgress size={24} sx={{ ml: 2 }} />}
                </Box>

                {uploadStatus.message && (
                    <Alert severity={uploadStatus.success ? 'success' : 'error'} sx={{ mt: 2 }}>
                        {uploadStatus.message}
                    </Alert>
                )}
            </Paper>

            {/* Files table */}
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                {error ? (
                    <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
                ) : files.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                            No files uploaded yet. Upload your first file above.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Filename</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Upload Date</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {files.map((file) => (
                                    <TableRow key={file.id} hover>
                                        <TableCell
                                            component="th"
                                            scope="row"
                                            sx={{ cursor: 'pointer', color: 'primary.main' }}
                                            onClick={() => handleDownload(file.file_url, file.filename)}
                                        >
                                            {file.filename}
                                        </TableCell>
                                        <TableCell>{getFileTypeLabel(file.file_type)}</TableCell>
                                        <TableCell>{formatDate(file.upload_date)}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Download">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleDownload(file.file_url, file.filename)}
                                                >
                                                    <Download />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(file.id)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
};

export default Files; 