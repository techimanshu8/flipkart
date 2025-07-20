'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  TextField,
  InputAdornment,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Pagination,
  Skeleton,
  Alert,
  Badge,
  IconButton,
  Drawer,
  Slider,
  Divider,
  useMediaQuery,
  Theme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Fab,
  CircularProgress,
  Avatar,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Search,
  ShoppingCart,
  FavoriteBorder,
  Favorite,
  FilterList,
  Sort,
  Close,
  ArrowBack,
  ArrowForward,
  Star,
  LocalOffer,
  Inventory,
  Category,
  BrandingWatermark,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import api from '@/services/api';
import { toast } from 'react-toastify';
import debounce from 'lodash.debounce';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: Array<{ url: string; alt?: string }>;
  category: string;
  categoryName?: string;
  rating: number;
  reviewCount: number;
  stock: number;
  brand: string;
  specifications: Array<{ key: string; value: string }>;
  discount?: number;
  highlights?: string[];
}

interface Category {
  _id: string;
  name: string;
  description: string;
}

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [paginationType, setPaginationType] = useState<'pagination' | 'loadMore'>('loadMore');

  const { user } = useAuth();
  const { addToCart, cart } = useCart();
  const router = useRouter();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  // Enhanced product fetching with category names
  const fetchProducts = useCallback(
    debounce(async (page = 1, loadMore = false) => {
      try {
        if (loadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '12',
          ...(searchQuery && { search: searchQuery }),
          ...(selectedCategory && { category: selectedCategory }),
          minPrice: appliedPriceRange[0].toString(),
          maxPrice: appliedPriceRange[1].toString(),
          ...(selectedBrands.length > 0 && { brands: selectedBrands.join(',') }),
          sortBy,
          sortOrder,
        });

        const response = await api.get(`/products?${params}`);
        const productsWithCategoryNames = response.data.products.map((product: Product) => ({
          ...product,
          categoryName: categories.find(cat => cat._id === product.category)?.name || product.category
        }));
        
        if (loadMore) {
          setProducts(prev => [...prev, ...productsWithCategoryNames]);
        } else {
          setProducts(productsWithCategoryNames);
        }
        
        setTotalPages(response.data.totalPages);
        setTotalProducts(response.data.totalProducts);

        // Extract unique brands from products
        const brands = Array.from(
          new Set(response.data.products.map((product: Product) => product.brand))
        );
        setAvailableBrands(brands);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }, 500),
    [searchQuery, selectedCategory, sortBy, sortOrder, appliedPriceRange, selectedBrands, categories]
  );

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1);
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch initial price range
  const fetchPriceRange = async () => {
    try {
      const response = await api.get('/products/price-range');
      setPriceRange([response.data.min, response.data.max]);
      setAppliedPriceRange([response.data.min, response.data.max]);
    } catch (error) {
      console.error('Error fetching price range:', error);
    }
  };

  // Handle add to cart
  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      router.push('/auth/login');
      return;
    }

    try {
      await addToCart(productId, 1);
      toast.success('Product added to cart!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add product to cart');
    }
  };

  // Toggle wishlist
  const toggleWishlist = (productId: string) => {
    if (!user) {
      toast.error('Please login to manage your wishlist');
      router.push('/auth/login');
      return;
    }

    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Get item count in cart
  const getCartItemCount = (productId: string) => {
    if (!cart) return 0;
    const item = cart.items.find((item) => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle filters
  const handleCategoryChange = (event: any) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event: any) => {
    const [newSortBy, newSortOrder] = event.target.value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };

  const applyPriceFilter = () => {
    setAppliedPriceRange(priceRange);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPriceRange([0, 10000]);
    setAppliedPriceRange([0, 10000]);
    setSelectedBrands([]);
    setCurrentPage(1);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadMoreProducts = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchProducts(nextPage, true);
  };

  // Effects
  useEffect(() => {
    fetchCategories();
    fetchPriceRange();
  }, []);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage]);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Check if user needs to login
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please <Button onClick={() => router.push('/auth/login')}>login</Button> to access the shop.
        </Alert>
      </Container>
    );
  }

  // Filter sidebar content
  const filterSidebar = (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Filters
        </Typography>
        <Button 
          size="small" 
          onClick={resetFilters}
          sx={{ textTransform: 'none' }}
        >
          Clear All
        </Button>
      </Box>
      <Divider sx={{ my: 2 }} />

      {/* Price Range Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Price Range
        </Typography>
        <Slider
          value={priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          min={0}
          max={10000}
          step={100}
          valueLabelFormat={(value) => formatPrice(value)}
          sx={{ width: '95%', color: '#ff3e6c' }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2">{formatPrice(priceRange[0])}</Typography>
          <Typography variant="body2">{formatPrice(priceRange[1])}</Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={applyPriceFilter}
          sx={{ 
            mt: 1,
            backgroundColor: '#ff3e6c',
            '&:hover': {
              backgroundColor: '#e0355a',
            },
            width: '100%'
          }}
        >
          Apply Price
        </Button>
      </Box>

      {/* Categories Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Categories
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            displayEmpty
            sx={{ backgroundColor: 'white' }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category._id} value={category._id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Brands Filter */}
      {availableBrands.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Brands
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1,
            maxHeight: 200,
            overflowY: 'auto',
            p: 1,
            backgroundColor: '#f5f5f5',
            borderRadius: 1
          }}>
            {availableBrands.map((brand) => (
              <Chip
                key={brand}
                label={brand}
                onClick={() => toggleBrand(brand)}
                color={selectedBrands.includes(brand) ? 'primary' : 'default'}
                variant={selectedBrands.includes(brand) ? 'filled' : 'outlined'}
                size="small"
                sx={{
                  '&.MuiChip-filledPrimary': {
                    backgroundColor: '#ff3e6c',
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Sort Options */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Sort By
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={`${sortBy}-${sortOrder}`}
            onChange={handleSortChange}
            sx={{ backgroundColor: 'white' }}
          >
            <MenuItem value="createdAt-desc">Newest First</MenuItem>
            <MenuItem value="createdAt-asc">Oldest First</MenuItem>
            <MenuItem value="price-asc">Price: Low to High</MenuItem>
            <MenuItem value="price-desc">Price: High to Low</MenuItem>
            <MenuItem value="rating-desc">Highest Rated</MenuItem>
            <MenuItem value="name-asc">Name: A to Z</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Mobile Filter Button */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="filters"
          onClick={() => setMobileFiltersOpen(true)}
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16, 
            zIndex: 1000,
            backgroundColor: '#ff3e6c',
            '&:hover': {
              backgroundColor: '#e0355a',
            }
          }}
        >
          <FilterList />
        </Fab>
      )}

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="right"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ width: isSmallMobile ? '100vw' : 350, p: 2, height: '100vh', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Filters</Typography>
            <IconButton onClick={() => setMobileFiltersOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          {filterSidebar}
        </Box>
      </Drawer>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="#212121">
          Shop Products
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ 
        mb: 3,
        backgroundColor: 'white',
        p: 2,
        borderRadius: 2,
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.1)'
      }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} sm={8} md={6}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                placeholder="Search for products..."
                value={searchQuery}
                onChange={handleSearchChange}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#ff3e6c',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button 
                        type="submit" 
                        variant="contained"
                        sx={{
                          backgroundColor: '#ff3e6c',
                          '&:hover': {
                            backgroundColor: '#e0355a',
                          },
                          textTransform: 'none',
                          borderRadius: 1,
                          height: '100%'
                        }}
                      >
                        Search
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </Grid>

          {/* Sort - Moved to filters sidebar */}
          
          {/* Filter Button for Mobile */}
          <Grid item xs={12} sm={4} md={6} sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setMobileFiltersOpen(true)}
              sx={{
                textTransform: 'none',
                borderColor: '#e0e0e0',
                color: '#212121',
                '&:hover': {
                  borderColor: '#ff3e6c',
                  color: '#ff3e6c',
                },
                width: '100%'
              }}
            >
              Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content */}
      <Grid container spacing={2}>
        {/* Desktop Filters Sidebar */}
        {!isMobile && (
          <Grid item md={3}>
            <Box sx={{ 
              backgroundColor: 'white', 
              p: 2, 
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.1)',
              position: 'sticky',
              top: 20,
              alignSelf: 'flex-start'
            }}>
              {filterSidebar}
            </Box>
          </Grid>
        )}

        {/* Products Grid */}
        <Grid item xs={12} md={isMobile ? 12 : 9}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            Showing {products.length} of {totalProducts} products
          </Typography>
          
          <Grid container spacing={2}>
            {loading ? (
              // Loading skeletons
              Array.from({ length: 12 }).map((_, index) => (
                <Grid item xs={6} sm={4} md={4} lg={3} key={index}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" />
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" />
                      <Skeleton variant="text" width="80%" />
                    </CardContent>
                    <CardActions>
                      <Skeleton variant="rectangular" width="100%" height={36} />
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : products.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ width: '100%' }}>
                  No products found. Try adjusting your search or filters.
                </Alert>
              </Grid>
            ) : (
              products.map((product) => (
                <Grid item xs={6} sm={4} md={4} lg={3} key={product._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3,
                      },
                      border: '1px solid #f0f0f0',
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}
                  >
                    {/* Product Badges */}
                    <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
                      {product.discount && (
                        <Chip
                          label={`${product.discount}% OFF`}
                          size="small"
                          sx={{ 
                            backgroundColor: '#ff3e6c', 
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                    </Box>

                    {/* Wishlist Button */}
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        color: wishlist.includes(product._id) ? '#ff3e6c' : 'rgba(0,0,0,0.5)',
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.9)',
                        }
                      }}
                      onClick={() => toggleWishlist(product._id)}
                    >
                      {wishlist.includes(product._id) ? (
                        <Favorite />
                      ) : (
                        <FavoriteBorder />
                      )}
                    </IconButton>

                    {/* Product Image */}
                    <Box sx={{ 
                      position: 'relative', 
                      paddingTop: '100%', 
                      backgroundColor: '#f5f5f5'
                    }}>
                      <CardMedia
                        component="img"
                        image={product.images[0]?.url || '/placeholder.jpg'}
                        alt={product.name}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          cursor: 'pointer',
                          p: 1
                        }}
                        onClick={() => {
                          if (isMobile) {
                            router.push(`/product/${product._id}`);
                          } else {
                            setQuickViewProduct(product);
                            setImageIndex(0);
                          }
                        }}
                      />
                    </Box>

                    {/* Product Details */}
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography
                        variant="subtitle2"
                        component="h2"
                        gutterBottom
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          cursor: 'pointer',
                          minHeight: '3em',
                          fontWeight: 500,
                          color: '#212121',
                          '&:hover': {
                            color: '#ff3e6c'
                          }
                        }}
                        onClick={() => router.push(`/product/${product._id}`)}
                      >
                        {product.name}
                      </Typography>

                      {/* Price */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="#212121">
                          {formatPrice(product.price)}
                        </Typography>
                        {product.originalPrice && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ ml: 1, textDecoration: 'line-through' }}
                          >
                            {formatPrice(product.originalPrice)}
                          </Typography>
                        )}
                      </Box>

                      {/* Rating and Brand */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating
                          value={product.rating}
                          precision={0.5}
                          readOnly
                          size="small"
                          emptyIcon={<Star style={{ opacity: 0.55 }} fontSize="inherit" />}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          ({product.reviewCount})
                        </Typography>
                        <Chip
                          label={product.brand}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            ml: 'auto',
                            fontSize: '0.7rem',
                            borderColor: '#e0e0e0'
                          }}
                        />
                      </Box>

                      {/* Stock Status */}
                      {product.stock <= 10 && product.stock > 0 && (
                        <Typography variant="body2" color="warning.main" sx={{ fontSize: '0.75rem' }}>
                          Only {product.stock} left!
                        </Typography>
                      )}
                      {product.stock === 0 && (
                        <Typography variant="body2" color="error" sx={{ fontSize: '0.75rem' }}>
                          Out of stock
                        </Typography>
                      )}
                    </CardContent>

                    {/* Add to Cart Button */}
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<ShoppingCart />}
                        onClick={() => handleAddToCart(product._id)}
                        disabled={product.stock === 0}
                        sx={{ 
                          width: '100%',
                          backgroundColor: '#ff3e6c',
                          '&:hover': {
                            backgroundColor: '#e0355a',
                          },
                          '&.Mui-disabled': {
                            backgroundColor: '#f5f5f5',
                            color: '#bdbdbd'
                          }
                        }}
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        {getCartItemCount(product._id) > 0 && (
                          <Badge
                            badgeContent={getCartItemCount(product._id)}
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 4,
              mb: 4,
              backgroundColor: 'white',
              p: 2,
              borderRadius: 2,
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.1)'
            }}>
              {paginationType === 'pagination' ? (
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size={isMobile ? 'small' : 'large'}
                  siblingCount={isMobile ? 0 : 1}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#212121',
                      borderColor: '#e0e0e0'
                    },
                    '& .MuiPaginationItem-root.Mui-selected': {
                      backgroundColor: '#ff3e6c',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#e0355a'
                      }
                    }
                  }}
                />
              ) : (
                <Button
                  variant="outlined"
                  onClick={loadMoreProducts}
                  disabled={loadingMore || currentPage >= totalPages}
                  sx={{ 
                    width: 200,
                    borderColor: '#ff3e6c',
                    color: '#ff3e6c',
                    '&:hover': {
                      borderColor: '#e0355a',
                      color: '#e0355a',
                    },
                    '&.Mui-disabled': {
                      borderColor: '#e0e0e0',
                      color: '#bdbdbd'
                    }
                  }}
                >
                  {loadingMore ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : currentPage >= totalPages ? (
                    'No More Products'
                  ) : (
                    'Load More'
                  )}
                </Button>
              )}
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Quick View Dialog - Enhanced */}
      <Dialog
        open={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        {quickViewProduct && (
          <>
            <DialogTitle sx={{ 
              backgroundColor: '#f5f5f5',
              borderBottom: '1px solid #e0e0e0',
              py: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6" fontWeight="bold">
                {quickViewProduct.name}
              </Typography>
              <IconButton onClick={() => setQuickViewProduct(null)}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <Grid container>
                {/* Product Images */}
                <Grid item xs={12} md={6} sx={{ borderRight: { md: '1px solid #e0e0e0' } }}>
                  <Box sx={{ 
                    position: 'relative', 
                    height: 400,
                    backgroundColor: '#fafafa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CardMedia
                      component="img"
                      image={quickViewProduct.images[imageIndex]?.url || '/placeholder.jpg'}
                      alt={quickViewProduct.name}
                      sx={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        p: 2
                      }}
                    />
                    {quickViewProduct.images.length > 1 && (
                      <>
                        <IconButton
                          sx={{
                            position: 'absolute',
                            left: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.9)',
                            }
                          }}
                          onClick={() =>
                            setImageIndex((prev) =>
                              prev === 0 ? quickViewProduct.images.length - 1 : prev - 1
                            )
                          }
                        >
                          <ArrowBack />
                        </IconButton>
                        <IconButton
                          sx={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.9)',
                            }
                          }}
                          onClick={() =>
                            setImageIndex((prev) =>
                              prev === quickViewProduct.images.length - 1 ? 0 : prev + 1
                            )
                          }
                        >
                          <ArrowForward />
                        </IconButton>
                      </>
                    )}
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    p: 2,
                    overflowX: 'auto',
                    borderTop: '1px solid #e0e0e0'
                  }}>
                    {quickViewProduct.images.map((img, idx) => (
                      <CardMedia
                        key={idx}
                        component="img"
                        image={img.url}
                        alt={img.alt || quickViewProduct.name}
                        sx={{
                          width: 60,
                          height: 60,
                          cursor: 'pointer',
                          border: idx === imageIndex ? '2px solid #ff3e6c' : '1px solid #e0e0e0',
                          borderRadius: 1,
                          objectFit: 'contain',
                          backgroundColor: '#fafafa'
                        }}
                        onClick={() => setImageIndex(idx)}
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Product Details */}
                <Grid item xs={12} md={6} sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    {/* Price Section */}
                    <Box>
                      <Typography variant="h5" fontWeight="bold" color="#212121">
                        {formatPrice(quickViewProduct.price)}
                      </Typography>
                      {quickViewProduct.originalPrice && (
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ textDecoration: 'line-through', display: 'inline-block', mr: 1 }}
                        >
                          {formatPrice(quickViewProduct.originalPrice)}
                        </Typography>
                      )}
                      {quickViewProduct.discount && (
                        <Chip
                          label={`${quickViewProduct.discount}% OFF`}
                          size="small"
                          sx={{ 
                            backgroundColor: '#ff3e6c', 
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                    </Box>

                    {/* Rating and Reviews */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating
                        value={quickViewProduct.rating}
                        precision={0.5}
                        readOnly
                        size="medium"
                        emptyIcon={<Star style={{ opacity: 0.55 }} fontSize="inherit" />}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {quickViewProduct.rating.toFixed(1)} ({quickViewProduct.reviewCount} reviews)
                      </Typography>
                    </Box>

                    {/* Brand and Category */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        icon={<BrandingWatermark fontSize="small" />}
                        label={`Brand: ${quickViewProduct.brand}`}
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 1 }}
                      />
                      <Chip
                        icon={<Category fontSize="small" />}
                        label={`Category: ${quickViewProduct.categoryName || quickViewProduct.category}`}
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 1 }}
                      />
                      <Chip
                        icon={<Inventory fontSize="small" />}
                        label={quickViewProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        color={quickViewProduct.stock > 0 ? 'success' : 'error'}
                        size="small"
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>

                    {/* Highlights */}
                    {quickViewProduct.highlights && quickViewProduct.highlights.length > 0 && (
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Highlights
                        </Typography>
                        <ul style={{ 
                          paddingLeft: 20,
                          margin: 0,
                          listStyleType: 'disc'
                        }}>
                          {quickViewProduct.highlights.map((highlight, idx) => (
                            <li key={idx}>
                              <Typography variant="body2" color="text.secondary">
                                {highlight}
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      </Box>
                    )}

                    {/* Description */}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {quickViewProduct.description}
                      </Typography>
                    </Box>

                    {/* Specifications */}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Specifications
                      </Typography>
                      <Box sx={{ 
                        backgroundColor: '#f9f9f9',
                        borderRadius: 1,
                        p: 2
                      }}>
                        {quickViewProduct.specifications.map((spec, idx) => (
                          <Grid container key={idx} sx={{ py: 1 }}>
                            <Grid item xs={4}>
                              <Typography variant="body2" fontWeight="medium" color="text.secondary">
                                {spec.key}
                              </Typography>
                            </Grid>
                            <Grid item xs={8}>
                              <Typography variant="body2">{spec.value}</Typography>
                            </Grid>
                          </Grid>
                        ))}
                      </Box>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ 
              p: 2,
              borderTop: '1px solid #e0e0e0',
              justifyContent: 'space-between'
            }}>
              <Button
                variant="outlined"
                onClick={() => setQuickViewProduct(null)}
                sx={{
                  color: '#212121',
                  borderColor: '#e0e0e0',
                  '&:hover': {
                    borderColor: '#ff3e6c',
                    color: '#ff3e6c',
                  }
                }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<ShoppingCart />}
                onClick={() => {
                  handleAddToCart(quickViewProduct._id);
                  setQuickViewProduct(null);
                }}
                disabled={quickViewProduct.stock === 0}
                sx={{
                  backgroundColor: '#ff3e6c',
                  '&:hover': {
                    backgroundColor: '#e0355a',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#f5f5f5',
                    color: '#bdbdbd'
                  }
                }}
              >
                Add to Cart
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default ShopPage;