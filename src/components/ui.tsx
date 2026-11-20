import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, type } from '@/theme/palette';

type TextVariant = 'hero' | 'title' | 'large' | 'body' | 'dim' | 'small';

export function RText({
  variant = 'body',
  children,
  style,
  center,
}: {
  variant?: TextVariant;
  children: ReactNode;
  style?: TextStyle;
  center?: boolean;
}) {
  return <Text style={[textStyles[variant], center && styles.center, style]}>{children}</Text>;
}

export function Screen({
  title,
  back = true,
  scroll = false,
  children,
}: {
  title?: string;
  back?: boolean;
  scroll?: boolean;
  children: ReactNode;
}) {
  const body = scroll ? (
    <ScrollView contentContainerStyle={styles.scrollBody} indicatorStyle="black">
      {children}
    </ScrollView>
  ) : (
    <View style={styles.body}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      {(back || title) && (
        <View style={styles.header}>
          {back && (
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              hitSlop={16}
              accessibilityRole="button"
              accessibilityLabel="Back">
              <RText variant="body" style={{ color: palette.red40 }}>
                ‹ Back
              </RText>
            </Pressable>
          )}
          {title && <RText variant="title">{title}</RText>}
        </View>
      )}
      {body}
    </SafeAreaView>
  );
}

export function BigButton({
  label,
  sublabel,
  onPress,
  selected,
  compact,
  disabled,
}: {
  label: string;
  sublabel?: string;
  onPress: () => void;
  selected?: boolean;
  compact?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        (pressed || selected) && styles.buttonActive,
        disabled && styles.buttonDisabled,
      ]}>
      <RText variant={compact ? 'body' : 'large'} center>
        {label}
      </RText>
      {sublabel && (
        <RText variant="dim" center>
          {sublabel}
        </RText>
      )}
    </Pressable>
  );
}

export function Row({ children, gap = 12 }: { children: ReactNode; gap?: number }) {
  return <View style={[styles.row, { gap }]}>{children}</View>;
}

/** −  value  +  — used instead of native pickers/sliders, which render in system colors. */
export function Stepper({
  label,
  value,
  onDecrement,
  onIncrement,
}: {
  label: string;
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <RText variant="dim">{label}</RText>
      <View style={styles.stepperControls}>
        <StepperButton symbol="−" label={`Decrease ${label}`} onPress={onDecrement} />
        <RText variant="large" style={styles.stepperValue} center>
          {value}
        </RText>
        <StepperButton symbol="+" label={`Increase ${label}`} onPress={onIncrement} />
      </View>
    </View>
  );
}

function StepperButton({ symbol, label, onPress }: { symbol: string; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.stepperButton, pressed && styles.buttonActive]}>
      <RText variant="large" center>
        {symbol}
      </RText>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.stepper}>
      <RText variant="dim">{label}</RText>
      <Row gap={8}>
        {options.map((o) => (
          <View key={o.value} style={styles.flex}>
            <BigButton compact label={o.label} selected={o.value === value} onPress={() => onChange(o.value)} />
          </View>
        ))}
      </Row>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const textStyles = StyleSheet.create({
  hero: { color: palette.red70, fontSize: type.hero, fontWeight: '200', fontVariant: ['tabular-nums'] },
  title: { color: palette.red70, fontSize: type.title, fontWeight: '300' },
  large: { color: palette.red70, fontSize: type.large, fontWeight: '400' },
  body: { color: palette.red70, fontSize: type.body, lineHeight: 28 },
  dim: { color: palette.red40, fontSize: type.body, lineHeight: 28 },
  small: { color: palette.red40, fontSize: type.small, lineHeight: 22 },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.black },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  body: { flex: 1, padding: 20, gap: 16 },
  scrollBody: { padding: 20, gap: 16, paddingBottom: 48 },
  center: { textAlign: 'center' },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  button: {
    borderWidth: 1.5,
    borderColor: palette.red40,
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 16,
    backgroundColor: palette.black,
    justifyContent: 'center',
    gap: 4,
  },
  buttonCompact: { paddingVertical: 14, borderRadius: 14 },
  buttonActive: { backgroundColor: palette.red20, borderColor: palette.red70 },
  buttonDisabled: { opacity: 0.4 },
  stepper: { gap: 8 },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepperButton: {
    width: 64,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: palette.red40,
    justifyContent: 'center',
  },
  stepperValue: { flex: 1 },
  divider: { height: 1, backgroundColor: palette.red20, marginVertical: 8 },
});
