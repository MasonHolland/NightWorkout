import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BigButton, RText, Screen } from '@/components/ui';
import { useSettings } from '@/lib/settings-context';

const steps = [
  {
    title: 'Turn on a red tint',
    body: 'Settings → Accessibility → Display & Text Size → Color Filters. Turn it on, choose Color Tint, then drag Intensity and Hue all the way to the right. The preview should turn deep red.',
  },
  {
    title: 'Dim further',
    body: 'On the same Display & Text Size screen, turn on Reduce White Point and slide it up.',
  },
  {
    title: 'Add a shortcut',
    body: 'Settings → Accessibility → Accessibility Shortcut. Tick Color Filters and Reduce White Point. Now triple-click the side button to switch red mode on at night and off in the morning.',
  },
];

export default function Setup() {
  const { settings, update } = useSettings();
  const firstRun = !settings.onboarded;

  const done = () => {
    update({ onboarded: true });
    if (firstRun) router.replace('/');
    else router.back();
  };

  return (
    <Screen title="Red screen setup" back={!firstRun} scroll>
      <RText variant="dim">
        This app only ever draws red on black. iOS banners, the keyboard, and Control Center don’t, though. A one-time
        setup makes your whole phone red at night.
      </RText>

      {steps.map((s, i) => (
        <View key={s.title} style={styles.step}>
          <RText variant="large">
            {i + 1}. {s.title}
          </RText>
          <RText variant="body">{s.body}</RText>
        </View>
      ))}

      <RText variant="small">
        Tip: turn on a Sleep Focus too, so notification banners stay off the screen.
      </RText>

      <BigButton label={firstRun ? 'I’m set up' : 'Done'} onPress={done} />
      {firstRun && <BigButton compact label="Skip for now" onPress={done} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { gap: 6, marginTop: 8 },
});
