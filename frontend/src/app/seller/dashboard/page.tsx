'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Inventory,
  ShoppingCart,
  AttachMoney,
  Warning,
  Visibility,
  CheckCircle,
  Cancel,
  LocalShipping,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { toast } from 'react-toastify';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images: { url: string }[];
}

interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
}

const SellerDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  // const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      console.log(user);
      router.push('/auth/login');
      return;
    }
    else if (user.role==='seller') {
      fetchDashboardData();
      fetchOrders();
    }
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/seller/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/seller/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (orderId: string, action: 'accept' | 'ship' | 'cancel') => {
    try {
      let response;
      switch (action) {
        case 'accept':
          response = await api.put(`/seller/orders/${orderId}/accept`);
          break;
        case 'ship':
          response = await api.put(`/seller/orders/${orderId}/ship`, {
            trackingNumber
          });
          break;
        case 'cancel':
          response = await api.put(`/seller/orders/${orderId}/cancel`, {
            reason: cancelReason
          });
          break;
        default:
          return;
      }
      
      toast.success(response.data.message);
      fetchOrders();
      setOrderDialogOpen(false);
      setTrackingNumber('');
      setCancelReason('');
    } catch (error:instance of Error) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    }
  };

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user || user.role !== 'seller') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. This page is for sellers only.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Seller Dashboard
      </Typography>
      
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Welcome back, {user.name}!
      </Typography>

      {/* Dashboard Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData?.totalProducts || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Products
                  </Typography>
                </Box>
                <Inventory sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData?.totalOrders || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </Box>
                <ShoppingCart sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatPrice(dashboardData?.totalRevenue || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData?.lowStockProducts?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock Items
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => router.push('/seller/products/add')}
              startIcon={<Inventory />}
            >
              Add Product
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => router.push('/seller/products')}
            >
              Manage Products
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => router.push('/seller/orders')}
            >
              View All Orders
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Recent Orders */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Orders
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.slice(0, 5).map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{order.user.name}</TableCell>
                    <TableCell>{order.orderItems.length}</TableCell>
                    <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        color={getStatusColor(order.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          setSelectedOrder(order);
                          setOrderDialogOpen(true);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                      {order.status === 'pending' && (
                        <IconButton
                          onClick={() => handleOrderAction(order._id, 'accept')}
                          color="success"
                        >
                          <CheckCircle />
                        </IconButton>
                      )}
                      {order.status === 'confirmed' && (
                        <IconButton
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderDialogOpen(true);
                          }}
                          color="primary"
                        >
                          <LocalShipping />
                        </IconButton>
                      )}
                      {['pending', 'confirmed'].includes(order.status) && (
                        <IconButton
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderDialogOpen(true);
                          }}
                          color="error"
                        >
                          <Cancel />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Order Details - {selectedOrder?.orderNumber}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
              <Typography>Name: {selectedOrder.user.name}</Typography>
              <Typography>Email: {selectedOrder.user.email}</Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Order Items
              </Typography>
              {selectedOrder.orderItems.map((item, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography>{item.name} - Quantity: {item.quantity} - Price: {formatPrice(item.price)}</Typography>
                </Box>
              ))}
              
              <Typography variant="h6" sx={{ mt: 2 }}>
                Total: {formatPrice(selectedOrder.totalAmount)}
              </Typography>
              
              {selectedOrder.status === 'confirmed' && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Tracking Number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                </Box>
              )}
              
              {['pending', 'confirmed'].includes(selectedOrder.status) && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Cancellation Reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    multiline
                    rows={3}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialogOpen(false)}>Close</Button>
          {selectedOrder?.status === 'pending' && (
            <Button
              onClick={() => handleOrderAction(selectedOrder._id, 'accept')}
              color="success"
              variant="contained"
            >
              Accept Order
            </Button>
          )}
          {selectedOrder?.status === 'confirmed' && (
            <Button
              onClick={() => handleOrderAction(selectedOrder._id, 'ship')}
              color="primary"
              variant="contained"
              disabled={!trackingNumber}
            >
              Mark as Shipped
            </Button>
          )}
          {selectedOrder && ['pending', 'confirmed'].includes(selectedOrder.status) && (
            <Button
              onClick={() => handleOrderAction(selectedOrder._id, 'cancel')}
              color="error"
              variant="outlined"
            >
              Cancel Order
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SellerDashboard;
