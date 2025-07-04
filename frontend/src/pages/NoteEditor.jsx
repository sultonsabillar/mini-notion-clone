import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  IconButton,
  Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CodeIcon from '@mui/icons-material/Code';
import ImageIcon from '@mui/icons-material/Image';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const BLOCK_TYPES = [
  { type: 'text', label: 'Text' },
  { type: 'checklist', label: 'Checklist' },
  { type: 'image', label: 'Image' },
  { type: 'code', label: 'Code' },
];

const BACKEND_URL = 'http://localhost:4000'; // ganti jika backend beda host/port

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
    <Paper ref={setNodeRef} {...attributes} {...listeners} sx={{ mb: 2, p: 2, borderRadius: 2, ...style }}>
      {children}
    </Paper>
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
  const fileInputRef = useRef();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [localImage, setLocalImage] = useState(null);
  const navigate = useNavigate();

  const fetchNote = () => {
    setLoading(true);
    api.get(`/notes/${id}`)
      .then(res => {
        setNote(res.data);
        const blocksArr = Array.isArray(res.data.blocks) ? res.data.blocks : [];
        setBlocks(blocksArr.sort((a, b) => a.orderIndex - b.orderIndex));
        setError('');
        console.log('NoteEditor fetchNote success', { note: res.data, blocks: blocksArr });
      })
      .catch((err) => {
        setError('Gagal mengambil detail catatan');
        console.error('NoteEditor fetchNote error', err);
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

  const handleImageUpload = async (block, file) => {
    setUploadingImage(true);
    setUploadError('');
    setLocalImage(URL.createObjectURL(file));
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditValue(res.data.url);
      setLocalImage(null);
      debouncedAutosave(block, res.data.url);
    } catch (err) {
      setUploadError('Gagal upload gambar');
      setLocalImage(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // Log render
  console.log('NoteEditor render', { note, loading, error, blocks });

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', py: 6 }}>
      <Paper elevation={4} sx={{ width: '100%', maxWidth: 700, p: { xs: 2, sm: 4 }, borderRadius: 4, background: '#fff', boxShadow: '0 8px 32px rgba(30,41,59,0.10)', height: '80vh', display: 'flex', flexDirection: 'column' }}>
        {/* Sticky header judul, toolbar, dan Blok Catatan */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 2, background: '#fff', pb: 1, boxShadow: '0 2px 8px rgba(30,41,59,0.04)' }}>
          <Box sx={{ position: 'absolute', left: 12, top: 12 }}>
            <IconButton onClick={() => navigate('/notes')} sx={{ bgcolor: '#f5f5f5', color: '#222', '&:hover': { bgcolor: '#e0e0e0' } }}>
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box mb={2}>
            <Typography variant="h4" fontWeight={800} align="center" sx={{ fontFamily: 'Inter, Roboto, Arial, sans-serif', mb: 0 }}>
              {note?.title}
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Box mb={3}>
            <IconButton onClick={() => setShowAddBlock(v => !v)} color="primary" sx={{ bgcolor: '#222', color: '#fff', borderRadius: 2, boxShadow: 1, '&:hover': { bgcolor: '#111' }, mb: 1 }}>
              <AddIcon />
            </IconButton>
            {showAddBlock && (
              <Box display="flex" mt={1} gap={1}>
                <IconButton onClick={() => handleAddBlock('text')} disabled={addBlockLoading} sx={{ bgcolor: '#f5f5f5', color: '#222' }}><TextFieldsIcon /></IconButton>
                <IconButton onClick={() => handleAddBlock('image')} disabled={addBlockLoading} sx={{ bgcolor: '#f5f5f5', color: '#222' }}><ImageIcon /></IconButton>
                <IconButton onClick={() => handleAddBlock('checklist')} disabled={addBlockLoading} sx={{ bgcolor: '#f5f5f5', color: '#222' }}><CheckBoxIcon /></IconButton>
                <IconButton onClick={() => handleAddBlock('code')} disabled={addBlockLoading} sx={{ bgcolor: '#f5f5f5', color: '#222' }}><CodeIcon /></IconButton>
              </Box>
            )}
          </Box>
          <Box sx={{ background: '#fff', pt: 1, pb: 1 }}>
            <Typography sx={{ fontSize: 15, color: '#444', fontWeight: 600 }}>Blok Catatan:</Typography>
          </Box>
        </Box>
        {/* Konten blok scrollable */}
        <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
          {reorderLoading && <Typography color="primary.main">Menyimpan urutan blok...</Typography>}
          {autosaveLoading && <Typography color="primary.main">Menyimpan perubahan blok...</Typography>}
          {blocks.length === 0 && <Typography color="text.secondary">Belum ada blok.</Typography>}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <Stack as="ul" spacing={2} align="stretch">
                {blocks.map(block => (
                  <SortableBlock key={block.id} block={block}>
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 3, mb: 1, background: '#fafbfc', boxShadow: '0 1px 4px 0 rgba(60,60,60,0.04)' }}>
                      <Box display="flex" alignItems="center" gap={2} mb={1} justifyContent="space-between">
                        <Typography fontWeight="bold" sx={{ textTransform: 'capitalize', color: '#222' }}>{block.type}</Typography>
                        <Box display="flex" gap={1}>
                          <IconButton size="small" onClick={() => handleEdit(block)} sx={{ color: '#444' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(block.id)} disabled={deleteLoading === block.id} sx={{ color: '#d32f2f' }}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      {editBlockId === block.id ? (
                        <Box mt={2}>
                          {block.type === 'text' && (
                            <TextField
                              multiline
                              value={editValue}
                              onChange={e => handleEditChange(block, e.target.value)}
                              rows={3}
                              sx={{ fontSize: 15, background: '#fff', borderRadius: 2, textAlign: 'left' }}
                              fullWidth
                              placeholder="Tulis catatan..."
                            />
                          )}
                          {block.type === 'code' && (
                            <TextField
                              multiline
                              value={editValue}
                              onChange={e => handleEditChange(block, e.target.value)}
                              rows={4}
                              sx={{ fontFamily: 'monospace', fontSize: 15, background: '#f5f5f5', borderRadius: 2 }}
                              fullWidth
                              placeholder="Tulis kode..."
                            />
                          )}
                          {block.type === 'image' && (
                            <Box>
                              <TextField
                                type="file"
                                accept="image/*"
                                inputRef={fileInputRef}
                                onChange={e => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleImageUpload(block, e.target.files[0]);
                                  }
                                }}
                                sx={{ mb: 2 }}
                                disabled={uploadingImage}
                                fullWidth
                              />
                              {uploadingImage && <Typography color="primary.main">Mengupload gambar...</Typography>}
                              {uploadError && <Typography color="error.main">{uploadError}</Typography>}
                              {(localImage || editValue) && (
                                <Box mb={2}>
                                  <img
                                    src={
                                      localImage ||
                                      (editValue &&
                                        (editValue.startsWith('http://') || editValue.startsWith('https://')
                                          ? editValue
                                          : BACKEND_URL + editValue)
                                      )
                                    }
                                    alt="preview"
                                    style={{ maxWidth: 220, maxHeight: 120, borderRadius: 6, border: '1px solid #ddd' }}
                                  />
                                </Box>
                              )}
                              <TextField
                                type="url"
                                value={editValue}
                                onChange={e => {
                                  setEditValue(e.target.value);
                                  setLocalImage(null);
                                  handleEditChange(block, e.target.value);
                                }}
                                placeholder="URL gambar..."
                                sx={{ fontSize: 15, background: '#f5f5f5', mt: 1, borderRadius: 2 }}
                                fullWidth
                              />
                            </Box>
                          )}
                          {block.type === 'checklist' && (
                            <Box display="flex" alignItems="center" gap={2}>
                              <Checkbox
                                checked={editChecklist.checked}
                                onChange={e => handleEditChange(block, { ...editChecklist, checked: e.target.checked })}
                                sx={{ p: 0, mr: 1 }}
                              />
                              <TextField
                                value={editChecklist.text}
                                onChange={e => handleEditChange(block, { ...editChecklist, text: e.target.value })}
                                placeholder="Tulis checklist..."
                                sx={{ fontSize: 15, background: '#f5f5f5', borderRadius: 2 }}
                                fullWidth
                              />
                            </Box>
                          )}
                          {editError && <Typography color="error.main" mt={1}>{editError}</Typography>}
                          <Box display="flex" mt={2} gap={2}>
                            <IconButton color="primary" onClick={() => handleEditSubmit(block)} sx={{ bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}>
                              <CheckIcon />
                            </IconButton>
                            <IconButton onClick={() => setEditBlockId(null)} sx={{ bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }}>
                              <CloseIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      ) : (
                        <Box mt={2}>
                          {block.type === 'text' && <Typography sx={{ whiteSpace: 'pre-line', textAlign: 'left' }}>{block.content}</Typography>}
                          {block.type === 'code' && (
                            <Box component="pre" sx={{ background: '#f5f5f5', p: 2, borderRadius: 2, fontFamily: 'monospace', fontSize: 15, overflowX: 'auto' }}>
                              {block.content}
                            </Box>
                          )}
                          {block.type === 'image' && block.content && (
                            <Box>
                              <img
                                src={
                                  block.content.startsWith('http://') || block.content.startsWith('https://')
                                    ? block.content
                                    : BACKEND_URL + block.content
                                }
                                alt="img"
                                style={{ maxWidth: 320, maxHeight: 180, borderRadius: 6, border: '1px solid #ddd' }}
                              />
                            </Box>
                          )}
                          {block.type === 'checklist' && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Checkbox checked={!!block.content.checked} disabled sx={{ p: 0, mr: 1 }} />
                              <Typography sx={{ textDecoration: block.content.checked ? 'line-through' : 'none', color: block.content.checked ? '#888' : '#222', fontSize: 16 }}>
                                {block.content.text}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Paper>
                  </SortableBlock>
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        </Box>
      </Paper>
    </Box>
  );
} 