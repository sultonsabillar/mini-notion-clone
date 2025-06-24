import './App.css';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import NotesList from './pages/NotesList';
import NoteEditor from './pages/NoteEditor';
import ProtectedRoute from './components/ProtectedRoute';
import { isLoggedIn, setLogout } from './utils/auth';
import api from './utils/api';
import { Box, Button, Flex, Container } from '@chakra-ui/react';

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
    <Flex as="nav" gap={4} justify="center" my={6}>
      {!loggedIn && (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
      {loggedIn && (
        <>
          <Link to="/notes">Catatan</Link>
          <Button colorScheme="red" size="sm" ml={4} onClick={handleLogout}>
            Logout
          </Button>
        </>
      )}
    </Flex>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Container maxW="container.md" minH="100vh" py={8}>
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
