import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, Alert, TextInput, Switch
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getNotes, saveNotes } from '../storage/noteStorage';
import NoteCard from '../components/NoteCard';
import { lightColors, darkColors } from '../theme/colors';

export default function HomeScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [isDark, setIsDark] = useState(false);

  const colors = isDark ? darkColors : lightColors;

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

  const pinNote = async (id) => {
    const updated = notes.map(n =>
      n.id === id ? { ...n, pinned: !n.pinned } : n
    );
    await saveNotes(updated);
    setNotes(updated);
  };

  const showNoteOptions = (note) => {
    Alert.alert(
      note.title || 'Untitled',
      'What do you want to do?',
      [
        {
          text: note.pinned ? '📌 Unpin' : '📌 Pin',
          onPress: () => pinNote(note.id)
        },
        {
          text: '🗑️ Delete',
          style: 'destructive',
          onPress: () => deleteNote(note.id)
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const filtered = notes
    .filter(n =>
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const pinnedNotes = filtered.filter(n => n.pinned);
  const unpinnedNotes = filtered.filter(n => !n.pinned);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: colors.text }]}>📝 My Notes</Text>
        <View style={styles.darkModeRow}>
          <Text style={{ color: colors.subtext, marginRight: 6 }}>
            {isDark ? '🌙' : '🌞'}
          </Text>
          <Switch
            value={isDark}
            onValueChange={setIsDark}
            trackColor={{ false: '#E0E0E0', true: '#444' }}
            thumbColor={colors.primary}
          />
        </View>
      </View>

      {/* Search */}
      <TextInput
        style={[styles.search, {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.text,
        }]}
        placeholder="Search notes..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor={colors.subtext}
      />

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>📝</Text>
          <Text style={[styles.emptyText, { color: colors.subtext }]}>
            No notes yet. Tap + to create one!
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          ListHeaderComponent={() => (
            <>
              {/* Pinned Section */}
              {pinnedNotes.length > 0 && (
                <Text style={[styles.sectionLabel, { color: colors.subtext }]}>
                  📌 PINNED
                </Text>
              )}
            </>
          )}
          renderItem={({ item, index }) => (
            <>
              {/* Unpinned label */}
              {item.id === unpinnedNotes[0]?.id && pinnedNotes.length > 0 && (
                <Text style={[styles.sectionLabel, { color: colors.subtext }]}>
                  📝 OTHERS
                </Text>
              )}
              <NoteCard
                note={item}
                index={index}
                isDark={isDark}
                onPress={() => navigation.navigate('NoteEditor', { note: item, isDark })}
                onLongPress={() => showNoteOptions(item)}
              />
            </>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('NoteEditor', { note: null, isDark })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 52 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  heading: { fontSize: 28, fontWeight: '800' },
  darkModeRow: { flexDirection: 'row', alignItems: 'center' },
  search: {
    borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 10, fontSize: 14, marginBottom: 16,
    borderWidth: 1,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700',
    letterSpacing: 1, marginBottom: 8, marginTop: 4,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 15, textAlign: 'center' },
  fab: {
    position: 'absolute', bottom: 28, right: 24,
    width: 58, height: 58, borderRadius: 29,
    justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: '#000', shadowOpacity: 0.2,
    shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  fabText: { fontSize: 32, color: '#1A1A1A', lineHeight: 36 },
});
