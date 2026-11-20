import * as Brightness from 'expo-brightness';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/**
 * While the app is in the foreground, hold the screen at `level` brightness.
 * The user's own brightness is saved first and put back when the app goes to
 * the background (not on 'inactive', so pulling down Control Center at night
 * doesn't flash the screen bright).
 */
export function useNightBrightness(level: number, enabled: boolean) {
  const original = useRef<number | null>(null);
  const levelRef = useRef(level);

  useEffect(() => {
    levelRef.current = level;
    if (enabled && original.current !== null && AppState.currentState === 'active') {
      Brightness.setBrightnessAsync(level).catch(() => {});
    }
  }, [level, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const dim = async () => {
      try {
        if (original.current === null) {
          original.current = await Brightness.getBrightnessAsync();
        }
        await Brightness.setBrightnessAsync(levelRef.current);
      } catch {
        // Brightness unavailable (e.g. web) — nothing to do.
      }
    };

    const restore = async () => {
      if (original.current === null) return;
      const value = original.current;
      original.current = null;
      try {
        await Brightness.setBrightnessAsync(value);
      } catch {
        // ignore
      }
    };

    if (AppState.currentState === 'active') dim();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') dim();
      else if (state === 'background') restore();
    });

    return () => {
      sub.remove();
      restore();
    };
  }, [enabled]);
}

/** Stop the phone auto-locking while a session is running. */
export function useStayAwake(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const tag = 'night-session';
    activateKeepAwakeAsync(tag).catch(() => {});
    return () => {
      deactivateKeepAwake(tag).catch(() => {});
    };
  }, [active]);
}
