import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Stack,
  Paper
} from '@mui/material';

export default function Register({ NavBar }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      await api.post('/auth/register', data);
      reset();
      navigate('/login');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Register gagal');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none', // background sudah di App.jsx
        fontFamily: 'Inter, Roboto, Arial, sans-serif',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          maxWidth: 370,
          width: '100%',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(30, 41, 59, 0.10)',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(2px)',
        }}
      >
        {NavBar}
        <Typography
          variant="h4"
          fontWeight={800}
          color="text.primary"
          align="center"
          letterSpacing={1}
          sx={{ fontFamily: 'Inter, Roboto, Arial, sans-serif', mb: 1 }}
        >
          Daftar Akun
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          sx={{ mb: 3, fontWeight: 400 }}
        >
          Buat akun baru untuk mulai menulis catatan.
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              {...register('email', { required: true })}
              error={!!errors.email}
              helperText={errors.email && 'Email wajib diisi'}
              fullWidth
              autoFocus
              InputProps={{ style: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } }}
            />
            <TextField
              label="Password"
              type="password"
              {...register('password', { required: true, minLength: 6 })}
              error={!!errors.password}
              helperText={errors.password && 'Password minimal 6 karakter'}
              fullWidth
              InputProps={{ style: { fontFamily: 'Inter, Roboto, Arial, sans-serif' } }}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              size="large"
              sx={{
                fontWeight: 700,
                fontFamily: 'Inter, Roboto, Arial, sans-serif',
                letterSpacing: 1,
                py: 1.3,
                fontSize: '1.1rem',
                background: '#222',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(30,41,59,0.08)',
                '&:hover': { background: '#111' },
              }}
            >
              Register
            </Button>
            {errorMsg && (
              <Alert severity="error" variant="filled">{errorMsg}</Alert>
            )}
          </Stack>
        </form>
      </Paper>
    </Box>
  );
} 