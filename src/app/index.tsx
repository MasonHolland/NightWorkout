import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BigButton, RText, Screen } from '@/components/ui';
import { formatClock } from '@/lib/format';
import { useSettings } from '@/lib/settings-context';
import { loadSessions, type Session } from '@/lib/storage';

export default function Home() {
  const { settings, loaded } = useSettings();
  const [lastFeed, setLastFeed] = useState<Session | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadSessions().then((s) => setLastFeed(s.find((x) => x.kind === 'feed') ?? null));
    }, []),
  );

  if (!loaded) return <Screen back={false}>{null}</Screen>;
  if (!settings.onboarded) return <Redirect href="/setup" />;

  return (
    <Screen back={false}>
      <View style={styles.top}>
        <RText variant="title">Night shift</RText>
        <RText variant="dim">
          {lastFeed
            ? `Last feed ${formatClock(lastFeed.startedAt)}${lastFeed.side ? ` · ${lastFeed.side}` : ''}`
            : 'Dim, quiet, and red. You’ve got this.'}
        </RText>
      </View>

      <View style={styles.buttons}>
        <BigButton label="Feed timer" sublabel="Gentle nudges to stay awake" onPress={() => router.push('/timer')} />
        <BigButton label="Move" sublabel="Guided gentle movement" onPress={() => router.push('/move')} />
        <BigButton label="Walk" sublabel="Paced laps to settle baby" onPress={() => router.push('/walk')} />
      </View>

      <Pressable onPress={() => router.push('/settings')} hitSlop={16} accessibilityRole="button">
        <RText variant="small" center>
          Settings
        </RText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { gap: 6, marginTop: 12 },
  buttons: { flex: 1, justifyContent: 'center', gap: 16 },
});
