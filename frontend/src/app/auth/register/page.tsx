'use client';

import React, { useState } from 'react';
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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  Twitter,
  PersonAdd,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import NextLink from 'next/link';

const schema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number')
    .optional(),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions'),
});

interface RegisterFormData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { register: registerUser } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setError('');
      await registerUser(data.name, data.email, data.password, data.phone);
      toast.success('Registration successful! Welcome to Flipkart!');
      router.push('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
        <Grid container spacing={0} sx={{ minHeight: '90vh' }}>
          {/* Left Side - Registration Form */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                p: 4,
                borderRadius: { xs: '16px 16px 0 0', md: '16px 0 0 16px' },
              }}
            >
              <Box sx={{ maxWidth: 500, mx: 'auto', width: '100%' }}>
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  fontWeight="bold"
                  color="primary"
                  sx={{ mb: 3 }}
                >
                  Create Account
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Full Name"
                            variant="outlined"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
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
                            error={!!errors.email}
                            helperText={errors.email?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Phone Number (Optional)"
                            variant="outlined"
                            error={!!errors.phone}
                            helperText={errors.phone?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
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
                            error={!!errors.password}
                            helperText={errors.password?.message}
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
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            variant="outlined"
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle confirm password visibility"
                                    onClick={handleClickShowConfirmPassword}
                                    edge="end"
                                  >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="acceptTerms"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                color="primary"
                              />
                            }
                            label={
                              <Typography variant="body2">
                                I agree to the{' '}
                                <Link component={NextLink} href="/terms" underline="hover">
                                  Terms and Conditions
                                </Link>{' '}
                                and{' '}
                                <Link component={NextLink} href="/privacy" underline="hover">
                                  Privacy Policy
                                </Link>
                              </Typography>
                            }
                            sx={{ 
                              alignItems: 'flex-start',
                              '& .MuiFormControlLabel-label': {
                                color: errors.acceptTerms ? 'error.main' : 'text.primary',
                              },
                            }}
                          />
                        )}
                      />
                      {errors.acceptTerms && (
                        <Typography variant="caption" color="error" sx={{ ml: 4 }}>
                          {errors.acceptTerms.message}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      mt: 3,
                      mb: 3,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      borderRadius: 2,
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Create Account'}
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
                      Already have an account?{' '}
                      <Link
                        component={NextLink}
                        href="/auth/login"
                        fontWeight="bold"
                        underline="hover"
                      >
                        Sign in here
                      </Link>
                    </Typography>
                  </Box>
                </form>
              </Box>
            </Paper>
          </Grid>

          {/* Right Side - Branding */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
              color: 'white',
              p: 4,
              borderRadius: { xs: '0 0 16px 16px', md: '0 16px 16px 0' },
            }}
          >
            <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
              <PersonAdd sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
                Join Us Today!
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Create your account and unlock amazing benefits
              </Typography>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  🎁 Welcome bonus on first purchase
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  🚚 Free shipping on orders over ₹499
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  ⭐ Exclusive member discounts
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  📱 Easy returns and exchanges
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                  🔒 Secure and encrypted payments
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default RegisterPage;
