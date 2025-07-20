'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CloudUpload, Delete} from '@mui/icons-material';
import { Add, Remove } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

const BRANDS = [
  'Apple', 'Samsung', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Boat', 'OnePlus', 'Mi', 'Realme', 'Vivo', 'Oppo', 'Other'
];

const AddProductPage: React.FC = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [specifications, setSpecifications] = useState([{ name: '', value: '' }]);
  const [features, setFeatures] = useState(['']);
  const [warranty, setWarranty] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.categories || []);
      } catch (err) {
        setError('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleImageChange triggered', e.target.files);
    const files = Array.from(e.target.files || []);
    console.log('Files array created:', files.length, 'files');
    handleNewImages(files);
  };

  const handleNewImages = (files: File[]) => {
    console.log('handleNewImages called with', files.length, 'files');
    
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    console.log('Valid image files:', validFiles.length);
    
    // Calculate how many more images we can add
    const remainingSlots = 5 - images.length;
    const newValidFiles = validFiles.slice(0, remainingSlots);
    console.log('New files to be added:', newValidFiles.length);

    if (newValidFiles.length === 0) {
      console.log('No new files to add');
      return;
    }

    // Create array to store new preview promises
    const previewPromises = newValidFiles.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log(`FileReader completed for ${file.name}`);
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          console.error(`FileReader error for ${file.name}:`, reader.error);
          reject(reader.error);
        };
        reader.readAsDataURL(file);
      });
    });

    // Wait for all previews to be generated
    Promise.all(previewPromises)
      .then(newPreviews => {
        console.log('All previews generated, count:', newPreviews.length);
        
        // Update images and previews atomically
        setImages(prev => [...prev, ...newValidFiles]);
        setImagePreviews(prev => {
          const updated = [...prev, ...newPreviews];
          console.log('Final preview count:', updated.length);
          return updated;
        });
      })
      .catch(error => {
        console.error('Error generating previews:', error);
      });
  };

  const handleDeleteImage = (index: number) => {
    console.log('Deleting image at index:', index);
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      console.log('Updated images count:', newImages.length);
      return newImages;
    });
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      console.log('Updated previews count:', newPreviews.length);
      return newPreviews;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    console.log('File drop detected');
    const files = Array.from(e.dataTransfer.files);
    console.log('Dropped files:', files.length);
    handleNewImages(files);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSpecChange = (idx: number, field: 'name' | 'value', value: string) => {
    setSpecifications(specs => {
      const updated = [...specs];
      updated[idx][field] = value;
      return updated;
    });
  };

  const handleFeatureChange = (idx: number, value: string) => {
    setFeatures(f => {
      const updated = [...f];
      updated[idx] = value;
      return updated;
    });
  };

  const addFeature = () => setFeatures(f => [...f, '']);
  const removeFeature = (idx: number) => setFeatures(f => f.length > 1 ? f.filter((_, i) => i !== idx) : f);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      if (originalPrice) formData.append('originalPrice', originalPrice);
      formData.append('description', description);
      formData.append('stock', stock);
      formData.append('category', category);
      if (subcategory) formData.append('subcategory', subcategory);
      formData.append('brand', brand);
      
      // Handle images
      if (images.length === 0) {
        throw new Error('Please upload at least one product image');
      }
      images.forEach((img, index) => {
        formData.append(`images`, img);
      });
      
      if (specifications.length > 0) formData.append('specifications', JSON.stringify(specifications.filter(s => s.name && s.value)));
      if (features.length > 0) formData.append('features', JSON.stringify(features.filter(f => f)));
      if (warranty) formData.append('warranty', warranty);
      if (returnPolicy) formData.append('returnPolicy', returnPolicy);
      if (deliveryTime) formData.append('deliveryTime', deliveryTime);
      const response = await api.post('/seller/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Product added successfully!');
      setTimeout(() => router.push('/seller/products'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };


  const addSpec = () => setSpecifications(specs => [...specs, { name: '', value: '' }]);
  const removeSpec = (idx: number) => setSpecifications(specs => specs.length > 1 ? specs.filter((_, i) => i !== idx) : specs);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Add New Product
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <TextField label="Product Name" value={name} onChange={e => setName(e.target.value)} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Price (INR)" type="number" value={price} onChange={e => setPrice(e.target.value)} fullWidth required sx={{ mb: 2 }} />
          <TextField label="Original Price (INR)" type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth multiline rows={3} required sx={{ mb: 2 }} />
          <TextField label="Stock" type="number" value={stock} onChange={e => setStock(e.target.value)} fullWidth required sx={{ mb: 2 }} />
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select value={category} label="Category" onChange={e => setCategory(e.target.value)}>
              {categories.map(cat => (
                <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Subcategory" value={subcategory} onChange={e => setSubcategory(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Brand</InputLabel>
            <Select value={brand} label="Brand" onChange={e => setBrand(e.target.value)}>
              {BRANDS.map(b => (
                <MenuItem key={b} value={b}>{b}</MenuItem>
              ))}
            </Select>
          </FormControl>
              <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Product Images
              </Typography>
              <Box
                sx={{
                  border: theme => `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.grey[300]}`,
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: isDragging ? 'action.hover' : 'background.paper',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover',
                  },
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                />
                <Box sx={{ mb: 2 }}>
                  <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Drag & drop product images here
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    or click to browse (max 5 images)
                  </Typography>
                </Box>

                {/* Image Previews */}
                <Grid  spacing={10} xs={4} sm={3} md={2.4} sx={{ mt: 2 }}>
                  {imagePreviews.map((preview, index) => (
                    <Grid item key={index}>
                      <Box
                        sx={{
                          position: 'relative',
                          height: { xs: 120, sm: 150 },
                          borderRadius: 1,
                          overflow: 'hidden',
                          boxShadow: 1,
                        }}
                      >
                        <Box
                          component="img"
                          src={preview}
                          alt={`Product preview ${index + 1}`}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(index);
                          }}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            },
                          }}
                        >
                          <Delete sx={{ color: 'white', fontSize: 20 }} />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                  {imagePreviews.length < 5 && (
                    <Grid item xs={4} sm={3} md={2.4}>
                      <Box
                        sx={{
                          position: 'relative',
                          height: { xs: 120, sm: 150 },
                          border: '2px dashed',
                          borderColor: 'grey.300',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'action.hover',
                          },
                        }}
                        onClick={triggerFileInput}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <Add sx={{ fontSize: 32, color: 'grey.500' }} />
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>

          {/* <Button variant="contained" component="label" sx={{ mb: 2 }} fullWidth>
            Upload Images (max 5)
            <input type="file" hidden accept="image/*" multiple onChange={handleImageChange} />
          </Button>
          {images.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {images.map((img, idx) => (
                <Typography key={idx} variant="body2">{img.name}</Typography>
              ))}
            </Box>
          )} */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Specifications</Typography>
            {specifications.map((spec, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField label="Name" value={spec.name} onChange={e => handleSpecChange(idx, 'name', e.target.value)} size="small" sx={{ flex: 1 }} />
                <TextField label="Value" value={spec.value} onChange={e => handleSpecChange(idx, 'value', e.target.value)} size="small" sx={{ flex: 2 }} />
                <IconButton onClick={() => removeSpec(idx)} disabled={specifications.length === 1}><Remove /></IconButton>
                {idx === specifications.length - 1 && <IconButton onClick={addSpec}><Add /></IconButton>}
              </Box>
            ))}
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Features</Typography>
            {features.map((feature, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField label="Feature" value={feature} onChange={e => handleFeatureChange(idx, e.target.value)} size="small" sx={{ flex: 1 }} />
                <IconButton onClick={() => removeFeature(idx)} disabled={features.length === 1}><Remove /></IconButton>
                {idx === features.length - 1 && <IconButton onClick={addFeature}><Add /></IconButton>}
              </Box>
            ))}
          </Box>
          <TextField label="Warranty" value={warranty} onChange={e => setWarranty(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Return Policy" value={returnPolicy} onChange={e => setReturnPolicy(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Delivery Time" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Add Product'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddProductPage; 