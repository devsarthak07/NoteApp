import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import NoteEditorScreen from './src/screens/NoteEditorScreen';
import SplashScreen from './src/screens/SplashScreen';
import { colors } from './src/theme/colors';

const Stack = createStackNavigator();

export default function App() {
  // This controls whether splash screen shows or not
  const [showSplash, setShowSplash] = useState(true);

  // If splash is showing, show ONLY the splash screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Once splash is done, show the actual app!
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
            elevation: 0,
            shadowOpacity: 0
          },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [{
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              }],
              opacity: current.progress.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0.8, 1],
              }),
            },
          }),
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NoteEditor"
          component={NoteEditorScreen}
          options={{ title: 'Note', headerBackTitle: '' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
