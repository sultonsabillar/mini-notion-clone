import './App.css';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import NotesList from './pages/NotesList';
import NoteEditor from './pages/NoteEditor';
import ProtectedRoute from './components/ProtectedRoute';
import { isLoggedIn, setLogout } from './utils/auth';
import api from './utils/api';
import { Box, Button, Stack, Container, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

function NavBar({ bottom }) {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    setLogout();
    navigate('/login');
  };
  if (bottom && loggedIn) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Tooltip title="Logout">
          <IconButton
            onClick={handleLogout}
            sx={{
              bgcolor: '#f5f5f5',
              color: '#444',
              borderRadius: '50%',
              width: 44,
              height: 44,
              boxShadow: 1,
              '&:hover': { bgcolor: '#e0e0e0', color: '#111' },
            }}
          >
            <LogoutIcon sx={{ fontSize: 26 }} />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }
  return null;
}

function AppRoutes() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(120deg, #e5e7eb 0%, #fafafa 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      <Container maxWidth="sm" disableGutters sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        zIndex: 1,
      }}>
        <Routes>
          <Route path="/login" element={
            <Login NavBar={<NavBar />} />
          } />
          <Route path="/register" element={
            <Register NavBar={<NavBar />} />
          } />
          <Route path="/notes" element={<ProtectedRoute><NotesList NavBarBottom={<NavBar bottom />} /></ProtectedRoute>} />
          <Route path="/notes/:id" element={<ProtectedRoute><NoteEditor NavBarBottom={<NavBar bottom />} /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/notes" />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
