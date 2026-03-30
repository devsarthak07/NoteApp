import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, Easing
} from 'react-native';

const { width, height } = Dimensions.get('window');
const APP_NAME = "NoteApp";

export default function SplashScreen({ onFinish }) {
  // Main animations
  const iconY = useRef(new Animated.Value(-200)).current;
  const iconScale = useRef(new Animated.Value(0.3)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;

  // Text animations
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(20)).current;

  // Exit animation
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  // Glow animation
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Typing effect
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  // Stars
  const stars = useRef(
    Array.from({ length: 6 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Cursor blink
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    // Step 1 — Icon drops from top with bounce
    Animated.sequence([
      Animated.parallel([
        Animated.spring(iconY, {
          toValue: 0,
          tension: 40,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 40,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Step 2 — Icon wiggles
      Animated.sequence([
        Animated.timing(iconRotate, {
          toValue: 1,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotate, {
          toValue: -1,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotate, {
          toValue: 1,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotate, {
          toValue: 0,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Step 3 — Stars burst out
        animateStars();

        // Step 4 — Type the app name
        typeText(() => {
          // Step 5 — Tagline slides up
          Animated.parallel([
            Animated.timing(taglineOpacity, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(taglineY, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]).start(() => {
            clearInterval(cursorInterval);
            setShowCursor(false);

            // Step 6 — Glow pulse
            Animated.loop(
              Animated.sequence([
                Animated.timing(glowAnim, {
                  toValue: 1,
                  duration: 600,
                  useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                  toValue: 0,
                  duration: 600,
                  useNativeDriver: true,
                }),
              ]),
              { iterations: 2 }
            ).start(() => {
              // Step 7 — Exit animation
              setTimeout(() => {
                Animated.parallel([
                  Animated.timing(exitOpacity, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                  }),
                  Animated.timing(exitScale, {
                    toValue: 1.1,
                    duration: 600,
                    useNativeDriver: true,
                  }),
                ]).start(() => onFinish());
              }, 300);
            });
          });
        });
      });
    });

    return () => clearInterval(cursorInterval);
  }, []);

  const typeText = (callback) => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(APP_NAME.substring(0, i + 1));
      i++;
      if (i === APP_NAME.length) {
        clearInterval(interval);
        setTimeout(callback, 300);
      }
    }, 100);
  };

  const animateStars = () => {
    const positions = [
      { x: -80, y: -80 },
      { x: 80, y: -80 },
      { x: -100, y: 0 },
      { x: 100, y: 0 },
      { x: -80, y: 80 },
      { x: 80, y: 80 },
    ];

    stars.forEach((star, i) => {
      Animated.sequence([
        Animated.delay(i * 50),
        Animated.parallel([
          Animated.spring(star.x, {
            toValue: positions[i].x,
            tension: 50,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.spring(star.y, {
            toValue: positions[i].y,
            tension: 50,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(star.scale, {
            toValue: 1,
            tension: 50,
            friction: 5,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        Animated.timing(star.opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    });
  };

  const rotate = iconRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <Animated.View style={[
      styles.container,
      { opacity: exitOpacity, transform: [{ scale: exitScale }] }
    ]}>

      {/* Background circles for depth */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Stars */}
      {stars.map((star, i) => (
        <Animated.Text
          key={i}
          style={{
            position: 'absolute',
            fontSize: 16,
            opacity: star.opacity,
            transform: [
              { translateX: star.x },
              { translateY: star.y },
              { scale: star.scale },
            ],
          }}
        >
          ✨
        </Animated.Text>
      ))}

      {/* Glow behind icon */}
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

      {/* Icon */}
      <Animated.View style={{
        opacity: iconOpacity,
        transform: [
          { translateY: iconY },
          { scale: iconScale },
          { rotate },
        ],
      }}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconEmoji}>📝</Text>
        </View>
      </Animated.View>

      {/* App Name with typing effect */}
      <View style={styles.textRow}>
        <Text style={styles.appName}>{typedText}</Text>
        {showCursor && <Text style={styles.cursor}>|</Text>}
      </View>

      {/* Tagline */}
      <Animated.Text style={[
        styles.tagline,
        {
          opacity: taglineOpacity,
          transform: [{ translateY: taglineY }]
        }
      ]}>
        Your thoughts, organized ✨
      </Animated.Text>

      {/* Bottom credit */}
      <Animated.Text style={[styles.credit, { opacity: taglineOpacity }]}>
        by devsarthak07
      </Animated.Text>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    width: 300, height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(245, 197, 24, 0.05)',
    top: height * 0.2,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200, height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(245, 197, 24, 0.03)',
    bottom: height * 0.2,
  },
  glow: {
    position: 'absolute',
    width: 160, height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(245, 197, 24, 0.15)',
  },
  iconContainer: {
    width: 110, height: 110,
    backgroundColor: '#1A1A1A',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 197, 24, 0.3)',
    elevation: 20,
    shadowColor: '#F5C518',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  iconEmoji: { fontSize: 54 },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    height: 44,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#F5C518',
    letterSpacing: 2,
  },
  cursor: {
    fontSize: 38,
    fontWeight: '300',
    color: '#F5C518',
    marginLeft: 2,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 10,
    letterSpacing: 0.5,
  },
  credit: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
  },
});
