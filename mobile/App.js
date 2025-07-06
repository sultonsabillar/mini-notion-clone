import React, { useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import NotesListScreen from './screens/NotesListScreen';
import NoteEditorScreen from './screens/NoteEditorScreen';
import 'react-native-url-polyfill/auto';

export default function App() {
  const [page, setPage] = useState('login');
  const [noteId, setNoteId] = useState(null);

  if (page === 'login') {
    return <LoginScreen goToRegister={() => setPage('register')} goToNotes={() => setPage('notes')} />;
  }
  if (page === 'register') {
    return <RegisterScreen goToLogin={() => setPage('login')} />;
  }
  if (page === 'notes') {
    return <NotesListScreen goToEditor={id => { setNoteId(id); setPage('editor'); }} goToLogin={() => setPage('login')} />;
  }
  if (page === 'editor') {
    return <NoteEditorScreen noteId={noteId} goBack={() => setPage('notes')} />;
  }
  return null;
} 