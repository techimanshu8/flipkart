'use client';

//page for delivery agents to manage their orders and view statistics
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  IconButton,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  LocationOn,
  DirectionsBike,
  Star,
  LocalShipping,
  CheckCircle,
  Cancel,
  Phone,
  Navigation,
  ConfirmationNumber,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface Order {
  _id: string;
  orderNumber: string;
  deliveryAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  status: string;
  totalAmount: number;
  deliveryOTP?: string;
}

const DeliveryDashboard: React.FC = () => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [stats, setStats] = useState({
    completedOrders: 0,
    rating: 0,
    earnings: 0,
  });

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'delivery') {
      router.push('/auth/login');
      return;
    }
    else if (user) {
      fetchActiveOrders();
      fetchStats();
    }
    
  }, [user]);

  const fetchActiveOrders = async () => {
    try {

      const response = await api.get('/delivery/orders/available');
      setActiveOrders(response.data.orders);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/delivery/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    }
  };

  const handleAvailabilityToggle = async () => {
    try {
      await api.post('/delivery/toggle-availability', {
        isAvailable: !isAvailable
      });
      setIsAvailable(!isAvailable);
      toast.success(`You are now ${!isAvailable ? 'available' : 'unavailable'} for deliveries`);
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleAcceptDeivery = async () => {
    if (!selectedOrder) return;
    try {
      await api.post(`/delivery/orders/${selectedOrder._id}/generateotp`);
      setSelectedOrder(null);
      fetchActiveOrders();
      toast.success('Delivery accepted successfully. OTP has been generated.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept delivery');
    }
    setOtpDialogOpen(true); 
    setOtp(''); // Reset OTP field when accepting a new delivery

  };

  const handleDeliveryComplete = async () => {
    try {
      if (!selectedOrder) return;

      await api.post(`/delivery/orders/${selectedOrder._id}/complete`, {
        otp
      });

      toast.success('Delivery completed successfully');
      setOtpDialogOpen(false);
      setOtp('');
      fetchActiveOrders();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Delivery Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Welcome back, {user?.name}!
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalShipping sx={{ mr: 1 }} />
                <Typography variant="h6">Completed Deliveries</Typography>
              </Box>
              <Typography variant="h4">{stats.completedOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star sx={{ mr: 1 }} />
                <Typography variant="h6">Rating</Typography>
              </Box>
              <Typography variant="h4">{stats.rating.toFixed(1)} ⭐</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Today's Earnings</Typography>
              </Box>
              <Typography variant="h4">{formatPrice(stats.earnings)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Availability Toggle */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isAvailable}
              onChange={handleAvailabilityToggle}
              color="success"
            />
          }
          label={
            <Typography color={isAvailable ? 'success.main' : 'text.secondary'}>
              {isAvailable ? 'Available for Deliveries' : 'Currently Unavailable'}
            </Typography>
          }
        />
      </Paper>

      {/* Active Orders */}
      <Typography variant="h5" gutterBottom>
        Active Orders
      </Typography>
      
      {loading ? (
        <CircularProgress />
      ) : activeOrders.length === 0 ? (
        <Alert severity="info">No active orders at the moment.</Alert>
      ) : (
        <List>
          {activeOrders.map((order) => (
            <Paper key={order._id} sx={{ mb: 2 }}>
              <ListItem
                secondaryAction={
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                      setSelectedOrder(order);
                      handleAcceptDeivery();
                      setOtpDialogOpen(true);
                      
                    }}
                    startIcon={<ConfirmationNumber />}
                  >
                    Complete Delivery
                  </Button>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Order #{order.orderNumber}
                      </Typography>
                      <Chip
                        size="small"
                        label={formatPrice(order.totalAmount)}
                        color="primary"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                        {order.deliveryAddress.street}, {order.deliveryAddress.city}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <Phone sx={{ fontSize: 16, mr: 0.5 }} />
                        {order.deliveryAddress.phone}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}

      {/* OTP Verification Dialog */}
      <Dialog open={otpDialogOpen} onClose={() => setOtpDialogOpen(false)}>
        <DialogTitle>Enter Delivery OTP</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="6-Digit OTP"
            type="number"
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputProps={{ maxLength: 6 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOtpDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleDeliveryComplete}
            disabled={otp.length !== 6}
          >
            Verify & Complete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DeliveryDashboard;
