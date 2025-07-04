import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
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
  Paper,
  InputAdornment,
  IconButton
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Komponen untuk item yang bisa di-drag
function SortableNoteItem({ note, children, ...props }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: note.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#e0e7ff' : '#fff',
    cursor: 'grab',
  };
  return (
    <ListItem ref={setNodeRef} {...attributes} {...listeners} style={style} {...props}>
      {children}
    </ListItem>
  );
}

export default function NotesList({ NavBar, NavBarBottom }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [addError, setAddError] = useState('');
  const navigate = useNavigate();

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
    try {
      await api.delete(`/notes/${id}`);
      fetchNotes();
    } catch {
      alert('Gagal menghapus catatan');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = notes.findIndex(n => n.id === active.id);
    const newIndex = notes.findIndex(n => n.id === over.id);
    const newNotes = arrayMove(notes, oldIndex, newIndex).map((n, idx) => ({ ...n, orderIndex: idx }));
    setNotes(newNotes);
    try {
      await api.patch('/notes/reorder', { notes: newNotes.map(n => ({ id: n.id, orderIndex: n.orderIndex })) });
    } catch {
      // Optional: tampilkan error jika gagal
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: 'none' }}>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 700, mt: 8 }}>
        <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, width: '100%', background: '#fff' }}>
          <Box display="flex" alignItems="center" justifyContent="center" mb={3} gap={1}>
            <Typography variant="h5" fontWeight={700} align="center">Daftar Catatan</Typography>
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 17 16" style={{ color: '#222' }}>
                <path fill="currentColor" fillRule="evenodd" d="M15.016 0v1.031h-1.062V0h-.895v1.031h-1.09V0h-.953v1.031H9.954V0h-.922v1.031H7.941V0h-.925v1.031H5.985V0h-.942v1.031H3.959V0H3v16h12.954V0h-.938zM5 6.958h9v1H5v-1zm9 5H5v-1h9v1zM14 10H5V9h9v1z"/>
              </svg>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" mb={1}>
            {/* Elemen Box dengan SVG dihapus */}
          </Box>
          <form onSubmit={handleSubmit(onAddNote)}>
            <TextField
              type="text"
              placeholder="Judul catatan baru"
              {...register('title', { required: true })}
              error={!!errors.title}
              helperText={errors.title && 'Judul wajib diisi'}
              size="medium"
              fullWidth
              sx={{
                borderRadius: '999px',
                background: '#f5f5f5',
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '999px',
                  background: '#f5f5f5',
                  paddingRight: 0,
                  height: 48,
                  minHeight: 0,
                  boxSizing: 'border-box',
                  border: 'none',
                  boxShadow: '0 1px 4px 0 rgba(60,60,60,0.04)',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '& .MuiInputBase-input': {
                  fontWeight: 500,
                  color: '#222',
                  paddingLeft: 2.5,
                },
                '& .MuiInputBase-input::placeholder': {
                  fontWeight: 600,
                  color: '#888',
                  opacity: 1,
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ p: 0, m: 0, height: '100%' }}>
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{
                        borderRadius: '999px',
                        minWidth: 0,
                        px: 3,
                        height: '40px',
                        fontWeight: 700,
                        fontSize: 16,
                        boxShadow: '0 2px 8px 0 rgba(60,60,60,0.10)',
                        ml: 0,
                        background: '#222',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          background: '#111',
                          boxShadow: '0 4px 16px 0 rgba(60,60,60,0.18)',
                        },
                        '&:focus': { outline: 'none', boxShadow: 'none' },
                      }}
                    >
                      Tambah
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
            {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}
          </form>
          {loading && <Stack alignItems="center" my={4}><CircularProgress /></Stack>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {!loading && !error && notes.length === 0 && <Typography color="text.secondary">Belum ada catatan.</Typography>}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={notes.map(n => n.id)} strategy={verticalListSortingStrategy}>
              <List>
                {notes.map(note => (
                  <SortableNoteItem key={note.id} note={note} sx={{ p: 2, border: '1px solid #eee', borderRadius: 1, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography sx={{ color: '#222', fontWeight: 500, fontSize: 16 }}>{note.title}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/notes/${note.id}`)}
                        sx={{
                          color: '#444',
                          bgcolor: '#f5f5f5',
                          borderRadius: '50%',
                          width: 32,
                          height: 32,
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: '#e0e0e0',
                            color: '#111',
                            boxShadow: 2,
                          },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" style={{ color: '#222' }}>
                          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 11V6.2c0-1.12 0-1.68.218-2.108c.192-.377.497-.682.874-.874C7.52 3 8.08 3 9.2 3H14m6 6v8.804c0 1.118 0 1.677-.218 2.104a2.002 2.002 0 0 1-.874.874C18.48 21 17.92 21 16.803 21H13m7-12c-.004-.285-.014-.466-.056-.639a1.993 1.993 0 0 0-.24-.578c-.123-.202-.295-.374-.641-.72l-3.125-3.125c-.346-.346-.52-.52-.721-.643a1.999 1.999 0 0 0-.578-.24c-.173-.041-.353-.052-.639-.054M20 9h0m0 0h-2.803c-1.118 0-1.678 0-2.105-.218a2 2 0 0 1-.874-.874C14 7.48 14 6.92 14 5.8V3M9 14l2 2m-7 5v-2.5l7.5-7.5l2.5 2.5L6.5 21H4Z"/>
                        </svg>
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDelete(note.id)}
                        sx={{
                          color: '#444',
                          bgcolor: '#f5f5f5',
                          borderRadius: '50%',
                          width: 36,
                          height: 36,
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: '#e0e0e0',
                            color: '#111',
                            boxShadow: 2,
                          },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 22 }} />
                      </IconButton>
                    </Box>
                  </SortableNoteItem>
                ))}
              </List>
            </SortableContext>
          </DndContext>
        </Paper>
      </Box>
      {NavBarBottom && <Box sx={{ width: '100%', maxWidth: 700, display: 'flex', justifyContent: 'center', mx: 'auto' }}>{NavBarBottom}</Box>}
    </Box>
  );
} 