'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Badge,
  Rating,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  Skeleton,
  ButtonGroup,
} from '@mui/material';
import {
  ShoppingCart,
  FavoriteBorder,
  Share,
  Add,
  Remove,
  ArrowBack,
  LocalShipping,
  Security,
  Verified,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import api from '@/services/api';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: Array<{ url: string; alt?: string }>;
  category: {
    _id: string;
    name: string;
  };
  rating: number;
  reviewCount: number;
  stock: number;
  brand: string;
  specifications: Array<{ key: string; value: string }>;
  discount?: number;
  features: string[];
  warranty: string;
  returnPolicy: string;
  seller: {
    name: string;
    rating: number;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProductDetailPage: React.FC = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);

  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart, cart } = useCart();
  const router = useRouter();

  // Fetch product details
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      router.push('/auth/login');
      return;
    }

    if (!product) return;

    try {
      await addToCart(product._id, quantity);
      toast.success(`${quantity} item(s) added to cart!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add product to cart');
    }
  };

  // Get item count in cart
  const getCartItemCount = () => {
    if (!cart || !product) return 0;
    const item = cart.items.find(item => item.product._id === product._id);
    return item ? item.quantity : 0;
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="rectangular" height={100} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Product not found</Alert>
        <Button onClick={() => router.back()} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.back()}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* Main Image */}
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 400,
                  overflow: 'hidden',
                  borderRadius: 2,
                }}
              >
                <Image
                  src={product.images[selectedImage]?.url || '/placeholder.jpg'}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            </Paper>

            {/* Image Thumbnails */}
            <Grid container spacing={1}>
              {product.images.map((image, index) => (
                <Grid item xs={3} key={index}>
                  <Paper
                    elevation={selectedImage === index ? 4 : 1}
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      border: selectedImage === index ? '2px solid primary.main' : 'none',
                    }}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: 80,
                        overflow: 'hidden',
                        borderRadius: 1,
                      }}
                    >
                      <Image
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* Product Name */}
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {product.name}
            </Typography>

            {/* Brand and Category */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip label={product.brand} variant="outlined" />
              <Chip label={product.category.name} variant="outlined" />
            </Box>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.rating} precision={0.1} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </Typography>
            </Box>

            {/* Price */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {formatPrice(product.price)}
              </Typography>
              {product.originalPrice && (
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ ml: 2, textDecoration: 'line-through' }}
                >
                  {formatPrice(product.originalPrice)}
                </Typography>
              )}
              {product.discount && (
                <Chip
                  label={`${product.discount}% OFF`}
                  color="success"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>

            {/* Stock Status */}
            <Box sx={{ mb: 3 }}>
              {product.stock > 0 ? (
                <Chip
                  label={`${product.stock} in stock`}
                  color="success"
                  icon={<Verified />}
                />
              ) : (
                <Chip label="Out of Stock" color="error" />
              )}
            </Box>

            {/* Description */}
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>

            {/* Quantity Selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ mr: 2 }}>
                Quantity:
              </Typography>
              <ButtonGroup>
                <Button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Remove />
                </Button>
                <Button disabled>{quantity}</Button>
                <Button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  <Add />
                </Button>
              </ButtonGroup>
              {getCartItemCount() > 0 && (
                <Badge
                  badgeContent={getCartItemCount()}
                  color="primary"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                sx={{ flex: 1 }}
              >
                Add to Cart
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<FavoriteBorder />}
              >
                Wishlist
              </Button>
              <IconButton color="primary">
                <Share />
              </IconButton>
            </Box>

            {/* Delivery Info */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocalShipping color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Delivery Information</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Free delivery on orders over ₹500
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estimated delivery: 2-5 business days
                </Typography>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Security color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Security & Returns</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Secure payments • 30-day return policy
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.warranty} warranty included
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Product Details Tabs */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="product details tabs">
          <Tab label="Description" />
          <Tab label="Specifications" />
          <Tab label="Features" />
          <Tab label="Reviews" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Return Policy
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.returnPolicy}
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <List>
            {product.specifications.map((spec, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={spec.key}
                  secondary={spec.value}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <List>
            {product.features?.map((feature, index) => (
              <ListItem key={index}>
                <ListItemText primary={`• ${feature}`} />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Customer Reviews
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={product.rating} precision={0.1} readOnly />
            <Typography variant="body1" sx={{ ml: 1 }}>
              {product.rating.toFixed(1)} out of 5 ({product.reviewCount} reviews)
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Reviews feature coming soon...
          </Typography>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default ProductDetailPage;
