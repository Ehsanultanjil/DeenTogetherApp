// RN doesn't fake bold/weight for custom font files the way it does for the
// system font, so each Tailwind font-weight utility must resolve to the
// actual weight-specific font file — parsed straight off the incoming
// className string since that's a static value at each call site.
export const FONT_BY_WEIGHT = {
  bn: {
    400: 'HindSiliguri_400Regular',
    500: 'HindSiliguri_500Medium',
    600: 'HindSiliguri_600SemiBold',
    700: 'HindSiliguri_700Bold',
    800: 'HindSiliguri_700Bold', // no ExtraBold cut for this family
  },
  en: {
    400: 'PlusJakartaSans_400Regular',
    500: 'PlusJakartaSans_500Medium',
    600: 'PlusJakartaSans_600SemiBold',
    700: 'PlusJakartaSans_700Bold',
    800: 'PlusJakartaSans_800ExtraBold',
  },
} as const;

export function weightFromClassName(className?: string): 400 | 500 | 600 | 700 | 800 {
  if (!className) return 400;
  if (/(^|\s)font-extrabold(\s|$)/.test(className)) return 800;
  if (/(^|\s)font-bold(\s|$)/.test(className)) return 700;
  if (/(^|\s)font-semibold(\s|$)/.test(className)) return 600;
  if (/(^|\s)font-medium(\s|$)/.test(className)) return 500;
  return 400;
}
