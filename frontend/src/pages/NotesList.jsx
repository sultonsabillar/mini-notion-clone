import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  Stack,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';

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
    <Paper sx={{ maxWidth: 600, mx: 'auto', mt: 5, p: 4, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h6" mb={3}>Daftar Catatan</Typography>
      <form onSubmit={handleSubmit(onAddNote)}>
        <Stack direction="row" spacing={2} mb={2}>
          <TextField
            type="text"
            placeholder="Judul catatan baru"
            {...register('title', { required: true })}
            error={!!errors.title}
            helperText={errors.title && 'Judul wajib diisi'}
            size="small"
            fullWidth
          />
          <Button variant="contained" color="primary" type="submit">Tambah</Button>
        </Stack>
        {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}
      </form>
      {loading && <Stack alignItems="center" my={4}><CircularProgress /></Stack>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!loading && !error && notes.length === 0 && <Typography color="text.secondary">Belum ada catatan.</Typography>}
      <List>
        {notes.map(note => (
          <ListItem key={note.id} sx={{ p: 2, border: '1px solid #eee', borderRadius: 1, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to={`/notes/${note.id}`} style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'underline' }}>
              {note.title}
            </Link>
            <Button size="small" color="error" variant="contained" onClick={() => onDelete(note.id)}>
              Hapus
            </Button>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
} 