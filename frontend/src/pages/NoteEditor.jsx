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
  const [editBlockId, setEditBlockId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editChecklist, setEditChecklist] = useState({ text: '', checked: false });
  const [editError, setEditError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

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

  const handleEdit = (block) => {
    setEditBlockId(block.id);
    setEditError('');
    if (block.type === 'checklist') {
      setEditChecklist({
        text: block.content.text || '',
        checked: !!block.content.checked,
      });
    } else {
      setEditValue(block.content || '');
    }
  };

  const handleEditSubmit = async (block) => {
    setEditError('');
    try {
      let content;
      if (block.type === 'checklist') {
        content = editChecklist;
      } else {
        content = editValue;
      }
      await api.put(`/blocks/${block.id}`, { content });
      setEditBlockId(null);
      fetchNote();
    } catch (err) {
      setEditError('Gagal update blok');
    }
  };

  const handleDelete = async (blockId) => {
    if (!window.confirm('Hapus blok ini?')) return;
    setDeleteLoading(blockId);
    try {
      await api.delete(`/blocks/${blockId}`);
      fetchNote();
    } catch {
      alert('Gagal menghapus blok');
    } finally {
      setDeleteLoading(null);
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <b>{block.type}</b>
                  <button onClick={() => handleEdit(block)} style={{ fontSize: 13, padding: '2px 8px', borderRadius: 4, border: '1px solid #bbb', background: '#f3f4f6', cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(block.id)} disabled={deleteLoading === block.id} style={{ fontSize: 13, padding: '2px 8px', borderRadius: 4, background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    {deleteLoading === block.id ? '...' : 'Hapus'}
                  </button>
                </div>
                {editBlockId === block.id ? (
                  <div style={{ marginTop: 8 }}>
                    {block.type === 'text' && (
                      <textarea
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        rows={3}
                        style={{ width: '100%', fontSize: 15, padding: 6 }}
                      />
                    )}
                    {block.type === 'code' && (
                      <textarea
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        rows={4}
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: 15, padding: 6, background: '#f3f4f6' }}
                      />
                    )}
                    {block.type === 'image' && (
                      <input
                        type="url"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        placeholder="URL gambar"
                        style={{ width: '100%', fontSize: 15, padding: 6 }}
                      />
                    )}
                    {block.type === 'checklist' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={editChecklist.checked}
                          onChange={e => setEditChecklist(c => ({ ...c, checked: e.target.checked }))}
                        />
                        <input
                          type="text"
                          value={editChecklist.text}
                          onChange={e => setEditChecklist(c => ({ ...c, text: e.target.value }))}
                          placeholder="Teks checklist"
                          style={{ flex: 1, fontSize: 15, padding: 6 }}
                        />
                      </div>
                    )}
                    {editError && <div style={{ color: '#dc2626', marginTop: 6 }}>{editError}</div>}
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEditSubmit(block)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 500 }}>
                        Simpan
                      </button>
                      <button onClick={() => setEditBlockId(null)} style={{ border: '1px solid #bbb', borderRadius: 4, padding: '6px 16px', background: '#f3f4f6', cursor: 'pointer' }}>
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 8 }}>
                    {block.type === 'text' && <div>{block.content}</div>}
                    {block.type === 'code' && (
                      <pre style={{ background: '#f3f4f6', padding: 8, borderRadius: 4, fontFamily: 'monospace', fontSize: 15 }}>
                        {block.content}
                      </pre>
                    )}
                    {block.type === 'image' && block.content && (
                      <img src={block.content} alt="img" style={{ maxWidth: 320, maxHeight: 180, borderRadius: 6, border: '1px solid #ddd' }} />
                    )}
                    {block.type === 'checklist' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="checkbox" checked={!!block.content.checked} readOnly />
                        <span>{block.content.text}</span>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
} 