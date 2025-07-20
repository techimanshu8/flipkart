'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  // Divider,
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
  Modal,
  Fade,
  Backdrop,
} from '@mui/material';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
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
  // ZoomIn,
  ChevronLeft,
  ChevronRight,
  Close,
  PlayCircle,
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
  images: Array<{ url: string; alt?: string; type?: 'image' | 'video' }>;
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
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  // const [isSwiping, setIsSwiping] = useState(false);
  const touchStart = useRef<number>(0);
  const touchEnd = useRef<number>(0);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isSwiping && product) {
      const swipeThreshold = 50;
      const diff = touchStart.current - touchEnd.current;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && selectedImage < product.images.length - 1) {
          setSelectedImage(prev => prev + 1);
        } else if (diff < 0 && selectedImage > 0) {
          setSelectedImage(prev => prev - 1);
        }
      }
    }
  };

  // Navigation handlers
  const handlePrevImage = () => {
    if (selectedImage > 0) {
      setSelectedImage(prev => prev - 1);
    }
  };

  const handleNextImage = () => {
    if (product && selectedImage < product.images.length - 1) {
      setSelectedImage(prev => prev + 1);
    }
  };

  // Handle video playback
  const handleVideoClick = (index: number) => {
    setSelectedImage(index);
  };

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
    } catch (error: unknown) {
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

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Product Images - Left Column */}
        <Box sx={{ flex: '1 1 50%', maxWidth: { md: '50%' } }}>
          <Box>
            {/* Main Image/Video Gallery */}
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                mb: 2,
                position: 'relative',
                '&:hover .navigation-arrows': {
                  opacity: 1,
                }
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 400,
                  overflow: 'hidden',
                  borderRadius: 2,
                  cursor: 'zoom-in',
                }}
                onClick={() => setIsZoomOpen(true)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {product.images[selectedImage]?.type === 'video' ? (
                  <video
                    src={product.images[selectedImage].url}
                    controls
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Image
                    src={product.images[selectedImage]?.url || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'contain' }}
                    quality={100}
                  />
                )}

                {/* Navigation Arrows */}
                <Box className="navigation-arrows" sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                  px: 2,
                  pointerEvents: 'none',
                }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.8)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                      pointerEvents: 'auto',
                      visibility: selectedImage === 0 ? 'hidden' : 'visible',
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.8)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                      pointerEvents: 'auto',
                      visibility: selectedImage === product.images.length - 1 ? 'hidden' : 'visible',
                    }}
                  >
                    <ChevronRight />
                  </IconButton>
                </Box>
              </Box>
            </Paper>

            {/* Image/Video Thumbnails */}
            <Grid container spacing={1}>
              {product.images.map((image, index) => (
                <Grid item xs={3} key={index}>
                  <Paper
                    elevation={selectedImage === index ? 4 : 1}
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      border: selectedImage === index ? '2px solid primary.main' : 'none',
                      position: 'relative',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      }
                    }}
                    onClick={() => image.type === 'video' ? handleVideoClick(index) : setSelectedImage(index)}
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
                      {image.type === 'video' ? (
                        <Box>
                          <Image
                            src={image.url + '?thumb=1'}
                            alt={`${product.name} video`}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                          <PlayCircle
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              color: 'white',
                              fontSize: '2rem',
                            }}
                          />
                        </Box>
                       ) : (
                        <Image
                          src={image.url}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Zoom Modal */}
            <Modal
              open={isZoomOpen}
              onClose={() => setIsZoomOpen(false)}
              closeAfterTransition
              BackdropComponent={Backdrop}
              BackdropProps={{
                timeout: 500,
              }}
            >
              <Fade in={isZoomOpen}>
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '90vw',
                  height: '90vh',
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 2,
                  outline: 'none',
                  }}>
                  <IconButton
                    onClick={() => setIsZoomOpen(false)}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      zIndex: 1,
                    }}
                  >
                    <Close />
                  </IconButton>
                  
                  <TransformWrapper
                    initialScale={1}
                    initialPositionX={0}
                    initialPositionY={0}
                  >
                    <TransformComponent>
                      <Image
                        src={product.images[selectedImage]?.url || '/placeholder.jpg'}
                        alt={product.name}
                        width={1500}
                        height={1500}
                        style={{ objectFit: 'contain' }}
                      />
                    </TransformComponent>
                  </TransformWrapper>
                </Box>
              </Fade>
            </Modal>
          </Box>
        </Box>
      </Box>
        {/* Product Info - Right Column */}
        <Box 
          sx={{ 
            flex: '1 1 50%', 
            maxWidth: { md: '50%' },
            position: { md: 'sticky' },
            top: { md: '20px' },
            alignSelf: { md: 'flex-start' },
            maxHeight: { md: 'calc(100vh - 40px)' },
            overflowY: { md: 'auto' }
          }}
        >
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
                  primary={spec.name}
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
