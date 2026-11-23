// Records the README screenshots and demo video into docs/media/.
// Usage: npm run media            (both)
//        npm run media -- --only shots | --only video
// The browser clock is set to 2:41 am and the timers are fast-forwarded where waiting would be dull.
import { devServer, launch, wait, tap, shot, startRecording, encode, ROOT, OUT, only } from './lib.mjs';

const URL = 'http://localhost:8082/';
const stopServer = await devServer(URL, 'npx expo start --web --port 8082', { cwd: ROOT, env: { CI: '1' } });

const NOW = new Date('2026-11-24T02:41:00-08:00');
const at = (h, m) =>
  new Date(`2026-11-${h >= 12 ? 23 : 24}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00-08:00`).getTime();
// Earlier tonight, so the home screen and feed list have something in them.
const sessions = [
  { kind: 'feed', startedAt: at(0, 52), endedAt: at(1, 14), side: 'left' },
  { kind: 'walk', startedAt: at(23, 40), endedAt: at(23, 52), steps: 940 },
  { kind: 'feed', startedAt: at(22, 31), endedAt: at(22, 49), side: 'right' },
  { kind: 'move', startedAt: at(21, 10), endedAt: at(21, 16), routine: 'Holding baby' },
  { kind: 'feed', startedAt: at(20, 5), endedAt: at(20, 25), side: 'left' },
];
const settings = { brightness: 0.1, nudgeMinutes: 10, hapticStrength: 'medium', walkPace: 80, onboarded: true };

async function open() {
  const s = await launch({
    colorScheme: 'dark',
    timezoneId: 'America/Los_Angeles',
    // Red-only app, so the tap indicator is red too.
    extraCss: '.__tap{background:rgba(255,0,0,.28)!important;border-color:rgba(255,0,0,.7)!important;box-shadow:none!important}',
  });
  await s.page.clock.install({ time: NOW });
  await s.context.addInitScript(([st, se]) => {
    if (sessionStorage.getItem('__seeded')) return;
    sessionStorage.setItem('__seeded', '1');
    localStorage.setItem('nightworkout.settings.v1', JSON.stringify(st));
    localStorage.setItem('nightworkout.sessions.v1', JSON.stringify(se));
  }, [settings, sessions]);
  await s.page.goto(URL);
  await wait(s.page, 4000);
  return s;
}
const btn = (page, name) => page.getByRole('button', { name }).filter({ visible: true }).first();

try {
  if (only('shots')) {
    const { browser, page } = await open();
    await shot(page, `${OUT}/01-home.png`);
    await btn(page, /Feed timer/).click(); await wait(page, 1200);
    await shot(page, `${OUT}/02-feed-timer.png`);
    await btn(page, /^Right$/).click();
    await btn(page, /^Start$/).click(); await wait(page, 500);
    await page.clock.fastForward('10:00');
    await page.clock.fastForward('00:43'); await wait(page, 1200);
    await shot(page, `${OUT}/03-feed-nudge.png`);
    await btn(page, /^Stop$/).click(); await wait(page, 500);
    await page.goto(URL + 'move'); await wait(page, 2500);
    await shot(page, `${OUT}/04-move-routines.png`);
    await btn(page, /Holding baby/).click(); await wait(page, 500);
    // runFor fires every 1 s tick (fastForward fires each timer only once).
    await page.clock.runFor('00:05');
    await btn(page, /^Skip$/).click(); await wait(page, 300);
    await page.clock.runFor('00:16'); await wait(page, 1200);
    await shot(page, `${OUT}/05-move-active.png`);
    await page.goto(URL + 'walk'); await wait(page, 2500);
    await shot(page, `${OUT}/06-walk.png`);
    await page.goto(URL + 'setup'); await wait(page, 2500);
    await shot(page, `${OUT}/07-setup.png`);
    await browser.close();
  }

  if (only('video')) {
    const { browser, page } = await open();
    const rec = await startRecording(page);
    await wait(page, 1500);
    // Feed timer: pick a side, start, then jump ahead to the first stay-awake nudge.
    await tap(page, btn(page, /Feed timer/)); await wait(page, 1400);
    await tap(page, btn(page, /^Right$/)); await wait(page, 600);
    await tap(page, btn(page, /^Start$/)); await wait(page, 2500);
    await page.clock.fastForward('09:55'); await wait(page, 2200);
    await page.clock.fastForward('00:05'); await wait(page, 3500);
    await tap(page, btn(page, /^Stop$/)); await wait(page, 1500);
    await tap(page, btn(page, /^Back$/)); await wait(page, 1000);
    // Move: rest countdown, then the first move; skip to the reps.
    await tap(page, btn(page, /^Move/)); await wait(page, 1500);
    await tap(page, btn(page, /Holding baby/)); await wait(page, 8100);
    await tap(page, btn(page, /^Skip$/)); await wait(page, 10300);
    await tap(page, btn(page, /^Stop$/)); await wait(page, 900);
    await tap(page, btn(page, /^Back$/)); await wait(page, 1000);
    // Walk: set the metronome pace.
    await tap(page, btn(page, /^Walk/)); await wait(page, 1300);
    for (let i = 0; i < 2; i++) {
      await tap(page, btn(page, /^Increase Pace/)); await wait(page, 500);
    }
    await wait(page, 1200);
    await tap(page, btn(page, /^Back$/)); await wait(page, 1000);
    // Settings: dim the screen a little more.
    await tap(page, btn(page, /^Settings$/).or(page.getByText('Settings', { exact: true })).first()); await wait(page, 1500);
    await tap(page, btn(page, /^Decrease Screen brightness/)); await wait(page, 600);
    await tap(page, btn(page, /^Decrease Screen brightness/)); await wait(page, 1500);
    const frames = await rec.stop();
    await browser.close();
    encode(frames, OUT, 'demo', { posterAt: 0.2 });
  }
} finally {
  await stopServer();
}
