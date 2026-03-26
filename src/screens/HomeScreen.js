import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, Alert, TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getNotes, saveNotes } from '../storage/noteStorage';
import NoteCard from '../components/NoteCard';
import { colors } from '../theme/colors';

export default function HomeScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      getNotes().then(setNotes);
    }, [])
  );

  const deleteNote = (id) => {
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const updated = notes.filter(n => n.id !== id);
          await saveNotes(updated);
          setNotes(updated);
        }
      }
    ]);
  };

  const filtered = notes.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📝 My Notes</Text>

      <TextInput
        style={styles.search}
        placeholder="Search notes..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor={colors.subtext}
      />

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No notes yet. Tap + to create one!</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <NoteCard
              note={item}
              index={index}
              onPress={() => navigation.navigate('NoteEditor', { note: item })}
              onLongPress={() => deleteNote(item.id)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NoteEditor', { note: null })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16, paddingTop: 52 },
  heading: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 14 },
  search: {
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 10, fontSize: 14, marginBottom: 16,
    borderWidth: 1, borderColor: colors.border, color: colors.text,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.subtext, fontSize: 15 },
  fab: {
    position: 'absolute', bottom: 28, right: 24,
    backgroundColor: colors.primary, width: 58, height: 58,
    borderRadius: 29, justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: '#000', shadowOpacity: 0.2,
    shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  fabText: { fontSize: 32, color: '#1A1A1A', lineHeight: 36 },
});