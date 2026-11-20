import { router } from 'expo-router';

import { BigButton, Divider, RText, Screen, Segmented, Stepper } from '@/components/ui';
import { useSettings } from '@/lib/settings-context';
import type { HapticStrength } from '@/lib/storage';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const round2 = (v: number) => Math.round(v * 100) / 100;

const strengthOptions: { value: HapticStrength; label: string }[] = [
  { value: 'soft', label: 'Soft' },
  { value: 'medium', label: 'Medium' },
  { value: 'strong', label: 'Strong' },
];

export default function SettingsScreen() {
  const { settings, update } = useSettings();

  return (
    <Screen title="Settings" scroll>
      <Stepper
        label="Screen brightness in the app"
        value={`${Math.round(settings.brightness * 100)}%`}
        onDecrement={() => update({ brightness: round2(clamp(settings.brightness - 0.02, 0.02, 0.5)) })}
        onIncrement={() => update({ brightness: round2(clamp(settings.brightness + 0.02, 0.02, 0.5)) })}
      />
      <RText variant="small">Your normal brightness comes back when you leave the app.</RText>

      <Divider />

      <Stepper
        label="Feed timer nudge every"
        value={`${settings.nudgeMinutes} min`}
        onDecrement={() => update({ nudgeMinutes: clamp(settings.nudgeMinutes - 5, 5, 30) })}
        onIncrement={() => update({ nudgeMinutes: clamp(settings.nudgeMinutes + 5, 5, 30) })}
      />

      <Segmented
        label="Vibration strength"
        options={strengthOptions}
        value={settings.hapticStrength}
        onChange={(hapticStrength) => update({ hapticStrength })}
      />

      <Divider />

      <BigButton
        compact
        label="Red screen setup guide"
        sublabel="Make notifications and the rest of iOS red too"
        onPress={() => router.push('/setup')}
      />
    </Screen>
  );
}
