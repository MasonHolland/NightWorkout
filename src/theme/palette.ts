/**
 * The ONLY colors this app is allowed to draw.
 *
 * Every value has zero green and zero blue. On an OLED iPhone that means only
 * the red subpixels ever light up, and black pixels are fully off.
 * `npm test` (scripts/check-palette.mjs) fails if any other color literal
 * appears anywhere in src/ or app.json.
 */
export const palette = {
  black: '#000000',
  red100: '#FF0000', // reserved for small accents only
  red70: '#B00000', // primary text
  red40: '#660000', // secondary text, borders
  red20: '#330000', // pressed / selected fills
} as const;

export const type = {
  hero: 72,
  title: 34,
  large: 26,
  body: 20,
  small: 16,
} as const;
