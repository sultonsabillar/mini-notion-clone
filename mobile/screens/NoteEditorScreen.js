import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';

export default function NoteEditorScreen({ noteId, goBack }) {
  const [note, setNote] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBlockContent, setNewBlockContent] = useState('');

  useEffect(() => {
    fetchNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  const fetchNote = async () => {
    try {
      const response = await api.get(`/notes/${noteId}`);
      setNote(response.data);
      setBlocks(response.data.blocks || []);
    } catch (err) {
      Alert.alert('Error', 'Gagal memuat catatan');
      goBack();
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!note) return;
    
    setSaving(true);
    try {
      await api.patch(`/notes/${noteId}`, {
        title: note.title,
        blocks: blocks
      });
      Alert.alert('Sukses', 'Catatan berhasil disimpan');
    } catch (err) {
      Alert.alert('Error', 'Gagal menyimpan catatan');
    } finally {
      setSaving(false);
    }
  };

  const addBlock = async () => {
    if (!newBlockContent.trim()) return;

    const newBlock = {
      type: 'text',
      content: newBlockContent.trim(),
      orderIndex: blocks.length
    };

    try {
      const response = await api.post(`/notes/${noteId}/blocks`, newBlock);
      setBlocks([...blocks, response.data]);
      setNewBlockContent('');
    } catch (err) {
      Alert.alert('Error', 'Gagal menambah blok');
    }
  };

  const updateBlock = async (blockId, content) => {
    try {
      await api.patch(`/notes/${noteId}/blocks/${blockId}`, { content });
    } catch (err) {
      Alert.alert('Error', 'Gagal mengupdate blok');
    }
  };

  const deleteBlock = async (blockId) => {
    Alert.alert(
      'Hapus Blok',
      'Apakah kamu yakin ingin menghapus blok ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/notes/${noteId}/blocks/${blockId}`);
              setBlocks(blocks.filter(block => block.id !== blockId));
            } catch (err) {
              Alert.alert('Error', 'Gagal menghapus blok');
            }
          }
        }
      ]
    );
  };

  const toggleChecklist = async (blockId, checked) => {
    try {
      await api.patch(`/notes/${noteId}/blocks/${blockId}`, { 
        type: 'checklist',
        content: blocks.find(b => b.id === blockId)?.content || '',
        checked 
      });
      setBlocks(blocks.map(block => 
        block.id === blockId 
          ? { ...block, type: 'checklist', checked }
          : block
      ));
    } catch (err) {
      Alert.alert('Error', 'Gagal mengupdate checklist');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#222" />
        <Text style={styles.loadingText}>Memuat catatan...</Text>
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Catatan tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#e5e7eb', '#fafafa']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={goBack}
          >
            <Ionicons name="arrow-back" size={24} color="#666" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle} numberOfLines={1}>
            {note.title}
          </Text>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveNote}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView style={styles.content}>
            <View style={styles.blocksContainer}>
              {blocks.map((block, index) => (
                <View key={block.id} style={styles.blockItem}>
                  {block.type === 'checklist' ? (
                    <View style={styles.checklistItem}>
                      <TouchableOpacity
                        style={styles.checkbox}
                        onPress={() => toggleChecklist(block.id, !block.checked)}
                      >
                        <Ionicons
                          name={block.checked ? "checkbox" : "square-outline"}
                          size={20}
                          color={block.checked ? "#222" : "#666"}
                        />
                      </TouchableOpacity>
                      <TextInput
                        style={[
                          styles.checklistText,
                          block.checked && styles.checkedText
                        ]}
                        value={block.content}
                        onChangeText={(text) => {
                          const updatedBlocks = [...blocks];
                          updatedBlocks[index].content = text;
                          setBlocks(updatedBlocks);
                          updateBlock(block.id, text);
                        }}
                        multiline
                        placeholder="Checklist item"
                      />
                    </View>
                  ) : (
                    <TextInput
                      style={styles.textBlock}
                      value={block.content}
                      onChangeText={(text) => {
                        const updatedBlocks = [...blocks];
                        updatedBlocks[index].content = text;
                        setBlocks(updatedBlocks);
                        updateBlock(block.id, text);
                      }}
                      multiline
                      placeholder="Tulis teks..."
                    />
                  )}
                  
                  <View style={styles.blockActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => toggleChecklist(block.id, !block.checked)}
                    >
                      <Ionicons name="checkbox-outline" size={18} color="#666" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => deleteBlock(block.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <View style={styles.addBlockContainer}>
                <TextInput
                  style={styles.addBlockInput}
                  placeholder="Tambah blok baru..."
                  value={newBlockContent}
                  onChangeText={setNewBlockContent}
                  onSubmitEditing={addBlock}
                  multiline
                />
                <TouchableOpacity
                  style={styles.addBlockButton}
                  onPress={addBlock}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  blocksContainer: {
    paddingVertical: 16,
  },
  blockItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    padding: 4,
  },
  checklistText: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    lineHeight: 24,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  textBlock: {
    fontSize: 16,
    color: '#222',
    lineHeight: 24,
    minHeight: 24,
  },
  blockActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  addBlockContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  addBlockInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  addBlockButton: {
    backgroundColor: '#222',
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 