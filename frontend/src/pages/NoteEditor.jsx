import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

export default function NoteEditor() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/notes/${id}`)
      .then(res => {
        setNote(res.data);
        setError('');
      })
      .catch(() => {
        setError('Gagal mengambil detail catatan');
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: '#dc2626' }}>{error}</div>}
      {note && (
        <>
          <h2>{note.title}</h2>
          <h4>Blok Catatan:</h4>
          {note.blocks.length === 0 && <div>Belum ada blok.</div>}
          <ul>
            {note.blocks.map(block => (
              <li key={block.id} style={{ marginBottom: 12, padding: 8, border: '1px solid #eee', borderRadius: 4 }}>
                <b>{block.type}</b>: {typeof block.content === 'string' ? block.content : JSON.stringify(block.content)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
} 