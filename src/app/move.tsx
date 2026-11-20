import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BigButton, RText, Row, Screen } from '@/components/ui';
import { REST_SECONDS, routines, type Routine } from '@/data/routines';
import { useStayAwake } from '@/hooks/use-night-mode';
import { formatDuration } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { useSettings } from '@/lib/settings-context';
import { addSession } from '@/lib/storage';

type Phase = 'rest' | 'work' | 'done';

type RunState = {
  routine: Routine;
  index: number;
  phase: Phase;
  /** Seconds elapsed in the current phase. */
  elapsed: number;
  paused: boolean;
  startedAt: number;
  endedAt?: number;
};

export default function MoveScreen() {
  const { settings } = useSettings();
  const [run, setRun] = useState<RunState | null>(null);
  const runRef = useRef<RunState | null>(null);

  const commit = (next: RunState | null) => {
    runRef.current = next;
    setRun(next);
  };

  const active = run !== null && run.phase !== 'done' && !run.paused;
  useStayAwake(run !== null && run.phase !== 'done');

  useEffect(() => {
    if (!active) return;
    const strength = settings.hapticStrength;

    const id = setInterval(() => {
      const s = runRef.current;
      if (!s || s.paused || s.phase === 'done') return;
      const elapsed = s.elapsed + 1;
      const move = s.routine.moves[s.index];

      if (s.phase === 'rest') {
        if (elapsed >= REST_SECONDS) {
          haptics.doubleTap(strength);
          commit({ ...s, phase: 'work', elapsed: 0 });
        } else {
          commit({ ...s, elapsed });
        }
        return;
      }

      if (elapsed >= move.seconds) {
        if (s.index === s.routine.moves.length - 1) {
          haptics.finish(strength);
          const endedAt = Date.now();
          addSession({ kind: 'move', startedAt: s.startedAt, endedAt, routine: s.routine.name });
          commit({ ...s, phase: 'done', elapsed: 0, endedAt });
        } else {
          haptics.tap(strength);
          commit({ ...s, phase: 'rest', index: s.index + 1, elapsed: 0 });
        }
        return;
      }

      if (elapsed % move.tapEvery === 0) haptics.tap(strength);
      commit({ ...s, elapsed });
    }, 1000);

    return () => clearInterval(id);
  }, [active, settings.hapticStrength]);

  const start = (routine: Routine) => {
    const startedAt = Date.now();
    haptics.tap(settings.hapticStrength);
    commit({ routine, index: 0, phase: 'rest', elapsed: 0, paused: false, startedAt });
  };

  const stop = () => {
    const s = runRef.current;
    if (s && s.phase !== 'done' && Date.now() - s.startedAt >= 60_000) {
      addSession({ kind: 'move', startedAt: s.startedAt, endedAt: Date.now(), routine: s.routine.name });
    }
    commit(null);
  };

  const skip = () => {
    const s = runRef.current;
    if (!s || s.phase === 'done') return;
    // Jump to the end of the current phase; the next tick advances.
    const length = s.phase === 'rest' ? REST_SECONDS : s.routine.moves[s.index].seconds;
    commit({ ...s, elapsed: length - 1, paused: false });
  };

  if (!run) {
    return (
      <Screen title="Move" scroll>
        <RText variant="dim">Pick a routine. Taps mark each rep; a double tap means a new move.</RText>
        {routines.map((r) => (
          <RoutineButton key={r.id} routine={r} onStart={start} />
        ))}
      </Screen>
    );
  }

  if (run.phase === 'done') {
    return (
      <Screen title={run.routine.name}>
        <View style={styles.center}>
          <RText variant="title" center>
            Done
          </RText>
          <RText variant="dim" center>
            {formatDuration((run.endedAt ?? run.startedAt) - run.startedAt)} of movement. Nice work.
          </RText>
        </View>
        <BigButton label="Finish" onPress={() => commit(null)} />
      </Screen>
    );
  }

  const move = run.routine.moves[run.index];
  const resting = run.phase === 'rest';
  const rep = move.reps ? Math.min(move.reps, Math.floor(run.elapsed / move.tapEvery) + 1) : null;

  return (
    <Screen title={run.routine.name}>
      <RText variant="small">
        Move {run.index + 1} of {run.routine.moves.length}
      </RText>

      <View style={styles.center}>
        {resting ? (
          <>
            <RText variant="dim" center>
              Next
            </RText>
            <RText variant="title" center>
              {move.name}
            </RText>
            <RText variant="hero" center>
              {REST_SECONDS - run.elapsed}
            </RText>
          </>
        ) : (
          <>
            <RText variant="title" center>
              {move.name}
            </RText>
            <RText variant="hero" center>
              {rep !== null ? `${rep}/${move.reps}` : formatDuration((move.seconds - run.elapsed) * 1000)}
            </RText>
            <RText variant="dim" center>
              {move.cue}
            </RText>
          </>
        )}
      </View>

      <Row>
        <View style={styles.flex}>
          <BigButton compact label={run.paused ? 'Resume' : 'Pause'} onPress={() => commit({ ...run, paused: !run.paused })} />
        </View>
        <View style={styles.flex}>
          <BigButton compact label="Skip" onPress={skip} />
        </View>
        <View style={styles.flex}>
          <BigButton compact label="Stop" onPress={stop} />
        </View>
      </Row>
    </Screen>
  );
}

function RoutineButton({ routine, onStart }: { routine: Routine; onStart: (r: Routine) => void }) {
  return <BigButton label={routine.name} sublabel={routine.description} onPress={() => onStart(routine)} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: 12 },
  flex: { flex: 1 },
});
