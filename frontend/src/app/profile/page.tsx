"use client";
// app/profile/page.jsx

import React , {useEffect} from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  // Divider,
  Button,
  Chip,
} from '@mui/material';

import { useAuth } from '@/contexts/AuthContext';


const ProfilePage = () => {
  const userbase = useAuth();

  //useeffect to update the user data
  useEffect(() => {

  }
  , [userbase]);

  const user = {
    name: userbase?.user?.name || 'John Doe',
    email: userbase?.user?.email || 'sample@mail.com',
    addresses: [
      {
        id: 1,
        label: 'Home',
        address: '1234 Main St, Cityville, ST 98765',
      },
      {
        id: 2,
        label: 'Office',
        address: '5678 Business Ave, Townsville, ST 12345',
      },
    ],
    language: 'English',
    paymentMethods: [
      {
        id: 1,
        type: 'Credit Card',
        lastFourDigits: '**** 1234',
      },
      {
        id: 2,
        type: 'PayPal',
        email: 'paypal@example.com',
      },
    ],
    cashbackEarned: 250.75,
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      {/* Personal Info */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary">Name</Typography>
              <Typography>{user.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="text.secondary">Email</Typography>
              <Typography>{user.email}</Typography>
            </Grid>
          </Grid>
          <Button variant="outlined" color="primary" fullWidth sx={{ mt: 2 }}>
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Saved Addresses
          </Typography>
          {user.addresses.map((address) => (
            <Box key={address.id} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">{address.label}</Typography>
              <Typography>{address.address}</Typography>
            </Box>
          ))}
          <Button variant="outlined" color="primary" fullWidth sx={{ mt: 2 }}>
            Add New Address
          </Button>
        </CardContent>
      </Card>

      {/* Language Preference */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Language Preference
          </Typography>
          <Chip label={user.language} color="primary" />
          <Button variant="outlined" color="primary" fullWidth sx={{ mt: 2 }}>
            Change Language
          </Button>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Saved Payment Methods
          </Typography>
          {user.paymentMethods.map((method) => (
            <Box key={method.id} sx={{ mb: 2 }}>
              <Typography variant="body2">{method.type}</Typography>
              <Typography>{method.lastFourDigits || method.email}</Typography>
            </Box>
          ))}
          <Button variant="outlined" color="primary" fullWidth sx={{ mt: 2 }}>
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Cashback Section */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Cashback
          </Typography>
          <Typography variant="h5" color="success.main">
            ₹{user.cashbackEarned.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Redeem or view cashback history.
          </Typography>
          <Button variant="contained" color="success" fullWidth sx={{ mt: 2 }}>
            View Cashback History
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;