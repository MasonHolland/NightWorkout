/**
 * Every move is described by how long it lasts and how often to tap.
 * Rep moves tap once per rep; timed moves tap every few seconds so the
 * parent knows the routine is still running without looking.
 */
export type Move = {
  name: string;
  cue: string;
  seconds: number;
  tapEvery: number;
  reps?: number;
};

export type Routine = {
  id: string;
  name: string;
  description: string;
  moves: Move[];
};

const reps = (name: string, cue: string, count: number, secondsPerRep: number): Move => ({
  name,
  cue,
  reps: count,
  seconds: count * secondsPerRep,
  tapEvery: secondsPerRep,
});

const hold = (name: string, cue: string, seconds: number, tapEvery = 5): Move => ({
  name,
  cue,
  seconds,
  tapEvery,
});

export const REST_SECONDS = 5;

export const routines: Routine[] = [
  {
    id: 'holding',
    name: 'Holding baby',
    description: 'Slow, steady moves you can do with baby in your arms.',
    moves: [
      hold('Gentle sway', 'Shift your weight side to side.', 60, 10),
      reps('Calf raises', 'Rise onto your toes, lower slowly.', 15, 3),
      reps('Mini squats', 'Small, slow knee bends. Keep baby close.', 10, 4),
      reps('Shoulder rolls', 'Roll your shoulders back and down.', 10, 4),
      hold('March in place', 'Soft steps, knees up a little.', 60, 5),
      reps('Heel-toe rock', 'Rock from heels to toes and back.', 12, 3),
    ],
  },
  {
    id: 'wakeup',
    name: 'Quick wake-up',
    description: 'Hands free, baby settled. About four minutes.',
    moves: [
      hold('March in place', 'Lift your knees and swing your arms.', 45, 5),
      reps('Wall push-ups', 'Hands on the wall, lower your chest slowly.', 12, 3),
      reps('Squats', 'Sit back like into a chair, stand tall.', 12, 3),
      reps('Side bends', 'Reach one arm over, then the other.', 10, 3),
      hold('Arm circles', 'Small circles, then bigger.', 30, 5),
      reps('Calf raises', 'Up onto your toes, slow and controlled.', 20, 2),
    ],
  },
  {
    id: 'stretch',
    name: 'Gentle stretch',
    description: 'Loosen a stiff neck and back from feeding.',
    moves: [
      reps('Neck tilts', 'Ear toward shoulder, switch sides.', 6, 5),
      reps('Shoulder rolls', 'Big slow circles backwards.', 10, 4),
      hold('Chest opener', 'Clasp hands behind you, lift gently.', 30),
      hold('Forward reach', 'Soft knees, let your arms hang down.', 30),
      reps('Hip circles', 'Hands on hips, slow circles.', 10, 4),
      reps('Tall reach', 'Reach up high, then relax.', 6, 5),
    ],
  },
];

/** Short prompts used by the feed timer's nudges. */
export const quickMoves = [
  'Roll your shoulders 5 times',
  'Point and flex your feet 10 times',
  'Sit up tall and stretch your neck',
  'Squeeze your hands into fists 10 times',
  'Wiggle your toes and tap your heels',
  'Take three slow, deep breaths',
  'Press your shoulder blades together 5 times',
];
