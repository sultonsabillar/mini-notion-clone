const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads selalu ada
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const blocksRoutes = require('./routes/blocks');
const uploadRouter = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:5173', // ganti sesuai frontend
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/blocks', blocksRoutes);
app.use('/api/upload', uploadRouter);

app.get('/', (req, res) => {
  res.send('Mini Notion Clone Backend Running!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 