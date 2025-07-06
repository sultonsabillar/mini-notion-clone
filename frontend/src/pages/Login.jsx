import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import { setLogin } from '../utils/auth';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Button,
  TextField,
  Typography,
  Alert,
  Stack,
  Paper
} from '@mui/material';

export default function Login({ NavBar }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      await api.post('/auth/login', data);
      setLogin();
      reset();
      navigate('/notes');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login gagal');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(120deg, #e5e7eb 0%, #fafafa 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 0,
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
          Mini Notion
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          sx={{ mb: 3, fontWeight: 400 }}
        >
          Catatan modern, login untuk mulai menulis!
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
              {...register('password', { required: true })}
              error={!!errors.password}
              helperText={errors.password && 'Password wajib diisi'}
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
              Login
            </Button>
            {errorMsg && (
              <Alert severity="error" variant="filled">{errorMsg}</Alert>
            )}
          </Stack>
        </form>
        <Button
          component={RouterLink}
          to="/register"
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ mt: 3, fontWeight: 600, borderRadius: 2, borderColor: '#222', color: '#222', '&:hover': { borderColor: '#111', background: '#f5f5f5' } }}
        >
          Belum punya akun? Daftar
        </Button>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 4, fontWeight: 400, fontSize: 13 }}>
          By Sulton | Mini Notion 2025
        </Typography>
      </Paper>
    </div>
  );
} 