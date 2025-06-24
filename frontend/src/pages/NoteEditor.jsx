import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const BLOCK_TYPES = [
  { type: 'text', label: 'Text' },
  { type: 'checklist', label: 'Checklist' },
  { type: 'image', label: 'Image' },
  { type: 'code', label: 'Code' },
];

export default function NoteEditor() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [addBlockLoading, setAddBlockLoading] = useState(false);
  const [addBlockError, setAddBlockError] = useState('');

  const fetchNote = () => {
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
  };

  useEffect(() => {
    fetchNote();
    // eslint-disable-next-line
  }, [id]);

  const handleAddBlock = async (type) => {
    setAddBlockLoading(true);
    setAddBlockError('');
    try {
      await api.post('/blocks', {
        noteId: Number(id),
        type,
        content: type === 'checklist' ? { text: '', checked: false } : '',
        orderIndex: note?.blocks.length || 0,
      });
      setShowAddBlock(false);
      fetchNote();
    } catch (err) {
      setAddBlockError('Gagal menambah blok');
    } finally {
      setAddBlockLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: '#dc2626' }}>{error}</div>}
      {note && (
        <>
          <h2>{note.title}</h2>
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => setShowAddBlock(v => !v)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 500 }}>
              Tambah Blok
            </button>
            {showAddBlock && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                {BLOCK_TYPES.map(opt => (
                  <button
                    key={opt.type}
                    onClick={() => handleAddBlock(opt.type)}
                    disabled={addBlockLoading}
                    style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid #bbb', background: '#f3f4f6', cursor: 'pointer' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            {addBlockError && <div style={{ color: '#dc2626', marginTop: 8 }}>{addBlockError}</div>}
          </div>
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