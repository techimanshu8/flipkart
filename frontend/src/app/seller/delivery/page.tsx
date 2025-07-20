'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  // LocationOn,
  // Motorcycle,
  Star,
  // Check,
  // Close,
  // Phone,
  // Send,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface DeliveryAgent {
  _id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  isAvailable: boolean;
  rating: number;
  completedOrders: number;
  currentLocation?: {
    coordinates: [number, number];
  };
}

interface Order {
  _id: string;
  orderNumber: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  status: string;
  deliveryAgent?: string;
  deliveryOTP?: string;
}

const DeliveryManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState('');

  const { user } = useAuth();
  // const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      // router.push('/auth/login');
      toast.error('You must be logged in as a seller to access this page');
      return;
    }
    fetchOrders();
    fetchDeliveryAgents();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/seller/orders');
      setOrders(response.data.orders.filter((o: Order) => o.status === 'shipped'));
    } catch () {
      toast.error('Failed to fetch orders');
    }
  };

  const fetchDeliveryAgents = async () => {
    try {
      const response = await api.get('/delivery/agents');
      setDeliveryAgents(response.data.deliveryAgents);
    } catch () {
      toast.error('Failed to fetch delivery agents');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDelivery = async () => {
    try {
      if (!selectedOrder || !selectedAgent) return;

      await api.post(`/seller/orders/${selectedOrder._id}/assign-delivery`, {
        deliveryAgentId: selectedAgent
      });

      toast.success('Delivery agent assigned successfully');
      setAssignDialogOpen(false);
      setSelectedOrder(null);
      setSelectedAgent('');
      //setOtpDialogOpen(true);
      // Refresh orders after assignment  

      fetchOrders();
    } catch (error: instanceof Error) {
      console.error('Error assigning delivery agent:', error , selectedOrder._id);
      toast.error('Failed to assign delivery agent');
    }
  };

  const handleGenerateOTP = async (orderId: string) => {
    try {
      const response = await api.post(`/seller/orders/${orderId}/generate-otp`);
      setOtp(response.data.otp);
      setOtpDialogOpen(true);
    } catch () {
      toast.error('Failed to generate OTP');
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'bike':
        return '🏍️';
      case 'scooter':
        return '🛵';
      case 'cycle':
        return '🚲';
      default:
        return '🚗';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Delivery Management
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Delivery Address</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Delivery Agent</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.deliveryAddress.street},
                      {order.deliveryAddress.city},
                      {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {order.deliveryAgent ? (
                      <Chip
                        label={deliveryAgents.find(a => a._id === order.deliveryAgent)?.name || 'Assigned'}
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip label="Unassigned" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {!order.deliveryAgent ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          setSelectedOrder(order);
                          setAssignDialogOpen(true);
                        }}
                      >
                        Assign Delivery
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleGenerateOTP(order._id)}
                      >
                        Generate OTP
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Assign Delivery Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Delivery Agent</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Delivery Agent</InputLabel>
              <Select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                label="Select Delivery Agent"
              >
                {deliveryAgents
                  .filter(agent => agent.isAvailable)
                  .map(agent => (
                    <MenuItem key={agent._id} value={agent._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{agent.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({getVehicleIcon(agent.vehicleType)} {agent.vehicleNumber})
                        </Typography>
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                          <Typography variant="caption">{agent.rating?.toFixed(1)}</Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAssignDelivery}
            disabled={!selectedAgent}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* OTP Dialog */}
      <Dialog
        open={otpDialogOpen}
        onClose={() => setOtpDialogOpen(false)}
      >
        <DialogTitle>Delivery OTP</DialogTitle>
        <DialogContent>
          <Typography variant="h4" sx={{ textAlign: 'center', letterSpacing: 8, my: 2 }}>
            {otp}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            This OTP has been sent to the customer &#39 s phone number.
            The delivery agent will need to collect and verify this OTP upon delivery.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOtpDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DeliveryManagementPage;
