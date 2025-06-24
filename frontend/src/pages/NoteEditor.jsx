import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const BLOCK_TYPES = [
  { type: 'text', label: 'Text' },
  { type: 'checklist', label: 'Checklist' },
  { type: 'image', label: 'Image' },
  { type: 'code', label: 'Code' },
];

function SortableBlock({ block, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#e0e7ff' : '#fff',
    cursor: 'grab',
  };
  return (
    <li ref={setNodeRef} style={{ ...style, marginBottom: 12, padding: 8, border: '1px solid #eee', borderRadius: 4 }} {...attributes} {...listeners}>
      {children}
    </li>
  );
}

function useDebouncedCallback(callback, delay, deps = []) {
  const timeout = useRef();
  useEffect(() => {
    return () => clearTimeout(timeout.current);
    // eslint-disable-next-line
  }, deps);
  return (...args) => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

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
  const [blocks, setBlocks] = useState([]);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [autosaveLoading, setAutosaveLoading] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleError, setTitleError] = useState('');

  const fetchNote = () => {
    setLoading(true);
    api.get(`/notes/${id}`)
      .then(res => {
        setNote(res.data);
        setBlocks(res.data.blocks.sort((a, b) => a.orderIndex - b.orderIndex));
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

  useEffect(() => {
    if (note) setTitleValue(note.title);
  }, [note]);

  const handleAddBlock = async (type) => {
    setAddBlockLoading(true);
    setAddBlockError('');
    try {
      await api.post('/blocks', {
        noteId: Number(id),
        type,
        content: type === 'checklist' ? { text: '', checked: false } : '',
        orderIndex: blocks.length || 0,
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

  // AUTOSAVE
  const debouncedAutosave = useDebouncedCallback(async (block, value) => {
    setAutosaveLoading(true);
    try {
      let content;
      if (block.type === 'checklist') {
        content = value;
      } else {
        content = value;
      }
      await api.put(`/blocks/${block.id}`, { content });
      // Tidak perlu fetchNote, update state lokal saja jika ingin lebih smooth
    } catch (err) {
      // Bisa tampilkan error autosave jika ingin
    } finally {
      setAutosaveLoading(false);
    }
  }, 600, [editBlockId, editValue, editChecklist]);

  const handleEditChange = (block, value) => {
    if (block.type === 'checklist') {
      setEditChecklist(value);
      debouncedAutosave(block, value);
    } else {
      setEditValue(value);
      debouncedAutosave(block, value);
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

  // dnd-kit setup
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex(b => b.id === active.id);
    const newIndex = blocks.findIndex(b => b.id === over.id);
    const newBlocks = arrayMove(blocks, oldIndex, newIndex).map((b, idx) => ({ ...b, orderIndex: idx }));
    setBlocks(newBlocks);
    setReorderLoading(true);
    try {
      await api.patch('/blocks/reorder', {
        blocks: newBlocks.map(b => ({ id: b.id, orderIndex: b.orderIndex }))
      });
      fetchNote();
    } catch {
      alert('Gagal update urutan blok');
    } finally {
      setReorderLoading(false);
    }
  };

  const handleTitleEdit = () => {
    setEditTitle(true);
    setTitleError('');
  };

  const handleTitleSave = async () => {
    if (!titleValue.trim()) {
      setTitleError('Judul wajib diisi');
      return;
    }
    setTitleLoading(true);
    setTitleError('');
    try {
      await api.put(`/notes/${id}`, { title: titleValue });
      setEditTitle(false);
      fetchNote();
    } catch {
      setTitleError('Gagal update judul');
    } finally {
      setTitleLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: '#dc2626' }}>{error}</div>}
      {note && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            {editTitle ? (
              <>
                <input
                  type="text"
                  value={titleValue}
                  onChange={e => setTitleValue(e.target.value)}
                  style={{ fontSize: 22, fontWeight: 600, padding: 6, borderRadius: 4, border: '1px solid #bbb', minWidth: 200 }}
                  disabled={titleLoading}
                />
                <button onClick={handleTitleSave} disabled={titleLoading} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 500 }}>
                  Simpan
                </button>
                <button onClick={() => setEditTitle(false)} style={{ border: '1px solid #bbb', borderRadius: 4, padding: '6px 16px', background: '#f3f4f6', cursor: 'pointer' }}>
                  Batal
                </button>
                {titleError && <span style={{ color: '#dc2626', marginLeft: 8 }}>{titleError}</span>}
              </>
            ) : (
              <>
                <h2 style={{ margin: 0 }}>{note.title}</h2>
                <button onClick={handleTitleEdit} style={{ fontSize: 14, padding: '4px 12px', borderRadius: 4, border: '1px solid #bbb', background: '#f3f4f6', cursor: 'pointer' }}>
                  Edit
                </button>
              </>
            )}
          </div>
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
          {reorderLoading && <div style={{ color: '#2563eb' }}>Menyimpan urutan blok...</div>}
          {autosaveLoading && <div style={{ color: '#2563eb' }}>Menyimpan perubahan blok...</div>}
          {blocks.length === 0 && <div>Belum ada blok.</div>}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {blocks.map(block => (
                  <SortableBlock key={block.id} block={block}>
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
                            onChange={e => handleEditChange(block, e.target.value)}
                            rows={3}
                            style={{ width: '100%', fontSize: 15, padding: 6 }}
                          />
                        )}
                        {block.type === 'code' && (
                          <textarea
                            value={editValue}
                            onChange={e => handleEditChange(block, e.target.value)}
                            rows={4}
                            style={{ width: '100%', fontFamily: 'monospace', fontSize: 15, padding: 6, background: '#f3f4f6' }}
                          />
                        )}
                        {block.type === 'image' && (
                          <input
                            type="url"
                            value={editValue}
                            onChange={e => handleEditChange(block, e.target.value)}
                            placeholder="URL gambar"
                            style={{ width: '100%', fontSize: 15, padding: 6 }}
                          />
                        )}
                        {block.type === 'checklist' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="checkbox"
                              checked={editChecklist.checked}
                              onChange={e => handleEditChange(block, { ...editChecklist, checked: e.target.checked })}
                            />
                            <input
                              type="text"
                              value={editChecklist.text}
                              onChange={e => handleEditChange(block, { ...editChecklist, text: e.target.value })}
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
                  </SortableBlock>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
} 