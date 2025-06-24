import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import { setLogin } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, FormControl, FormLabel, Input, FormErrorMessage, Heading, Alert, AlertIcon, VStack
} from '@chakra-ui/react';

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
    <Box maxW="350px" mx="auto" mt="60px" p="8" borderWidth="1px" borderRadius="lg" bg="white" boxShadow="md">
      <Heading size="md" mb="6" textAlign="center">Register</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4}>
          <FormControl isInvalid={errors.email}>
            <FormLabel>Email</FormLabel>
            <Input type="email" {...register('email', { required: true })} />
            <FormErrorMessage>Email wajib diisi</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={errors.password}>
            <FormLabel>Password</FormLabel>
            <Input type="password" {...register('password', { required: true, minLength: 6 })} />
            <FormErrorMessage>Password minimal 6 karakter</FormErrorMessage>
          </FormControl>
          <Button colorScheme="blue" type="submit" width="full">Register</Button>
          {errorMsg && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {errorMsg}
            </Alert>
          )}
        </VStack>
      </form>
    </Box>
  );
} 