'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import {
  ShoppingBag,
  LocalShipping,
  CheckCircle,
  Cancel,
  Visibility,
  Receipt,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: Array<{ url: string; alt?: string }>;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  deliveryAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Cancel order
  const cancelOrder = async (orderId: string) => {
    try {
      await api.put(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
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
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ShoppingBag />;
      case 'confirmed':
        return <Receipt />;
      case 'shipped':
        return <LocalShipping />;
      case 'delivered':
        return <CheckCircle />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <ShoppingBag />;
    }
  };

  // Get order steps
  const getOrderSteps = (status: string) => {
    const steps = ['Order Placed', 'Confirmed', 'Shipped', 'Delivered'];
    let activeStep = 0;
    
    switch (status) {
      case 'pending':
        activeStep = 0;
        break;
      case 'confirmed':
        activeStep = 1;
        break;
      case 'shipped':
        activeStep = 2;
        break;
      case 'delivered':
        activeStep = 3;
        break;
      case 'cancelled':
        return { steps: ['Order Placed', 'Cancelled'], activeStep: 1 };
      default:
        activeStep = 0;
    }
    
    return { steps, activeStep };
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  // Handle view order details
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchOrders();
  }, [user]);

  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        My Orders
      </Typography>

      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="30%" height={32} />
                  <Skeleton variant="text" width="20%" height={24} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={100} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : orders.length === 0 ? (
        <Alert severity="info">
          No orders found. <Button onClick={() => router.push('/shop')}>Start Shopping</Button>
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Order #{order.orderNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Placed on {formatDate(order.createdAt)}
                      </Typography>
                      <Chip
                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        color={getStatusColor(order.status) as any}
                        icon={getStatusIcon(order.status)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="h6" color="primary">
                        {formatPrice(order.totalAmount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewOrderDetails(order)}
                        >
                          View Details
                        </Button>
                        {order.status === 'pending' && (
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => cancelOrder(order._id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {order.items.slice(0, 3).map((item) => (
                      <Box key={item._id} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Image
                          src={item.product.images[0]?.url || '/placeholder.jpg'}
                          alt={item.product.name}
                          width={50}
                          height={50}
                          style={{ borderRadius: '4px' }}
                        />
                        <Box sx={{ ml: 1 }}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                            {item.product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Qty: {item.quantity}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    {order.items.length > 3 && (
                      <Typography variant="body2" color="text.secondary">
                        +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Order Details Dialog */}
      <Dialog
        open={orderDetailsOpen}
        onClose={() => setOrderDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order Details - #{selectedOrder?.orderNumber}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              {/* Order Status */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Order Status
                </Typography>
                <Stepper activeStep={getOrderSteps(selectedOrder.status).activeStep}>
                  {getOrderSteps(selectedOrder.status).steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Order Items */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Items Ordered
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Image
                                src={item.product.images[0]?.url || '/placeholder.jpg'}
                                alt={item.product.name}
                                width={50}
                                height={50}
                                style={{ borderRadius: '4px' }}
                              />
                              <Typography sx={{ ml: 2 }}>{item.product.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">{formatPrice(item.price)}</TableCell>
                          <TableCell align="right">
                            {formatPrice(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Delivery Address */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Delivery Address
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedOrder.deliveryAddress.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedOrder.deliveryAddress.street}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone: {selectedOrder.deliveryAddress.phone}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Payment Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Payment Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Method:
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.paymentMethod.toUpperCase()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Status:
                    </Typography>
                    <Chip
                      label={selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                      color={selectedOrder.paymentStatus === 'completed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Order Summary */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Subtotal:</Typography>
                  <Typography variant="body1">{formatPrice(selectedOrder.totalAmount)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Shipping:</Typography>
                  <Typography variant="body1">Free</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary">
                    {formatPrice(selectedOrder.totalAmount)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrdersPage;
