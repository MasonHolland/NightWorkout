import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BigButton, Divider, RText, Screen, Segmented } from '@/components/ui';
import { quickMoves } from '@/data/routines';
import { useStayAwake } from '@/hooks/use-night-mode';
import { formatClock, formatDuration, minutes } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { useSettings } from '@/lib/settings-context';
import { addSession, loadSessions, type FeedSide, type Session } from '@/lib/storage';

const PROMPT_VISIBLE_MS = 60_000;

const sideOptions: { value: FeedSide; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'bottle', label: 'Bottle' },
];

export default function FeedTimer() {
  const { settings } = useSettings();
  const [side, setSide] = useState<FeedSide | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [prompt, setPrompt] = useState<{ text: string; until: number } | null>(null);
  const [recent, setRecent] = useState<Session[]>([]);
  const lastNudge = useRef(0);
  const [lastNudgeAt, setLastNudgeAt] = useState(0);

  const running = startedAt !== null;
  useStayAwake(running);

  useEffect(() => {
    loadSessions().then((s) => setRecent(s.filter((x) => x.kind === 'feed').slice(0, 4)));
  }, [startedAt]);

  useEffect(() => {
    if (startedAt === null) return;
    const intervalMs = settings.nudgeMinutes * 60_000;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t - lastNudge.current >= intervalMs) {
        lastNudge.current = t;
        setLastNudgeAt(t);
        haptics.nudge(settings.hapticStrength);
        const text = quickMoves[Math.floor(Math.random() * quickMoves.length)];
        setPrompt({ text, until: t + PROMPT_VISIBLE_MS });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt, settings.nudgeMinutes, settings.hapticStrength]);

  const start = () => {
    const t = Date.now();
    lastNudge.current = t;
    setLastNudgeAt(t);
    setNow(t);
    setPrompt(null);
    setStartedAt(t);
    haptics.tap(settings.hapticStrength);
  };

  const stop = async () => {
    if (startedAt === null) return;
    const endedAt = Date.now();
    await addSession({ kind: 'feed', startedAt, endedAt, side: side ?? undefined });
    haptics.doubleTap(settings.hapticStrength);
    setStartedAt(null);
    setPrompt(null);
  };

  const last = recent[0];
  const suggestion =
    last?.side === 'left' ? 'Right side next?' : last?.side === 'right' ? 'Left side next?' : null;
  const nextNudgeMs = running ? settings.nudgeMinutes * 60_000 - (now - lastNudgeAt) : 0;
  const showPrompt = prompt && now < prompt.until;

  return (
    <Screen title="Feed timer">
      <Segmented label={suggestion ?? 'Side'} options={sideOptions} value={side} onChange={setSide} />

      <View style={styles.center}>
        <RText variant="hero" center>
          {formatDuration(running ? now - startedAt : 0)}
        </RText>
        {running ? (
          <RText variant="dim" center>
            Next nudge in {minutes(nextNudgeMs)}
          </RText>
        ) : (
          <RText variant="dim" center>
            You’ll feel a soft buzz every {settings.nudgeMinutes} min
          </RText>
        )}
        {showPrompt && (
          <View style={styles.prompt}>
            <RText variant="large" center>
              {prompt.text}
            </RText>
          </View>
        )}
      </View>

      <BigButton label={running ? 'Stop' : 'Start'} onPress={running ? stop : start} />

      {!running && recent.length > 0 && (
        <View>
          <Divider />
          {recent.map((s) => (
            <RText key={s.startedAt} variant="small">
              {formatClock(s.startedAt)} · {minutes(s.endedAt - s.startedAt)}
              {s.side ? ` · ${s.side}` : ''}
            </RText>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: 8 },
  prompt: { marginTop: 24, paddingHorizontal: 12 },
});
