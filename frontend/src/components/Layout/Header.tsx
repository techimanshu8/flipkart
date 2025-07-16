'use client';

import React, { useState , useEffect} from 'react';
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
const Header1: React.FC = () => {
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

// export default Header;

// App.jsx


const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulated auth state
  //const cartItemsCount = 3; // Simulated cart items
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const cartItemsCount = cart?.totalItems || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };
   useEffect(() => {
    if(user){
      setIsLoggedIn(true);
    }}, [user]);

    const handleLogout = () => {
      setIsLoggedIn(false);
    logout();
    // handleMenuClose();
    router.push('/');
  };

  return (
    <div className="bg-white text-gray-900">
      {/* Navbar */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-2 flex justify-between items-center">
          {/* Logo */}
          <div>
            <Link href="/" className="text-xl font-bold text-indigo-600">
              Flipkart
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-grow max-w-xs">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>

            <div className="flex items-center space-x-4">
              {/* Wishlist Icon */}
              <Link href="/wishlist" className="text-gray-700 hover:text-indigo-600">
                <span className="sr-only">Wishlist</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </Link>

              {/* Cart Icon with Badge */}
              <Link href="/cart" className="relative text-gray-700 hover:text-indigo-600">
                <span className="sr-only">Cart</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* Auth Buttons or Profile Dropdown */}
              {user? (
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-indigo-600 focus:outline-none">
                    <img
                      src="https://placehold.co/40x40 "
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  </button>
                  <div className="absolute right-0 w-48 bg-white shadow-lg rounded-md hidden group-hover:block z-10">
                    <ul className="py-1">
                      <li>
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          My Orders
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/wishlist"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Wishlist
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-600 hover:text-white transition duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-md py-4 px-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <Link href="/shop" className="block py-2 text-gray-700 hover:text-indigo-600">
                Shop
              </Link>
              <Link href="/wishlist" className="block py-2 text-gray-700 hover:text-indigo-600">
                Wishlist
              </Link>
              <Link href="/cart" className="block py-2 text-gray-700 hover:text-indigo-600 relative">
                Cart
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              {isLoggedIn ? (
                <div className="mt-4">
                  <p className="font-medium mb-2">Hi, User</p>
                  <Link
                    href="/profile"
                    className="block py-1 text-gray-700 hover:text-indigo-600"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="block py-1 text-gray-700 hover:text-indigo-600"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block py-1 text-gray-700 hover:text-indigo-600"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block py-2 text-indigo-600 hover:underline"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block py-2 text-indigo-600 hover:underline"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Header;