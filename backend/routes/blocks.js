const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../utils/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Create block
router.post('/', authenticate, async (req, res) => {
  const { noteId, parentId, type, content, orderIndex } = req.body;
  if (!noteId || !type) return res.status(400).json({ message: 'noteId & type required' });
  const block = await prisma.block.create({
    data: { noteId, parentId, type, content, orderIndex },
  });
  res.status(201).json(block);
});

// Update block
router.put('/:id', authenticate, async (req, res) => {
  const { content, orderIndex, parentId } = req.body;
  const block = await prisma.block.findUnique({ where: { id: Number(req.params.id) } });
  if (!block) return res.status(404).json({ message: 'Block not found' });
  // Pastikan user hanya bisa edit block milik notenya sendiri
  const note = await prisma.note.findUnique({ where: { id: block.noteId } });
  if (!note || note.userId !== req.userId) return res.status(403).json({ message: 'Forbidden' });
  const updated = await prisma.block.update({
    where: { id: block.id },
    data: { content, orderIndex, parentId },
  });
  res.json(updated);
});

// Delete block
router.delete('/:id', authenticate, async (req, res) => {
  const block = await prisma.block.findUnique({ where: { id: Number(req.params.id) } });
  if (!block) return res.status(404).json({ message: 'Block not found' });
  const note = await prisma.note.findUnique({ where: { id: block.noteId } });
  if (!note || note.userId !== req.userId) return res.status(403).json({ message: 'Forbidden' });
  await prisma.block.delete({ where: { id: block.id } });
  res.json({ message: 'Deleted' });
});

// Reorder blocks
router.patch('/reorder', authenticate, async (req, res) => {
  const { blocks } = req.body; // array of { id, orderIndex }
  if (!Array.isArray(blocks)) return res.status(400).json({ message: 'blocks array required' });
  const updates = await Promise.all(blocks.map(async ({ id, orderIndex }) => {
    return prisma.block.update({ where: { id }, data: { orderIndex } });
  }));
  res.json({ message: 'Reordered', updates });
});

module.exports = router; 