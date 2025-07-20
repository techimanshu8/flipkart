'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Stack,
} from '@mui/material';
import {
  LocationOn,
  Person,
  Phone,
  AccessTime,
  ConfirmationNumber,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { toast } from 'react-toastify';

interface OrderDetails {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  deliveryAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  deliveryOTP?: string;
  createdAt: string;
}

interface PageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

const OrderDetailsPage: React.FC<PageProps> = ({ params }) => {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchOrderDetails();
  }, [user, params.id, router, fetchOrderDetails]);

  const fetchOrderDetails = React.useCallback(async () => {
    try {
      const response = await api.get(`/orders/${params.id}`);
      setOrder(response.data.order);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'out_for_delivery':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Order not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Order Details
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Order #{order.orderNumber}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Order Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Order Status
                </Typography>
                <Chip
                  label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  color={getStatusColor(order.status)}
                  size="medium"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime fontSize="small" />
                  Ordered on {formatDate(order.createdAt)}
                </Typography>
              </Box>
            </Stack>

            {/* Delivery OTP Section */}
            {order.deliveryOTP && order.status === 'out_for_delivery' && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="h6" color="primary.contrastText" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ConfirmationNumber />
                  Delivery OTP
                </Typography>
                <Typography variant="h4" color="primary.contrastText" sx={{ letterSpacing: 2 }}>
                  {order.deliveryOTP}
                </Typography>
                <Typography variant="caption" color="primary.contrastText">
                  Share this OTP with delivery agent upon receiving the order
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Delivery Address */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn />
              Delivery Address
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person fontSize="small" />
                {order.deliveryAddress.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {order.deliveryAddress.street},
                <br />
                {order.deliveryAddress.city}, {order.deliveryAddress.state}
                <br />
                {order.deliveryAddress.pincode}
              </Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Phone fontSize="small" />
                {order.deliveryAddress.phone}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Stack spacing={2}>
              {order.orderItems.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1">
                      {item.name} × {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {formatPrice(item.price * item.quantity)}
                  </Typography>
                </Box>
              ))}
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">
                  {formatPrice(order.totalAmount)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetailsPage;
