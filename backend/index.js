const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const blocksRoutes = require('./routes/blocks');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:5173', // ganti sesuai frontend
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/blocks', blocksRoutes);

app.get('/', (req, res) => {
  res.send('Mini Notion Clone Backend Running!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 