import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import './Login.css';

export default function Login() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const onSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.post('/auth/login', data);
      setSuccessMsg('Login berhasil!');
      reset();
      // TODO: Redirect ke halaman utama
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login gagal');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <label>Email</label>
        <input type="email" {...register('email', { required: true })} />
        {errors.email && <span className="error">Email wajib diisi</span>}

        <label>Password</label>
        <input type="password" {...register('password', { required: true })} />
        {errors.password && <span className="error">Password wajib diisi</span>}

        <button type="submit">Login</button>
        {errorMsg && <div className="error">{errorMsg}</div>}
        {successMsg && <div style={{ color: '#16a34a', fontWeight: 'bold' }}>{successMsg}</div>}
      </form>
    </div>
  );
} 