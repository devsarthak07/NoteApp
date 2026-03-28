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

  const filtered = notes.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase())
  );

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
          renderItem={({ item, index }) => (
            <NoteCard
              note={item}
              index={index}
              isDark={isDark}
              onPress={() => navigation.navigate('NoteEditor', { note: item, isDark })}
              onLongPress={() => deleteNote(item.id)}
            />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heading: { fontSize: 28, fontWeight: '800' },
  darkModeRow: { flexDirection: 'row', alignItems: 'center' },
  search: {
    borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 10, fontSize: 14, marginBottom: 16,
    borderWidth: 1,
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