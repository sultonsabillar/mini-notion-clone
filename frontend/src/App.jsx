import './App.css';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import NotesList from './pages/NotesList';
import NoteEditor from './pages/NoteEditor';
import ProtectedRoute from './components/ProtectedRoute';
import { isLoggedIn, setLogout } from './utils/auth';

function NavBar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    setLogout();
    // (opsional) panggil endpoint logout ke backend
    navigate('/login');
  };
  return (
    <nav style={{ display: 'flex', gap: 16, justifyContent: 'center', margin: 24 }}>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
      <Link to="/notes">Catatan</Link>
      {isLoggedIn() && <button onClick={handleLogout} style={{ marginLeft: 16 }}>Logout</button>}
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/notes" element={
          <ProtectedRoute>
            <NotesList />
          </ProtectedRoute>
        } />
        <Route path="/notes/:id" element={
          <ProtectedRoute>
            <NoteEditor />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
