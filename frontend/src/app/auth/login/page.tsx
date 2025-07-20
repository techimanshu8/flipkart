'use client';

import React, { useState, useEffect  } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Grid,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  Twitter,
  ShoppingBag,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import NextLink from 'next/link';

const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

interface LoginFormData {
  email: string;
  password: string;
}


const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError('');
      await login(data.email, data.password);
      toast.success('Login successful!');
      router.push('/shop');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const { user } = useAuth();
    useEffect(() => {
    if (!user) return;

    const redirects: Record<string, string> = {
      'seller': '/seller/dashboard',
      'delivery': '/delivery/dashboard',
      'default': '/shop'
    };

    const redirectPath = user.role ? redirects[user.role] || redirects.default : redirects.default;
    router.push(redirectPath);
  }, [user, router]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={0} sx={{ minHeight: '80vh' }}>
          {/* Left Side - Branding */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
              p: 4,
              borderRadius: { xs: '16px 16px 0 0', md: '16px 0 0 16px' },
            }}
          >
            <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
              <ShoppingBag sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                Welcome Back!
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Sign in to your account and start shopping
              </Typography>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  ✓ Access to exclusive deals
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  ✓ Track your orders
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  ✓ Manage your wishlist
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                  ✓ Fast and secure checkout
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                p: 4,
                borderRadius: { xs: '0 0 16px 16px', md: '0 16px 16px 0' },
              }}
            >
              <Box sx={{ maxWidth: 400, mx: 'auto', width: '100%' }}>
                <Typography
                  variant="h4"
                  component="h2"
                  gutterBottom
                  fontWeight="bold"
                  color="primary"
                  sx={{ mb: 3 }}
                >
                  Sign In
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email Address"
                        type="email"
                        variant="outlined"
                        margin="normal"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        sx={{ mb: 2 }}
                      />
                    )}
                  />

                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        margin="normal"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        sx={{ mb: 3 }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Link component={NextLink} href="/auth/forgot-password" underline="hover">
                      Forgot password?
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      mb: 3,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      borderRadius: 2,
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Sign In'}
                  </Button>

                  <Divider sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      OR
                    </Typography>
                  </Divider>

                  {/* Social Login Buttons */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Google />}
                        sx={{ py: 1.5 }}
                      >
                        Google
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Facebook />}
                        sx={{ py: 1.5 }}
                      >
                        Facebook
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Twitter />}
                        sx={{ py: 1.5 }}
                      >
                        Twitter
                      </Button>
                    </Grid>
                  </Grid>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2">
                      Don&apos;t have an account?{' '}
                      <Link
                        component={NextLink}
                        href="/auth/register"
                        fontWeight="bold"
                        underline="hover"
                      >
                        Sign up here
                      </Link>
                    </Typography>
                  </Box>
                </form>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LoginPage;
