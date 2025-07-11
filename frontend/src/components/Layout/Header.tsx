'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Box,
  Container,
  Avatar,
} from '@mui/material';
import {
  Search,
  ShoppingCart,
  AccountCircle,
  Menu as MenuIcon,
  Favorite,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const cartItemsCount = cart?.totalItems || 0;

  return (
    <AppBar position="sticky" color="primary">
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              Flipkart
            </Typography>
          </Link>

          {/* Search Bar */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              flexGrow: 1,
              mx: 4,
              maxWidth: 600,
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search for products, brands and more"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{
                backgroundColor: 'white',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    border: 'none',
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" edge="end">
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Navigation Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user ? (
              <>
                {/* Shop */}
                <Button color="inherit" component={Link} href="/shop" sx={{ textTransform: 'none' }}>
                  Shop
                </Button>

                {/* Wishlist */}
                <IconButton color="inherit" component={Link} href="/wishlist">
                  <Favorite />
                </IconButton>

                {/* Cart */}
                <IconButton color="inherit" component={Link} href="/cart">
                  <Badge badgeContent={cartItemsCount} color="secondary">
                    <ShoppingCart />
                  </Badge>
                </IconButton>

                {/* User Menu */}
                <IconButton
                  color="inherit"
                  onClick={handleMenuOpen}
                  sx={{ ml: 1 }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={() => { router.push('/profile'); handleMenuClose(); }}>
                    My Profile
                  </MenuItem>
                  <MenuItem onClick={() => { router.push('/orders'); handleMenuClose(); }}>
                    My Orders
                  </MenuItem>
                  <MenuItem onClick={() => { router.push('/wishlist'); handleMenuClose(); }}>
                    Wishlist
                  </MenuItem>
                  {user.role === 'admin' && (
                    <MenuItem onClick={() => { router.push('/admin'); handleMenuClose(); }}>
                      Admin Panel
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  href="/auth/login"
                  sx={{ textTransform: 'none' }}
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  href="/auth/register"
                  sx={{ textTransform: 'none' }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
