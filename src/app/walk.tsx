import { Pedometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BigButton, RText, Screen, Stepper } from '@/components/ui';
import { useStayAwake } from '@/hooks/use-night-mode';
import { formatDuration } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { useSettings } from '@/lib/settings-context';
import { addSession } from '@/lib/storage';

const MIN_PACE = 50;
const MAX_PACE = 110;

export default function WalkScreen() {
  const { settings, update } = useSettings();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [steps, setSteps] = useState(0);
  const [stepStatus, setStepStatus] = useState<'unknown' | 'counting' | 'unavailable'>('unknown');

  const running = startedAt !== null;
  useStayAwake(running);

  // Haptic metronome: one tap per step at the chosen pace.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => haptics.tap(settings.hapticStrength), 60_000 / settings.walkPace);
    return () => clearInterval(id);
  }, [running, settings.walkPace, settings.hapticStrength]);

  // Elapsed clock.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Step counting (iOS motion coprocessor). Counts from when the walk starts.
  useEffect(() => {
    if (!running) return;
    let sub: { remove: () => void } | null = null;
    let cancelled = false;

    (async () => {
      try {
        const available = await Pedometer.isAvailableAsync();
        const { granted } = available ? await Pedometer.requestPermissionsAsync() : { granted: false };
        if (cancelled) return;
        if (!available || !granted) {
          setStepStatus('unavailable');
          return;
        }
        setStepStatus('counting');
        sub = Pedometer.watchStepCount((r) => setSteps(r.steps));
      } catch {
        if (!cancelled) setStepStatus('unavailable');
      }
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [running]);

  const start = () => {
    const t = Date.now();
    setSteps(0);
    setNow(t);
    setStartedAt(t);
  };

  const stop = async () => {
    if (startedAt === null) return;
    await addSession({
      kind: 'walk',
      startedAt,
      endedAt: Date.now(),
      steps: stepStatus === 'counting' ? steps : undefined,
    });
    setStartedAt(null);
  };

  const changePace = (delta: number) =>
    update({ walkPace: Math.min(MAX_PACE, Math.max(MIN_PACE, settings.walkPace + delta)) });

  return (
    <Screen title="Walk">
      <Stepper
        label="Pace (steps per minute)"
        value={String(settings.walkPace)}
        onDecrement={() => changePace(-5)}
        onIncrement={() => changePace(5)}
      />

      <View style={styles.center}>
        <RText variant="hero" center>
          {running ? formatDuration(now - startedAt) : '0:00'}
        </RText>
        <RText variant="dim" center>
          {!running
            ? 'Step with each tap. Slow and steady settles baby.'
            : stepStatus === 'counting'
              ? `${steps} steps`
              : stepStatus === 'unavailable'
                ? 'Step counting unavailable'
                : ' '}
        </RText>
      </View>

      <BigButton label={running ? 'Stop' : 'Start'} onPress={running ? stop : start} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: 8 },
});
