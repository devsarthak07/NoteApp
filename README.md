# 📝 NoteApp

A simple, minimal and feature-rich Notes Taking Android App built with React Native and Expo. Inspired by Google Keep.

![Platform](https://img.shields.io/badge/Platform-Android-green)
![Made With](https://img.shields.io/badge/Made%20With-React%20Native-blue)
![Expo](https://img.shields.io/badge/Expo-SDK%2051-white)

---

## ✨ Features

### 📝 Core Features
- Create, edit and delete notes
- Search notes in real time
- Colorful note cards (Google Keep style)
- Notes saved locally on device

### ✅ Checklist
- Add multiple to-do items inside notes
- Check/uncheck tasks
- Strikethrough on completed tasks
- Delete individual tasks

### 🎤 Voice Recording
- Record multiple voice notes per note
- Play back any recording
- Delete individual recordings
- Recording counter shown on card

### 🖼️ Image Attachments
- Attach multiple images per note
- Pick from gallery
- Preview images inside note
- Delete individual images
- Image count shown on card

### 📄 PDF Export
- Export any note as a PDF
- Includes title, content, checklist
- Shows voice recording count
- Share PDF via any app
- Clean professional PDF layout

### 🌙 Dark Mode
- Toggle between light and dark mode
- Applies to all screens instantly
- Dark mode persists in note editor
- Eye friendly dark color scheme

### ✨ Animations
- Custom splash screen on app open
- Smooth slide animation between screens
- Zoom + fade + slide up on splash
- Smooth fade out transition

### 🎨 UI/UX
- Custom neon app icon
- Minimal Material Design
- Colorful note cards
- Bottom toolbar for quick actions
- Small PDF icon in header
- Empty state with illustration

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React Native | Core framework |
| Expo SDK 51 | Development platform |
| AsyncStorage | Local data storage |
| React Navigation | Screen routing |
| expo-av | Voice recording & playback |
| expo-image-picker | Image attachments |
| expo-print | PDF generation |
| expo-sharing | PDF sharing |
| Animated API | Splash screen animations |

---

## 📁 Project Structure
```
📁 NoteApp
    📁 src
        📁 screens
            📄 HomeScreen.js       ← note list + search + dark mode
            📄 NoteEditorScreen.js ← create/edit notes
            📄 SplashScreen.js     ← app opening animation
        📁 components
            📄 NoteCard.js         ← individual note card
        📁 storage
            📄 noteStorage.js      ← save/load notes
        📁 theme
            📄 colors.js           ← light & dark colors
    📄 App.js                      ← navigation setup
    📄 index.js                    ← app entry point
    📄 app.json                    ← app configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20
- Android Emulator (Android Studio) or Expo Go app

### Installation
```bash
git clone https://github.com/devsarthak07/NoteApp.git
cd NoteApp
npm install
npx expo start
```
