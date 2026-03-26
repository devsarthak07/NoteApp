import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export default function NoteCard({ note, onPress, onLongPress, index }) {
  const cardColor = colors.card[index % colors.card.length];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardColor }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
    >
      <Text style={styles.title} numberOfLines={1}>
        {note.title || 'Untitled'}
      </Text>
      {note.checklist?.length > 0 && (
        <Text style={styles.meta}>
          ✅ {note.checklist.filter(i => i.checked).length}/{note.checklist.length} tasks
        </Text>
      )}
      {note.content ? (
        <Text style={styles.preview} numberOfLines={2}>{note.content}</Text>
      ) : null}
      {note.voiceUri && <Text style={styles.meta}>🎤 Voice attached</Text>}
      {note.images?.length > 0 && (
        <Text style={styles.meta}>🖼️ {note.images.length} image(s)</Text>
      )}
      <Text style={styles.date}>
        {new Date(note.updatedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  preview: { fontSize: 13, color: colors.subtext, marginTop: 4 },
  meta: { fontSize: 12, color: '#555', marginTop: 4 },
  date: { fontSize: 11, color: colors.subtext, marginTop: 8, textAlign: 'right' },
});