import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function NotesList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/notes')
      .then(res => {
        setNotes(res.data);
        setError('');
      })
      .catch(err => {
        setError('Gagal mengambil catatan');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
      <h2>Daftar Catatan</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: '#dc2626' }}>{error}</div>}
      {!loading && !error && notes.length === 0 && <div>Belum ada catatan.</div>}
      <ul>
        {notes.map(note => (
          <li key={note.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            {note.title}
          </li>
        ))}
      </ul>
    </div>
  );
} 