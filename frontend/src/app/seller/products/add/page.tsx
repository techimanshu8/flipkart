'use client';

import React, { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Box, Paper, Alert, CircularProgress, MenuItem, Select, InputLabel, FormControl, IconButton
} from '@mui/material';
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
    if (e.target.files) {
      setImages(Array.from(e.target.files).slice(0, 5));
    }
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

  const addSpec = () => setSpecifications(specs => [...specs, { name: '', value: '' }]);
  const removeSpec = (idx: number) => setSpecifications(specs => specs.length > 1 ? specs.filter((_, i) => i !== idx) : specs);
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
      images.forEach(img => formData.append('images', img));
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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
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
          <Button variant="contained" component="label" sx={{ mb: 2 }} fullWidth>
            Upload Images (max 5)
            <input type="file" hidden accept="image/*" multiple onChange={handleImageChange} />
          </Button>
          {images.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {images.map((img, idx) => (
                <Typography key={idx} variant="body2">{img.name}</Typography>
              ))}
            </Box>
          )}
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