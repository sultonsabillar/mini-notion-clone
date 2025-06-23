const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../utils/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// List notes milik user
router.get('/', authenticate, async (req, res) => {
  const notes = await prisma.note.findMany({
    where: { userId: req.userId },
    orderBy: { updatedAt: 'desc' },
  });
  res.json(notes);
});

// Get single note
router.get('/:id', authenticate, async (req, res) => {
  const note = await prisma.note.findUnique({
    where: { id: Number(req.params.id) },
    include: { blocks: true },
  });
  if (!note || note.userId !== req.userId) return res.status(404).json({ message: 'Not found' });
  res.json(note);
});

// Create note
router.post('/', authenticate, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: 'Title required' });
  const note = await prisma.note.create({
    data: { title, userId: req.userId },
  });
  res.status(201).json(note);
});

// Update note
router.put('/:id', authenticate, async (req, res) => {
  const { title } = req.body;
  const note = await prisma.note.findUnique({ where: { id: Number(req.params.id) } });
  if (!note || note.userId !== req.userId) return res.status(404).json({ message: 'Not found' });
  const updated = await prisma.note.update({
    where: { id: note.id },
    data: { title },
  });
  res.json(updated);
});

// Delete note
router.delete('/:id', authenticate, async (req, res) => {
  const note = await prisma.note.findUnique({ where: { id: Number(req.params.id) } });
  if (!note || note.userId !== req.userId) return res.status(404).json({ message: 'Not found' });
  await prisma.note.delete({ where: { id: note.id } });
  res.json({ message: 'Deleted' });
});

module.exports = router; 