import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../utils/api';

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
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
      <h2>Daftar Catatan</h2>
      <form onSubmit={handleSubmit(onAddNote)} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Judul catatan baru"
          {...register('title', { required: true })}
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #bbb' }}
        />
        <button type="submit" style={{ padding: '8px 16px', borderRadius: 4, background: '#2563eb', color: '#fff', border: 'none' }}>
          Tambah
        </button>
      </form>
      {errors.title && <div style={{ color: '#dc2626' }}>Judul wajib diisi</div>}
      {addError && <div style={{ color: '#dc2626' }}>{addError}</div>}
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: '#dc2626' }}>{error}</div>}
      {!loading && !error && notes.length === 0 && <div>Belum ada catatan.</div>}
      <ul>
        {notes.map(note => (
          <li key={note.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{note.title}</span>
            <button onClick={() => onDelete(note.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 