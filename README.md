# NightWorkout

A red-light iOS app for parents up at night with a newborn: gentle guided movement, a feed timer that nudges you to stay awake, and a haptic walking metronome for settling laps.

## Red-light rules
- Every color lives in `src/theme/palette.ts` and is pure red (`#RR0000`) or black. On OLED iPhones (X and later, all 12+), only the red subpixels light up.
- `npm test` fails if any other color literal appears in `src/` or `app.json`.
- The app dims the screen to the Settings brightness (default 10%) while open and restores yours when you leave.
- No native alerts, pickers, or keyboard. They render in system colors.
- Onboarding (`/setup`) walks through iOS Color Filters, Reduce White Point and the Accessibility Shortcut, so notifications and Control Center are red too.

## Develop (from Windows)
```bash
npm install
npx expo start          # scan the QR code with Expo Go on your iPhone
npm test                # red-light palette check
npm run typecheck
npx expo lint
npm run icons           # regenerate the red moon icons
```
To release: `npx eas-cli@latest build -p ios` and then `submit` (requires an Apple Developer account).
