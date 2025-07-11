'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Divider,
} from '@mui/material';
import {
  Delete,
  ShoppingCart,
  Remove,
  Add,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import { toast } from 'react-toastify';

const CartPage: React.FC = () => {
  const { user } = useAuth();
  const {
    cart,
    loading,
    fetchCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      router.push('/auth/login');
    }
  }, [user]);

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity).then(() =>
      toast.success('Quantity updated successfully')
    );
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId).then(() =>
      toast.success('Item removed from cart')
    );
  };

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Shopping Cart
      </Typography>

      {loading ? (
        <Alert severity="info">Loading your cart...</Alert>
      ) : cart && cart.items.length > 0 ? (
        <>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Image
                          src={item.product.images[0]?.url || '/placeholder.jpg'}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          objectFit="cover"
                        />
                        <Typography sx={{ ml: 2 }}>{item.product.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() =>
                          item.quantity > 1 &&
                          handleUpdateQuantity(item.product._id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Remove />
                      </IconButton>
                      {item.quantity}
                      <IconButton
                        onClick={() =>
                          handleUpdateQuantity(item.product._id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Add />
                      </IconButton>
                    </TableCell>
                    <TableCell align="right">
                      ₹{item.price.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleRemoveItem(item.product._id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6} lg={8}>
              <Button
                variant="outlined"
                startIcon={<Delete />}
                onClick={clearCart}
                sx={{ mb: 2 }}
              >
                Clear Cart
              </Button>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Typography variant="h6">Total: ₹{cart.totalAmount.toFixed(2)}</Typography>

              <Divider sx={{ my: 2 }} />

              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={<ShoppingCart />}
                onClick={() => router.push('/checkout')}
              >
                Proceed to Checkout
              </Button>
            </Grid>
          </Grid>
        </>
      ) : (
        <Alert severity="info">Your cart is empty.</Alert>
      )}
    </Container>
  );
};

export default CartPage;

