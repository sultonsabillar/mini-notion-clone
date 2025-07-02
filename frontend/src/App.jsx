import './App.css';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import NotesList from './pages/NotesList';
import NoteEditor from './pages/NoteEditor';
import ProtectedRoute from './components/ProtectedRoute';
import { isLoggedIn, setLogout } from './utils/auth';
import api from './utils/api';
import { Box, Button, Container, Stack } from '@mui/material';

function NavBar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    setLogout();
    navigate('/login');
  };
  return (
    <Stack direction="row" component="nav" spacing={4} justifyContent="center" my={6}>
      {!loggedIn && (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
      {loggedIn && (
        <>
          <Link to="/notes">Catatan</Link>
          <Button color="error" size="small" sx={{ ml: 2 }} onClick={handleLogout} variant="contained">
            Logout
          </Button>
        </>
      )}
    </Stack>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Container maxWidth="md" sx={{ minHeight: '100vh', py: 8 }}>
        <NavBar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/notes" element={<ProtectedRoute><NotesList /></ProtectedRoute>} />
          <Route path="/notes/:id" element={<ProtectedRoute><NoteEditor /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/notes" />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
