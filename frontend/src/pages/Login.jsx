import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { setLogin } from '../utils/auth';
import './Login.css';

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
      </form>
    </div>
  );
} 