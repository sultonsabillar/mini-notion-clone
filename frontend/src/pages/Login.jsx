import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import { setLogin } from '../utils/auth';
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

export default function Login() {
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
    <Paper sx={{ maxWidth: 350, mx: 'auto', mt: 8, p: 4, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h6" mb={3} align="center">Login</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            {...register('email', { required: true })}
            error={!!errors.email}
            helperText={errors.email && 'Email wajib diisi'}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            {...register('password', { required: true })}
            error={!!errors.password}
            helperText={errors.password && 'Password wajib diisi'}
            fullWidth
          />
          <Button variant="contained" color="primary" type="submit" fullWidth>Login</Button>
          {errorMsg && (
            <Alert severity="error" variant="filled">{errorMsg}</Alert>
          )}
        </Stack>
      </form>
    </Paper>
  );
} 