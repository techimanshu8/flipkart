'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Step,
  Stepper,
  StepLabel,
  IconButton,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  LocalShipping,
  Payment,
  ShoppingCart,
  CheckCircle,
  Home,
  Work,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/services/api';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface Address {
  _id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
}

interface PaymentMethod {
  type: 'card' | 'upi' | 'cod';
  name: string;
  description: string;
}

const addressSchema = yup.object({
  name: yup.string().required('Name is required'),
  street: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  pincode: yup.string().required('Pincode is required').matches(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
  phone: yup.string().required('Phone number is required').matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  type: yup.string().required('Address type is required'),
});

const steps = ['Cart Review', 'Delivery Address', 'Payment', 'Order Confirmation'];

const CheckoutPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('cod');
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addressSchema),
    defaultValues: {
      name: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      type: 'home',
    },
  });

  const paymentMethods: PaymentMethod[] = [
    {
      type: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
    },
    {
      type: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay securely with your card',
    },
    {
      type: 'upi',
      name: 'UPI',
      description: 'Pay using UPI ID or QR code',
    },
  ];

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses');
      setAddresses(response.data.addresses);
      const defaultAddress = response.data.addresses.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress._id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  // Save address
  const saveAddress = async (data: any) => {
    try {
      setLoading(true);
      if (editingAddress) {
        await api.put(`/users/addresses/${editingAddress._id}`, data);
        toast.success('Address updated successfully');
      } else {
        await api.post('/users/addresses', data);
        toast.success('Address added successfully');
      }
      fetchAddresses();
      setAddressDialogOpen(false);
      reset();
      setEditingAddress(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  // Delete address
  const deleteAddress = async (addressId: string) => {
    try {
      await api.delete(`/users/addresses/${addressId}`);
      toast.success('Address deleted successfully');
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    }
  };

  // Handle edit address
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    reset({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phone: address.phone,
      type: address.type,
    });
    setAddressDialogOpen(true);
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        deliveryAddress: selectedAddress,
        paymentMethod: selectedPayment,
        items: cart?.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: cart?.totalAmount,
      };

      const response = await api.post('/orders', orderData);
      
      if (selectedPayment === 'cod') {
        // For COD, order is placed immediately
        setOrderPlaced(true);
        setActiveStep(3);
        clearCart();
        toast.success('Order placed successfully!');
      } else {
        // For other payment methods, simulate payment
        setTimeout(() => {
          setOrderPlaced(true);
          setActiveStep(3);
          clearCart();
          toast.success('Payment successful! Order placed.');
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Handle next step
  const handleNext = () => {
    if (activeStep === 0) {
      if (!cart || cart.items.length === 0) {
        toast.error('Your cart is empty');
        return;
      }
    } else if (activeStep === 1) {
      if (!selectedAddress) {
        toast.error('Please select a delivery address');
        return;
      }
    }
    setActiveStep(prev => prev + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!cart || cart.items.length === 0) {
      router.push('/cart');
      return;
    }
    fetchAddresses();
  }, [user, cart]);

  if (!user || !cart) return null;

  // Step content components
  const CartReviewStep = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        {cart.items.map((item) => (
          <Box key={item._id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Image
              src={item.product.images[0]?.url || '/placeholder.jpg'}
              alt={item.product.name}
              width={60}
              height={60}
              style={{ borderRadius: '8px' }}
            />
            <Box sx={{ ml: 2, flexGrow: 1 }}>
              <Typography variant="body1">{item.product.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Quantity: {item.quantity}
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="bold">
              {formatPrice(item.price * item.quantity)}
            </Typography>
          </Box>
        ))}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Total:</Typography>
          <Typography variant="h6" color="primary">
            {formatPrice(cart.totalAmount)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const AddressStep = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Select Delivery Address</Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => {
            setEditingAddress(null);
            reset();
            setAddressDialogOpen(true);
          }}
        >
          Add New Address
        </Button>
      </Box>

      <Grid container spacing={2}>
        {addresses.map((address) => (
          <Grid item xs={12} md={6} key={address._id}>
            <Card
              sx={{
                cursor: 'pointer',
                border: selectedAddress === address._id ? '2px solid' : '1px solid',
                borderColor: selectedAddress === address._id ? 'primary.main' : 'divider',
              }}
              onClick={() => setSelectedAddress(address._id)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">{address.name}</Typography>
                      <Chip
                        label={address.type}
                        size="small"
                        sx={{ ml: 1 }}
                        icon={address.type === 'home' ? <Home /> : <Work />}
                      />
                      {address.isDefault && (
                        <Chip label="Default" size="small" color="primary" sx={{ ml: 1 }} />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {address.street}, {address.city}, {address.state} - {address.pincode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone: {address.phone}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton onClick={(e) => {
                      e.stopPropagation();
                      handleEditAddress(address);
                    }}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={(e) => {
                      e.stopPropagation();
                      deleteAddress(address._id);
                    }}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const PaymentStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Payment Method
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup
          value={selectedPayment}
          onChange={(e) => setSelectedPayment(e.target.value)}
        >
          {paymentMethods.map((method) => (
            <Card key={method.type} sx={{ mb: 2 }}>
              <CardContent>
                <FormControlLabel
                  value={method.type}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {method.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {method.description}
                      </Typography>
                    </Box>
                  }
                />
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </FormControl>

      {selectedPayment === 'card' && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Card Details (Demo)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  placeholder="MM/YY"
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  placeholder="123"
                  disabled
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {selectedPayment === 'upi' && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              UPI Payment (Demo)
            </Typography>
            <TextField
              fullWidth
              label="UPI ID"
              placeholder="yourname@upi"
              disabled
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const OrderConfirmationStep = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        Order Placed Successfully!
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Thank you for your order. You will receive a confirmation email shortly.
      </Typography>
      <Button
        variant="contained"
        onClick={() => router.push('/orders')}
        sx={{ mr: 2 }}
      >
        View Orders
      </Button>
      <Button
        variant="outlined"
        onClick={() => router.push('/shop')}
      >
        Continue Shopping
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Checkout
      </Typography>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Box sx={{ mb: 4 }}>
        {activeStep === 0 && <CartReviewStep />}
        {activeStep === 1 && <AddressStep />}
        {activeStep === 2 && <PaymentStep />}
        {activeStep === 3 && <OrderConfirmationStep />}
      </Box>

      {/* Navigation Buttons */}
      {activeStep < 3 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === 2 ? handlePlaceOrder : handleNext}
            disabled={loading}
          >
            {loading ? 'Processing...' : activeStep === 2 ? 'Place Order' : 'Next'}
          </Button>
        </Box>
      )}

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onClose={() => setAddressDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(saveAddress)} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Full Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="street"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Street Address"
                      multiline
                      rows={2}
                      error={!!errors.street}
                      helperText={errors.street?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="City"
                      error={!!errors.city}
                      helperText={errors.city?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="State"
                      error={!!errors.state}
                      helperText={errors.state?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="pincode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Pincode"
                      error={!!errors.pincode}
                      helperText={errors.pincode?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone Number"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <FormLabel>Address Type</FormLabel>
                      <RadioGroup {...field} row>
                        <FormControlLabel value="home" control={<Radio />} label="Home" />
                        <FormControlLabel value="work" control={<Radio />} label="Work" />
                        <FormControlLabel value="other" control={<Radio />} label="Other" />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddressDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(saveAddress)} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save Address'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CheckoutPage;
