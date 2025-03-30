import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Divider,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, Save, Cancel, Home } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Profile = ({ user, setUser }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPhoneNumber, setEditingPhoneNumber] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/addresses/');
      setAddresses(res.data);
      setLoading(false);
    } catch (err) {
      setError('Error loading addresses. Please try again later.');
      setLoading(false);
    }
  };

  // Handle email update
  const handleEmailSubmit = async (newEmail) => {
    try {
      // Update email in backend
      const res = await axios.patch('/profile/', { email: newEmail });
      setUser(res.data);
      setEditingEmail(false);
      setSuccess('Email updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to update email: ${err.message}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Handle phone number update
  const handlePhoneNumberSubmit = async (newPhoneNumber) => {
    try {
      const res = await axios.patch('/profile/', { phone_number: newPhoneNumber });
      setUser(res.data);
      setEditingPhoneNumber(false);
      setSuccess('Phone number updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update phone number. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Handle address dialog open
  const handleAddressDialogOpen = (address = null) => {
    setCurrentAddress(address);
    setAddressDialogOpen(true);
  };

  // Handle address dialog close
  const handleAddressDialogClose = () => {
    setAddressDialogOpen(false);
    setCurrentAddress(null);
    addressFormik.resetForm();
  };

  // Handle address delete
  const handleAddressDelete = async (addressId) => {
    try {
      await axios.delete(`/addresses/${addressId}/`);
      setAddresses(addresses.filter(address => address.id !== addressId));
      setSuccess('Address deleted successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete address. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Email formik
  const emailFormik = useFormik({
    initialValues: {
      email: user?.email || '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Enter a valid email address')
        .required('Email is required'),
    }),
    onSubmit: (values) => {
      handleEmailSubmit(values.email);
    },
  });

  // Phone number formik
  const phoneNumberFormik = useFormik({
    initialValues: {
      phone_number: user?.phone_number || '',
    },
    validationSchema: Yup.object({
      phone_number: Yup.string().nullable(),
    }),
    onSubmit: (values) => {
      handlePhoneNumberSubmit(values.phone_number);
    },
  });

  // Address formik
  const addressFormik = useFormik({
    initialValues: {
      street: currentAddress?.street || '',
      city: currentAddress?.city || '',
      state: currentAddress?.state || '',
      postal_code: currentAddress?.postal_code || '',
      country: currentAddress?.country || '',
      is_default: currentAddress?.is_default || false,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      street: Yup.string().required('Street is required'),
      city: Yup.string().required('City is required'),
      state: Yup.string().required('State is required'),
      postal_code: Yup.string().required('Postal code is required'),
      country: Yup.string().required('Country is required'),
    }),
    onSubmit: async (values) => {
      try {
        if (currentAddress) {
          // Update existing address
          const res = await axios.put(`/addresses/${currentAddress.id}/`, values);
          setAddresses(addresses.map(addr => addr.id === currentAddress.id ? res.data : addr));
        } else {
          // Create new address
          const res = await axios.post('/addresses/', values);
          setAddresses([...addresses, res.data]);
        }
        handleAddressDialogClose();
        setSuccess('Address saved successfully.');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to save address. Please try again.');
        setTimeout(() => setError(''), 3000);
      }
    },
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      {/* Success/Error messages */}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* User Info Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>

        <Grid container spacing={3}>
          {/* Email */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Email Address
              </Typography>

              {editingEmail ? (
                <Box component="form" onSubmit={emailFormik.handleSubmit}>
                  <TextField
                    fullWidth
                    size="small"
                    name="email"
                    value={emailFormik.values.email}
                    onChange={emailFormik.handleChange}
                    error={emailFormik.touched.email && Boolean(emailFormik.errors.email)}
                    helperText={emailFormik.touched.email && emailFormik.errors.email}
                    autoFocus
                  />
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      type="submit"
                      startIcon={<Save />}
                    >
                      Save
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setEditingEmail(false)}
                      startIcon={<Cancel />}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1">
                    {user?.email}
                  </Typography>
                  <IconButton
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                    onClick={() => setEditingEmail(true)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Phone Number */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Phone Number
              </Typography>

              {editingPhoneNumber ? (
                <Box component="form" onSubmit={phoneNumberFormik.handleSubmit}>
                  <TextField
                    fullWidth
                    size="small"
                    name="phone_number"
                    value={phoneNumberFormik.values.phone_number}
                    onChange={phoneNumberFormik.handleChange}
                    error={phoneNumberFormik.touched.phone_number && Boolean(phoneNumberFormik.errors.phone_number)}
                    helperText={phoneNumberFormik.touched.phone_number && phoneNumberFormik.errors.phone_number}
                    autoFocus
                  />
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      type="submit"
                      startIcon={<Save />}
                    >
                      Save
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setEditingPhoneNumber(false)}
                      startIcon={<Cancel />}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1">
                    {user?.phone_number || 'Not set'}
                  </Typography>
                  <IconButton
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                    onClick={() => setEditingPhoneNumber(true)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Name */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Name
            </Typography>
            <Typography variant="body1">
              {user?.first_name} {user?.last_name}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Addresses Section */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            My Addresses
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleAddressDialogOpen()}
          >
            Add Address
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {addresses.length === 0 ? (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
            You haven't added any addresses yet.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {addresses.map((address) => (
              <Grid item xs={12} md={6} key={address.id}>
                <Card
                  variant="outlined"
                  sx={{
                    position: 'relative',
                    borderColor: address.is_default ? 'primary.main' : 'inherit'
                  }}
                >
                  {address.is_default && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderBottomLeftRadius: 4,
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Home fontSize="small" sx={{ mr: 0.5 }} />
                      Default
                    </Box>
                  )}
                  <CardContent>
                    <Typography variant="body1">
                      {address.street}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {address.city}, {address.state} {address.postal_code}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {address.country}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleAddressDialogOpen(address)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleAddressDelete(address.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Address Dialog */}
      <Dialog
        open={addressDialogOpen}
        onClose={handleAddressDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {currentAddress ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={addressFormik.handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="street"
                  label="Street Address"
                  value={addressFormik.values.street}
                  onChange={addressFormik.handleChange}
                  error={addressFormik.touched.street && Boolean(addressFormik.errors.street)}
                  helperText={addressFormik.touched.street && addressFormik.errors.street}
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="city"
                  label="City"
                  value={addressFormik.values.city}
                  onChange={addressFormik.handleChange}
                  error={addressFormik.touched.city && Boolean(addressFormik.errors.city)}
                  helperText={addressFormik.touched.city && addressFormik.errors.city}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="state"
                  label="State/Province"
                  value={addressFormik.values.state}
                  onChange={addressFormik.handleChange}
                  error={addressFormik.touched.state && Boolean(addressFormik.errors.state)}
                  helperText={addressFormik.touched.state && addressFormik.errors.state}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="postal_code"
                  label="Postal Code"
                  value={addressFormik.values.postal_code}
                  onChange={addressFormik.handleChange}
                  error={addressFormik.touched.postal_code && Boolean(addressFormik.errors.postal_code)}
                  helperText={addressFormik.touched.postal_code && addressFormik.errors.postal_code}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="country"
                  label="Country"
                  value={addressFormik.values.country}
                  onChange={addressFormik.handleChange}
                  error={addressFormik.touched.country && Boolean(addressFormik.errors.country)}
                  helperText={addressFormik.touched.country && addressFormik.errors.country}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant={addressFormik.values.is_default ? "contained" : "outlined"}
                    onClick={() => addressFormik.setFieldValue('is_default', !addressFormik.values.is_default)}
                    startIcon={<Home />}
                    sx={{ mr: 1 }}
                  >
                    {addressFormik.values.is_default ? 'Default Address' : 'Set as Default'}
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {addressFormik.values.is_default
                      ? 'This address will be used as your default address'
                      : 'Mark this as your default address'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddressDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={addressFormik.handleSubmit}
            disabled={!addressFormik.isValid || addressFormik.isSubmitting}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 