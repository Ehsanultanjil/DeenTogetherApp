// Fixed avatar set, shipped inside the app bundle itself — every install
// has the same images, so a preset picked by one family member renders
// correctly on everyone else's device without needing image hosting.
// `avatar_url` stores just the preset id (e.g. "preset:male-3"); resolve it
// back to the bundled asset via AVATAR_PRESETS before handing it to <Image>.
export const AVATAR_PRESETS = [
  { id: 'male-1', source: require('../assets/avatars/male/male-1.png') },
  { id: 'male-2', source: require('../assets/avatars/male/male-2.png') },
  { id: 'male-3', source: require('../assets/avatars/male/male-3.png') },
  { id: 'male-4', source: require('../assets/avatars/male/male-4.png') },
  { id: 'male-5', source: require('../assets/avatars/male/male-5.png') },
  { id: 'male-6', source: require('../assets/avatars/male/male-6.png') },
  { id: 'female-1', source: require('../assets/avatars/female/female-1.png') },
  { id: 'female-2', source: require('../assets/avatars/female/female-2.png') },
  { id: 'female-3', source: require('../assets/avatars/female/female-3.png') },
  { id: 'female-4', source: require('../assets/avatars/female/female-4.png') },
  { id: 'female-5', source: require('../assets/avatars/female/female-5.png') },
  { id: 'female-6', source: require('../assets/avatars/female/female-6.png') },
] as const;

export type AvatarPresetId = (typeof AVATAR_PRESETS)[number]['id'];

const PRESET_PREFIX = 'preset:';

export function toAvatarPresetValue(id: AvatarPresetId): string {
  return `${PRESET_PREFIX}${id}`;
}

// `avatar_url` can be either a preset id or (legacy/OAuth) a real remote
// URL — resolve to a local require() for the former, pass the URL through
// for the latter, or null when there's nothing to show.
export function resolveAvatarSource(avatarUrl: string | null | undefined) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith(PRESET_PREFIX)) {
    const id = avatarUrl.slice(PRESET_PREFIX.length);
    const preset = AVATAR_PRESETS.find((p) => p.id === id);
    return preset ? preset.source : null;
  }
  return { uri: avatarUrl };
}
