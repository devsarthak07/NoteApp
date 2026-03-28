import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions
} from 'react-native';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  // These are our animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const exitAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Step 1 — Fade in + scale up + slide up together
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,          // go from 0 to 1 (invisible to visible)
        duration: 800,       // takes 800ms
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,          // go from 0.5 to 1 (small to normal)
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,          // go from 50 to 0 (slide up)
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Step 2 — Wait 1 second then fade out
      setTimeout(() => {
        Animated.timing(exitAnim, {
          toValue: 0,        // go from 1 to 0 (fade out)
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          onFinish();        // tell App.js we're done!
        });
      }, 1000);
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: exitAnim }]}>
      {/* Logo and title animate together */}
      <Animated.View style={{
        opacity: fadeAnim,
        transform: [
          { scale: scaleAnim },
          { translateY: slideAnim }
        ]
      }}>
        {/* App Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.iconEmoji}>📝</Text>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>NoteApp</Text>
        <Text style={styles.tagline}>Your thoughts, organized</Text>
      </Animated.View>

      {/* Bottom credit */}
      <Animated.Text style={[styles.credit, { opacity: fadeAnim }]}>
        by devsarthak07
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 100, height: 100,
    backgroundColor: '#1A1A1A',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  iconEmoji: { fontSize: 50 },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#1A1A1A',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  credit: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: '#1A1A1A',
    opacity: 0.6,
  },
});
