import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  Box, Heading, Button, Input, List, ListItem, Flex, Spinner, Alert, AlertIcon, Text
} from '@chakra-ui/react';

export default function NotesList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [addError, setAddError] = useState('');

  const fetchNotes = () => {
    setLoading(true);
    api.get('/notes')
      .then(res => {
        setNotes(res.data);
        setError('');
      })
      .catch(() => {
        setError('Gagal mengambil catatan');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const onAddNote = async (data) => {
    setAddError('');
    try {
      await api.post('/notes', { title: data.title });
      reset();
      fetchNotes();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Gagal menambah catatan');
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Hapus catatan ini?')) return;
    try {
      await api.delete(`/notes/${id}`);
      fetchNotes();
    } catch {
      alert('Gagal menghapus catatan');
    }
  };

  return (
    <Box maxW="600px" mx="auto" mt="40px" p="8" bg="white" borderRadius="lg" boxShadow="md">
      <Heading size="md" mb="6">Daftar Catatan</Heading>
      <form onSubmit={handleSubmit(onAddNote)}>
        <Flex gap={2} mb={4}>
          <Input
            type="text"
            placeholder="Judul catatan baru"
            {...register('title', { required: true })}
            bg="gray.50"
          />
          <Button colorScheme="blue" type="submit">Tambah</Button>
        </Flex>
        {errors.title && <Text color="red.500" mb={2}>Judul wajib diisi</Text>}
        {addError && <Alert status="error" mb={2}><AlertIcon />{addError}</Alert>}
      </form>
      {loading && <Flex justify="center" my={6}><Spinner /></Flex>}
      {error && <Alert status="error" mb={4}><AlertIcon />{error}</Alert>}
      {!loading && !error && notes.length === 0 && <Text color="gray.500">Belum ada catatan.</Text>}
      <List spacing={2}>
        {notes.map(note => (
          <ListItem key={note.id} p={3} borderWidth="1px" borderRadius="md" display="flex" alignItems="center" justifyContent="space-between">
            <Link to={`/notes/${note.id}`} style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'underline' }}>
              {note.title}
            </Link>
            <Button size="sm" colorScheme="red" onClick={() => onDelete(note.id)}>
              Hapus
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
} 