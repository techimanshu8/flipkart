'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import {
  ShoppingCart,
  LocalShipping,
  Security,
  Support,
} from '@mui/icons-material';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            fontWeight="bold"
            sx={{ mb: 2 }}
          >
            Welcome to Flipkart Clone
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Discover amazing products at unbeatable prices
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={Link}
              href="/shop"
              sx={{ px: 4, py: 1.5 }}
            >
              Shop Now
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              component={Link}
              href="/auth/register"
              sx={{ px: 4, py: 1.5 }}
            >
              Sign Up Today
            </Button>
            <Button
              variant="contained"
              color="warning"
              size="large"
              component={Link}
              href="/auth/register-seller"
              sx={{ px: 4, py: 1.5 }}
            >
              Become a Seller
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          fontWeight="bold"
          color="primary"
        >
          Why Choose Us?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <ShoppingCart color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Wide Selection
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse thousands of products across multiple categories
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <LocalShipping color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Fast Delivery
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quick and reliable delivery to your doorstep
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Security color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Secure Payments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Safe and encrypted payment processing
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Support color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  24/7 Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Round-the-clock customer service support
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action Section */}
      <Box
        sx={{
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
            Start Shopping Today!
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of satisfied customers and experience the best online shopping
          </Typography>
          <Button
            variant="contained"
            color="inherit"
            size="large"
            component={Link}
            href="/auth/register"
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: 'primary.main',
            }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
