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
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';

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

  return (
    <Box maxW="700px" mx="auto" mt="40px" p="8" bg="white" borderRadius="lg" boxShadow="md">
      {loading && <Flex justify="center" my={6}><CircularProgress /></Flex>}
      {error && <Alert severity="error" mb={4}><AlertIcon />{error}</Alert>}
      {note && (
        <>
          <Flex align="center" gap={3} mb={2}>
            {editTitle ? (
              <>
                <TextField
                  type="text"
                  value={titleValue}
                  onChange={e => setTitleValue(e.target.value)}
                  fontSize={22}
                  fontWeight={600}
                  bg="gray.50"
                  disabled={titleLoading}
                />
                <Button colorScheme="blue" onClick={handleTitleSave} isLoading={titleLoading}>Simpan</Button>
                <Button onClick={() => setEditTitle(false)}>Batal</Button>
                {titleError && <Typography color="red.500">{titleError}</Typography>}
              </>
            ) : (
              <>
                <Typography size="md" m={0}>{note.title}</Typography>
                <Button size="sm" onClick={handleTitleEdit}>Edit</Button>
              </>
            )}
          </Flex>
          <Box mb={4}>
            <Button onClick={() => setShowAddBlock(v => !v)} colorScheme="blue">Tambah Blok</Button>
            {showAddBlock && (
              <Flex mt={2} gap={2}>
                {BLOCK_TYPES.map(opt => (
                  <Button key={opt.type} size="sm" onClick={() => handleAddBlock(opt.type)} isLoading={addBlockLoading} variant="outline">
                    {opt.label}
                  </Button>
                ))}
              </Flex>
            )}
            {addBlockError && <Alert severity="error" mt={2}><AlertIcon />{addBlockError}</Alert>}
          </Box>
          <Typography size="sm" mb={2}>Blok Catatan:</Typography>
          {reorderLoading && <Typography color="blue.600">Menyimpan urutan blok...</Typography>}
          {autosaveLoading && <Typography color="blue.600">Menyimpan perubahan blok...</Typography>}
          {blocks.length === 0 && <Typography color="gray.500">Belum ada blok.</Typography>}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <Stack as="ul" spacing={2} align="stretch">
                {blocks.map(block => (
                  <SortableBlock key={block.id} block={block}>
                    <Flex align="center" gap={2} mb={2}>
                      <Typography fontWeight="bold">{block.type}</Typography>
                      <Button size="xs" onClick={() => handleEdit(block)} variant="outline">Edit</Button>
                      <Button size="xs" colorScheme="red" onClick={() => handleDelete(block.id)} isLoading={deleteLoading === block.id}>Hapus</Button>
                    </Flex>
                    {editBlockId === block.id ? (
                      <Box mt={2}>
                        {block.type === 'text' && (
                          <TextField
                            as="textarea"
                            value={editValue}
                            onChange={e => handleEditChange(block, e.target.value)}
                            rows={3}
                            fontSize={15}
                            bg="gray.50"
                          />
                        )}
                        {block.type === 'code' && (
                          <TextField
                            as="textarea"
                            value={editValue}
                            onChange={e => handleEditChange(block, e.target.value)}
                            rows={4}
                            fontFamily="monospace"
                            fontSize={15}
                            bg="gray.100"
                          />
                        )}
                        {block.type === 'image' && (
                          <Box>
                            <TextField
                              type="file"
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={e => {
                                if (e.target.files && e.target.files[0]) {
                                  handleImageUpload(block, e.target.files[0]);
                                }
                              }}
                              mb={2}
                              isDisabled={uploadingImage}
                            />
                            {uploadingImage && <Typography color="blue.500">Mengupload gambar...</Typography>}
                            {uploadError && <Typography color="red.500">{uploadError}</Typography>}
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
                              placeholder="URL gambar"
                              fontSize={15}
                              bg="gray.50"
                              mt={1}
                            />
                          </Box>
                        )}
                        {block.type === 'checklist' && (
                          <Flex align="center" gap={2}>
                            <TextField
                              type="checkbox"
                              checked={editChecklist.checked}
                              onChange={e => handleEditChange(block, { ...editChecklist, checked: e.target.checked })}
                              width={5}
                            />
                            <TextField
                              type="text"
                              value={editChecklist.text}
                              onChange={e => handleEditChange(block, { ...editChecklist, text: e.target.value })}
                              placeholder="Teks checklist"
                              fontSize={15}
                              bg="gray.50"
                            />
                          </Flex>
                        )}
                        {editError && <Typography color="red.500" mt={1}>{editError}</Typography>}
                        <Flex mt={2} gap={2}>
                          <Button colorScheme="blue" onClick={() => handleEditSubmit(block)}>Simpan</Button>
                          <Button onClick={() => setEditBlockId(null)}>Batal</Button>
                        </Flex>
                      </Box>
                    ) : (
                      <Box mt={2}>
                        {block.type === 'text' && <Typography>{block.content}</Typography>}
                        {block.type === 'code' && (
                          <Box as="pre" bg="gray.100" p={2} borderRadius="md" fontFamily="monospace" fontSize={15}>
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
                          <Flex align="center" gap={2}>
                            <TextField type="checkbox" checked={!!block.content.checked} readOnly width={5} />
                            <Typography>{block.content.text}</Typography>
                          </Flex>
                        )}
                      </Box>
                    )}
                  </SortableBlock>
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        </>
      )}
    </Box>
  );
} 