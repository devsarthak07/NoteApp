import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Alert, Image
} from 'react-native';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getNotes, saveNotes } from '../storage/noteStorage';
import { colors } from '../theme/colors';

const uuidv4 = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export default function NoteEditorScreen({ route, navigation }) {
  const existing = route.params?.note;
  const [title, setTitle] = useState(existing?.title || '');
  const [content, setContent] = useState(existing?.content || '');
  const [checklist, setChecklist] = useState(existing?.checklist || []);
  const [newTask, setNewTask] = useState('');
  const [recording, setRecording] = useState(null);
  const [voiceUri, setVoiceUri] = useState(existing?.voiceUri || null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [images, setImages] = useState(existing?.images || []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={saveNote} style={{ marginRight: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>Save</Text>
        </TouchableOpacity>
      ),
    });
  }, [title, content, checklist, voiceUri, images]);

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow microphone access!');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      Alert.alert('Error', 'Could not start recording!');
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setVoiceUri(uri);
      setRecording(null);
      setIsRecording(false);
    } catch (err) {
      Alert.alert('Error', 'Could not stop recording!');
    }
  };

  const playRecording = async () => {
    try {
      if (isPlaying) {
        await sound.stopAsync();
        setIsPlaying(false);
        return;
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: voiceUri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) setIsPlaying(false);
      });
    } catch (err) {
      Alert.alert('Error', 'Could not play recording!');
    }
  };

  const deleteRecording = () => {
    Alert.alert('Delete Recording', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setVoiceUri(null) }
    ]);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow gallery access!');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not pick image!');
    }
  };

  const deleteImage = (index) => {
    Alert.alert('Delete Image', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => setImages(images.filter((_, i) => i !== index))
      }
    ]);
  };

  // PDF Export function
  const exportAsPDF = async () => {
    try {
      const checklistHTML = checklist.length > 0
        ? `<h3>Checklist</h3><ul>
            ${checklist.map(item =>
              `<li style="text-decoration: ${item.checked ? 'line-through' : 'none'}; color: ${item.checked ? '#888' : '#000'}">
                ${item.checked ? '☑' : '☐'} ${item.text}
              </li>`
            ).join('')}
           </ul>`
        : '';

      const voiceHTML = voiceUri
        ? `<p>🎤 <em>Voice recording attached</em></p>`
        : '';

      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 32px; color: #1A1A1A; }
              h1 { color: #1A1A1A; border-bottom: 2px solid #F5C518; padding-bottom: 8px; }
              h3 { color: #555; }
              p { font-size: 15px; line-height: 1.6; }
              ul { list-style: none; padding: 0; }
              li { padding: 6px 0; font-size: 14px; }
              .date { color: #888; font-size: 12px; margin-bottom: 16px; }
              .footer { margin-top: 40px; color: #aaa; font-size: 11px; border-top: 1px solid #eee; padding-top: 8px; }
            </style>
          </head>
          <body>
            <h1>${title || 'Untitled Note'}</h1>
            <p class="date">📅 ${new Date().toLocaleDateString()}</p>
            ${content ? `<p>${content}</p>` : ''}
            ${checklistHTML}
            ${voiceHTML}
            <div class="footer">Exported from NoteApp by devsarthak07</div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
      });
    } catch (err) {
      Alert.alert('Error', 'Could not export PDF!');
    }
  };

  const saveNote = async () => {
    if (!title.trim() && !content.trim() && checklist.length === 0) {
      Alert.alert('Empty Note', 'Please add some content before saving.');
      return;
    }
    const notes = await getNotes();
    const now = Date.now();
    if (existing) {
      const updated = notes.map(n =>
        n.id === existing.id
          ? { ...n, title, content, checklist, voiceUri, images, updatedAt: now }
          : n
      );
      await saveNotes(updated);
    } else {
      const newNote = {
        id: uuidv4(), title, content, checklist,
        voiceUri, images,
        createdAt: now, updatedAt: now,
      };
      await saveNotes([newNote, ...notes]);
    }
    navigation.goBack();
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setChecklist([...checklist, { id: uuidv4(), text: newTask, checked: false }]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setChecklist(checklist.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  const deleteTask = (id) => {
    setChecklist(checklist.filter(t => t.id !== id));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={colors.subtext}
        />
        <TextInput
          style={styles.contentInput}
          placeholder="Write your note here..."
          value={content}
          onChangeText={setContent}
          multiline
          placeholderTextColor={colors.subtext}
          textAlignVertical="top"
        />

        {/* Checklist Section */}
        <Text style={styles.sectionLabel}>✅ Checklist</Text>
        {checklist.map(item => (
          <View key={item.id} style={styles.taskRow}>
            <TouchableOpacity onPress={() => toggleTask(item.id)}>
              <Text style={styles.checkbox}>{item.checked ? '☑️' : '⬜'}</Text>
            </TouchableOpacity>
            <Text style={[styles.taskText, item.checked && styles.checked]}>
              {item.text}
            </Text>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteTask}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addTaskRow}>
          <TextInput
            style={styles.taskInput}
            placeholder="Add a task..."
            value={newTask}
            onChangeText={setNewTask}
            onSubmitEditing={addTask}
            placeholderTextColor={colors.subtext}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addTask}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Voice Recording Section */}
        <Text style={styles.sectionLabel}>🎤 Voice Note</Text>
        <View style={styles.voiceRow}>
          {!voiceUri ? (
            <TouchableOpacity
              style={[styles.voiceBtn, isRecording && styles.voiceBtnActive]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Text style={styles.voiceBtnText}>
                {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.voiceControls}>
              <TouchableOpacity style={styles.playBtn} onPress={playRecording}>
                <Text style={styles.voiceBtnText}>
                  {isPlaying ? '⏹️ Stop' : '▶️ Play'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteVoiceBtn} onPress={deleteRecording}>
                <Text style={styles.voiceBtnText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Image Section */}
        <Text style={styles.sectionLabel}>🖼️ Images</Text>
        <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
          <Text style={styles.addImageText}>+ Add Image from Gallery</Text>
        </TouchableOpacity>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.deleteImageBtn}
              onPress={() => deleteImage(index)}
            >
              <Text style={styles.deleteImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* PDF Export Button */}
        <TouchableOpacity style={styles.pdfBtn} onPress={exportAsPDF}>
          <Text style={styles.pdfBtnText}>📄 Export as PDF</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  titleInput: {
    fontSize: 22, fontWeight: '700', color: colors.text,
    borderBottomWidth: 1, borderColor: colors.border,
    paddingBottom: 8, marginBottom: 12,
  },
  contentInput: {
    fontSize: 15, color: colors.text, minHeight: 120,
    marginBottom: 20, lineHeight: 22,
  },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: colors.subtext, marginBottom: 8, marginTop: 16 },
  taskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  checkbox: { fontSize: 20 },
  taskText: { flex: 1, fontSize: 14, color: colors.text },
  checked: { textDecorationLine: 'line-through', color: colors.subtext },
  deleteTask: { color: colors.danger, fontSize: 16, paddingHorizontal: 4 },
  addTaskRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  taskInput: {
    flex: 1, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 14, color: colors.text, backgroundColor: '#fff',
  },
  addBtn: {
    backgroundColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  addBtnText: { fontWeight: '700', color: '#1A1A1A' },
  voiceRow: { marginTop: 8 },
  voiceBtn: {
    backgroundColor: colors.primary, borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  voiceBtnActive: { backgroundColor: colors.danger },
  voiceBtnText: { fontWeight: '700', color: '#1A1A1A', fontSize: 14 },
  voiceControls: { flexDirection: 'row', gap: 10 },
  playBtn: {
    flex: 1, backgroundColor: '#C8E6C9',
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  deleteVoiceBtn: {
    flex: 1, backgroundColor: '#FFCDD2',
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  addImageBtn: {
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8,
  },
  addImageText: { color: colors.subtext, fontSize: 14, fontWeight: '600' },
  imageContainer: { marginTop: 12, position: 'relative' },
  image: { width: '100%', height: 200, borderRadius: 12 },
  deleteImageBtn: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20,
    width: 28, height: 28, justifyContent: 'center', alignItems: 'center',
  },
  deleteImageText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pdfBtn: {
    backgroundColor: '#1A1A1A', borderRadius: 12,
    padding: 16, alignItems: 'center',
    marginTop: 24, marginBottom: 40,
  },
  pdfBtnText: { color: '#F5C518', fontWeight: '700', fontSize: 15 },
});
