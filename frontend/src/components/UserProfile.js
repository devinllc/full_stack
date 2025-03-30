import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, TextField, Button, Grid, IconButton, Divider, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Edit, Delete, Add, Save } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const UserProfile = () => {
  const [addresses, setAddresses] = useState([]);
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Address form state
  const [openAddressDialog, setOpenAddressDialog] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    id: null
  });
  const [editingAddress, setEditingAddress] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/profile/`, {
          headers: { Authorization: `Token ${token}` }
        });

        setUsername(response.data.username || '');
        setPhoneNumber(response.data.phone_number || '');
        setFirstName(response.data.first_name || '');
        setLastName(response.data.last_name || '');
        setEmail(response.data.email || '');
      } catch (err) {
        setError('Failed to load user profile');
        console.error('Error fetching user data:', err);
      }
    };

    const fetchAddresses = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/addresses/`, {
          headers: { Authorization: `Token ${token}` }
        });

        setAddresses(response.data);
      } catch (err) {
        console.error('Error fetching addresses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchAddresses();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem('token');

    try {
      await axios.put(
        `${API_URL}/api/profile/`,
        {
          username,
          phone_number: phoneNumber,
          first_name: firstName,
          last_name: lastName
        },
        {
          headers: { Authorization: `Token ${token}` }
        }
      );

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    }
  };

  const handleAddressDialogOpen = (address = null) => {
    if (address) {
      setAddressForm(address);
      setEditingAddress(true);
    } else {
      setAddressForm({
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        id: null
      });
      setEditingAddress(false);
    }
    setOpenAddressDialog(true);
  };

  const handleAddressDialogClose = () => {
    setOpenAddressDialog(false);
  };

  const handleAddressChange = (e) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveAddress = async () => {
    const token = localStorage.getItem('token');

    try {
      if (editingAddress) {
        // Update existing address
        await axios.put(
          `${API_URL}/api/addresses/${addressForm.id}/`,
          addressForm,
          {
            headers: { Authorization: `Token ${token}` }
          }
        );
      } else {
        // Create new address
        await axios.post(
          `${API_URL}/api/addresses/`,
          addressForm,
          {
            headers: { Authorization: `Token ${token}` }
          }
        );
      }

      // Refresh addresses
      const response = await axios.get(`${API_URL}/api/addresses/`, {
        headers: { Authorization: `Token ${token}` }
      });

      setAddresses(response.data);
      handleAddressDialogClose();
      setSuccess(editingAddress ? 'Address updated!' : 'Address added!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save address');
      console.error('Error saving address:', err);
    }
  };

  const handleDeleteAddress = async (id) => {
    const token = localStorage.getItem('token');

    try {
      await axios.delete(`${API_URL}/api/addresses/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });

      // Update addresses list
      setAddresses(addresses.filter(address => address.id !== id));
      setSuccess('Address deleted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete address');
      console.error('Error deleting address:', err);
    }
  };

  if (loading) return <Typography align="center" variant="h5">Loading profile...</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>User Profile</Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        )}

        {success && (
          <Typography color="success.main" sx={{ mb: 2 }}>{success}</Typography>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              disabled
              margin="normal"
              helperText="Email cannot be changed"
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateProfile}
              startIcon={<Save />}
            >
              Save Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Manage Addresses
          <IconButton color="primary" onClick={() => handleAddressDialogOpen()} sx={{ ml: 2 }}>
            <Add />
          </IconButton>
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {addresses.length === 0 ? (
          <Typography color="textSecondary">No addresses added yet.</Typography>
        ) : (
          <List>
            {addresses.map((address) => (
              <ListItem key={address.id} divider sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <ListItemText
                  primary={`${address.street}, ${address.city}`}
                  secondary={`${address.state}, ${address.zipcode}, ${address.country}`}
                />
                <div>
                  <IconButton onClick={() => handleAddressDialogOpen(address)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteAddress(address.id)} color="error">
                    <Delete />
                  </IconButton>
                </div>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Address Dialog */}
      <Dialog open={openAddressDialog} onClose={handleAddressDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            name="street"
            label="Street Address"
            value={addressForm.street}
            onChange={handleAddressChange}
          />
          <TextField
            fullWidth
            margin="dense"
            name="city"
            label="City"
            value={addressForm.city}
            onChange={handleAddressChange}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="dense"
                name="state"
                label="State/Province"
                value={addressForm.state}
                onChange={handleAddressChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="dense"
                name="zipcode"
                label="Zip/Postal Code"
                value={addressForm.zipcode}
                onChange={handleAddressChange}
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            margin="dense"
            name="country"
            label="Country"
            value={addressForm.country}
            onChange={handleAddressChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddressDialogClose}>Cancel</Button>
          <Button onClick={handleSaveAddress} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile; 