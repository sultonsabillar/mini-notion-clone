import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { setLogin } from '../utils/auth';
import './Login.css';

export default function Register() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      await api.post('/auth/register', data);
      setLogin();
      reset();
      navigate('/notes');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Register gagal');
    }
  };

  return (
    <div className="login-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <label>Email</label>
        <input type="email" {...register('email', { required: true })} />
        {errors.email && <span className="error">Email wajib diisi</span>}

        <label>Password</label>
        <input type="password" {...register('password', { required: true, minLength: 6 })} />
        {errors.password && <span className="error">Password minimal 6 karakter</span>}

        <button type="submit">Register</button>
        {errorMsg && <div className="error">{errorMsg}</div>}
      </form>
    </div>
  );
} 