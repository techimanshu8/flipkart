'use client';

import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: Array<{ url: string; alt?: string }>;
  rating: number;
  numReviews: number;
  discount?: number;
  brand: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, 1);
      toast.success('Product added to cart!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleWishlistToggle = () => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast.success(
      isWishlisted ? 'Removed from wishlist' : 'Added to wishlist'
    );
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <Chip
          label={`${discountPercentage}% OFF`}
          color="secondary"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1,
            fontWeight: 'bold',
          }}
        />
      )}

      {/* Wishlist Button */}
      <IconButton
        onClick={handleWishlistToggle}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 1)',
          },
        }}
      >
        {isWishlisted ? (
          <Favorite color="secondary" />
        ) : (
          <FavoriteBorder />
        )}
      </IconButton>

      {/* Product Image */}
      <Link href={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.images[0]?.url || '/placeholder-image.jpg'}
          alt={product.images[0]?.alt || product.name}
          sx={{
            objectFit: 'contain',
            p: 2,
            cursor: 'pointer',
          }}
        />
      </Link>

      <CardContent sx={{ flexGrow: 1, pt: 1 }}>
        {/* Brand */}
        <Typography variant="caption" color="text.secondary" gutterBottom>
          {product.brand}
        </Typography>

        {/* Product Name */}
        <Link href={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontSize: '1rem',
              fontWeight: 500,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: 'text.primary',
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            {product.name}
          </Typography>
        </Link>

        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={product.rating} readOnly size="small" precision={0.1} />
          <Typography variant="caption" sx={{ ml: 1 }}>
            ({product.numReviews})
          </Typography>
        </Box>

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            ₹{product.price.toLocaleString()}
          </Typography>
          {product.originalPrice && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'line-through' }}
            >
              ₹{product.originalPrice.toLocaleString()}
            </Typography>
          )}
        </Box>

        {/* Stock Status */}
        {product.stock === 0 && (
          <Chip
            label="Out of Stock"
            color="error"
            size="small"
            variant="outlined"
          />
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ShoppingCart />}
          fullWidth
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          sx={{ textTransform: 'none' }}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
