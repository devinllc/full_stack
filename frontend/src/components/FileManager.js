import React, { useState, useEffect } from 'react';
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
  IconButton,
  Box,
  LinearProgress,
  Alert,
  Grid
} from '@mui/material';
import { CloudUpload, Download, Delete, PictureAsPdf, InsertDriveFile, Description } from '@mui/icons-material';
import axios from 'axios';
import API_URL from '../config';
import { format } from 'date-fns';

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.get(`${API_URL}/api/files/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setFiles(response.data);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files');
    }
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('filename', selectedFile.name);
    formData.append('file_size', selectedFile.size);

    try {
      await axios.post(`${API_URL}/api/files/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Token ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      setSuccess('File uploaded successfully!');
      setSelectedFile(null);
      fetchFiles();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (fileUrl, filename) => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      await axios.delete(`${API_URL}/api/files/${fileId}/`, {
        headers: { Authorization: `Token ${token}` }
      });

      setSuccess('File deleted successfully!');
      fetchFiles();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    }
  };

  // Get file icon based on file type
  const getFileIcon = (filename) => {
    if (!filename) return <InsertDriveFile />;

    const extension = filename.split('.').pop().toLowerCase();

    switch (extension) {
      case 'pdf':
        return <PictureAsPdf color="error" />;
      case 'doc':
      case 'docx':
        return <Description color="primary" />;
      case 'xls':
      case 'xlsx':
        return <Description color="success" />;
      case 'txt':
        return <Description color="action" />;
      default:
        return <InsertDriveFile />;
    }
  };

  // Get readable file type
  const getFileType = (filename) => {
    if (!filename) return 'Unknown';

    const extension = filename.split('.').pop().toLowerCase();

    switch (extension) {
      case 'pdf':
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'Word';
      case 'xls':
      case 'xlsx':
        return 'Excel';
      case 'txt':
        return 'Text';
      default:
        return extension.toUpperCase();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>File Manager</Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
        )}

        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              multiple={false}
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="outlined"
                component="span"
                disabled={uploading}
                startIcon={<CloudUpload />}
                fullWidth
              >
                Select File
              </Button>
            </label>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="contained"
              color="primary"
              disabled={!selectedFile || uploading}
              onClick={handleUpload}
              startIcon={<CloudUpload />}
              fullWidth
            >
              Upload File
            </Button>
          </Grid>

          <Grid item xs={12}>
            {uploading && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="text.secondary" align="center">
                  {uploadProgress}%
                </Typography>
              </Box>
            )}

            {selectedFile && !uploading && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {selectedFile.name}
              </Typography>
            )}
          </Grid>
        </Grid>

        <TableContainer>
          <Table aria-label="files table">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Filename</TableCell>
                <TableCell>File Type</TableCell>
                <TableCell>Upload Date</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No files uploaded yet</TableCell>
                </TableRow>
              ) : (
                files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>{getFileIcon(file.filename)}</TableCell>
                    <TableCell
                      onClick={() => handleDownload(file.file_url, file.filename)}
                      sx={{
                        cursor: 'pointer',
                        color: 'primary.main',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {file.filename}
                    </TableCell>
                    <TableCell>{getFileType(file.filename)}</TableCell>
                    <TableCell>
                      {file.upload_date ? format(new Date(file.upload_date), 'MMM d, yyyy h:mm a') : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {file.file_size ? `${(file.file_size / 1024).toFixed(2)} KB` : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleDownload(file.file_url, file.filename)}
                        title="Download"
                      >
                        <Download />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(file.id)}
                        title="Delete"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default FileManager; 