import AsyncStorage from '@react-native-async-storage/async-storage';

export type HapticStrength = 'soft' | 'medium' | 'strong';

export type Settings = {
  /** Screen brightness while the app is open, 0–1. */
  brightness: number;
  /** Minutes between "stay awake" nudges in the feed timer. */
  nudgeMinutes: number;
  hapticStrength: HapticStrength;
  /** Walking metronome, steps per minute. */
  walkPace: number;
  onboarded: boolean;
};

export const defaultSettings: Settings = {
  brightness: 0.1,
  nudgeMinutes: 10,
  hapticStrength: 'medium',
  walkPace: 80,
  onboarded: false,
};

export type FeedSide = 'left' | 'right' | 'bottle';

export type Session = {
  kind: 'feed' | 'move' | 'walk';
  startedAt: number;
  endedAt: number;
  side?: FeedSide;
  steps?: number;
  routine?: string;
};

const SETTINGS_KEY = 'nightworkout.settings.v1';
const SESSIONS_KEY = 'nightworkout.sessions.v1';
const MAX_SESSIONS = 200;

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Non-fatal: settings just won't persist this time.
  }
}

/** Newest first. */
export async function loadSessions(): Promise<Session[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
  }
}

export async function addSession(session: Session): Promise<void> {
  const sessions = await loadSessions();
  const next = [session, ...sessions].slice(0, MAX_SESSIONS);
  try {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
  } catch {
    // Non-fatal.
  }
}
