import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { WebDemo } from '@/components/WebDemo';
import { useNightBrightness } from '@/hooks/use-night-mode';
import { SettingsProvider, useSettings } from '@/lib/settings-context';
import { palette } from '@/theme/palette';

/** Navigation theme with every surface forced to red/black. */
const redTheme = {
  ...DarkTheme,
  colors: {
    primary: palette.red70,
    background: palette.black,
    card: palette.black,
    text: palette.red70,
    border: palette.red20,
    notification: palette.red40,
  },
};

function NightBrightness() {
  const { settings, loaded } = useSettings();
  useNightBrightness(settings.brightness, loaded);
  return null;
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <NightBrightness />
      <ThemeProvider value={redTheme}>
        <StatusBar hidden style="light" />
        <WebDemo>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: palette.black },
              animation: 'fade',
            }}
          />
        </WebDemo>
      </ThemeProvider>
    </SettingsProvider>
  );
}
