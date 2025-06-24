import './App.css';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import NotesList from './pages/NotesList';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ display: 'flex', gap: 16, justifyContent: 'center', margin: 24 }}>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/notes">Catatan</Link>
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/notes" element={<NotesList />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
