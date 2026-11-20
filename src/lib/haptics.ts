import * as Haptics from 'expo-haptics';

import type { HapticStrength } from './storage';

const styles: Record<HapticStrength, Haptics.ImpactFeedbackStyle> = {
  soft: Haptics.ImpactFeedbackStyle.Soft,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  strong: Haptics.ImpactFeedbackStyle.Heavy,
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function impact(strength: HapticStrength) {
  try {
    await Haptics.impactAsync(styles[strength]);
  } catch {
    // Haptics unavailable (simulator / web) — silently ignore.
  }
}

/** Named vibration patterns, so the parent can follow along without looking. */
export const haptics = {
  /** One beat: a rep, a step, a timed-hold pulse. */
  tap: (strength: HapticStrength) => impact(strength),

  /** Two quick taps: a new move is starting. */
  async doubleTap(strength: HapticStrength) {
    await impact(strength);
    await wait(160);
    await impact(strength);
  },

  /** Three slow taps: "stay with me" nudge during a feed. */
  async nudge(strength: HapticStrength) {
    for (let i = 0; i < 3; i++) {
      await impact(strength);
      await wait(450);
    }
  },

  /** Routine finished. */
  async finish(strength: HapticStrength) {
    for (let i = 0; i < 4; i++) {
      await impact(strength);
      await wait(120);
    }
  },
};
