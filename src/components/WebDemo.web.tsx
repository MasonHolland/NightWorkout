import { createElement, useState, type ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, type } from '@/theme/palette';

const REPO = 'https://github.com/MasonHolland/NightWorkout#run-it-locally';
const DISMISSED_KEY = 'nightworkout.webDemo.bannerDismissed';
// Set by scripts/media so README screenshots show the app without the banner or frame.
const CAPTURE_KEY = 'webDemo.capture';

type Mode = 'frame' | 'plain' | 'banner';

function storage(key: string, value?: string) {
  try {
    if (value === undefined) return window.localStorage.getItem(key);
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked (private mode); the banner just comes back next time.
  }
  return null;
}

function initialMode(): Mode {
  if (storage(CAPTURE_KEY) === '1') return 'plain';
  // Inside the desktop frame: the frame page already explains it's a demo.
  if (window.self !== window.top) return 'plain';
  // A desktop browser gets the app in a phone-sized frame instead of stretched to the window.
  if (window.matchMedia('(min-width: 760px) and (pointer: fine)').matches) return 'frame';
  return storage(DISMISSED_KEY) === '1' ? 'plain' : 'banner';
}

/**
 * Web only. NightWorkout is an iPhone app; the web build is a demo of it.
 * - Desktop: shows the app at phone size in an iframe, with a note beside it.
 * - Phone browser: a small dismissible "web demo" banner above the app.
 * Red on black like the rest of the app (colours come from the palette).
 */
export function WebDemo({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(initialMode);

  if (mode === 'frame') {
    return (
      <View style={styles.page}>
        <View style={styles.phone}>
          <View style={styles.screen}>
            {createElement('iframe', {
              src: window.location.pathname,
              title: 'NightWorkout web demo',
              style: { width: 393, height: '100%', border: 0, display: 'block' },
            })}
          </View>
        </View>
        <View style={styles.note}>
          <Text style={styles.title}>NightWorkout</Text>
          <Text style={styles.body}>
            For parents up at night with a newborn: a feed timer that keeps you awake, gentle movement and a walking
            metronome, all in red on black. This is a web demo of the iPhone app, shown at iPhone size.
          </Text>
          <Text style={styles.body}>
            On an iPhone the screen dims, and the app guides you with vibration (taps for reps, steps and nudges) and
            counts your steps. A browser can’t do those.
          </Text>
          <Pressable onPress={() => Linking.openURL(REPO)} accessibilityRole="link">
            <Text style={styles.link}>Run it on your iPhone →</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      {mode === 'banner' && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Web demo of an iPhone app. No vibration or dimming here.{' '}
            <Text style={styles.bannerLink} onPress={() => Linking.openURL(REPO)} accessibilityRole="link">
              Get it on iPhone
            </Text>
          </Text>
          <Pressable
            onPress={() => {
              storage(DISMISSED_KEY, '1');
              setMode('plain');
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Hide this message">
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.fill}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: palette.black },
  page: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 56,
    padding: 24,
    backgroundColor: palette.black,
  },
  // The bezel sits outside the 393 x 852 screen, so the app gets the full iPhone width.
  phone: {
    padding: 10,
    height: '100%',
    maxHeight: 852 + 20,
    borderRadius: 54,
    borderWidth: 1,
    borderColor: palette.red40,
    backgroundColor: palette.black,
  },
  screen: { width: 393, flex: 1, borderRadius: 44, overflow: 'hidden', backgroundColor: palette.black },
  note: { maxWidth: 340, gap: 14 },
  title: { fontSize: type.title, fontWeight: '300', color: palette.red70 },
  body: { fontSize: 17, lineHeight: 24, color: palette.red40 },
  link: { fontSize: 17, color: palette.red70 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.red20,
    backgroundColor: palette.black,
  },
  bannerText: { flex: 1, fontSize: 14, color: palette.red40 },
  bannerLink: { color: palette.red70 },
  close: { fontSize: 15, paddingHorizontal: 4, color: palette.red40 },
});
