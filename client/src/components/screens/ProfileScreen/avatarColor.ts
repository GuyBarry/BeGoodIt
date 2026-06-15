const COLOR_SCHEME_PREFIX = 'color:';

export const AVATAR_PALETTE = [
  '#c86432', // orange — theme primary
  '#d49a6a', // warm beige
  '#b76e79', // rose
  '#e8a5b5', // pink
  '#a59ed8', // lavender
  '#7fb3d3', // sky blue
  '#5fae9c', // teal
  '#8fc8a3', // mint
  '#e8c66b', // yellow
  '#6c7b8c', // slate
] as const;

export type AvatarColor = typeof AVATAR_PALETTE[number];

export const colorChoiceValue = (hex: string): string => `${COLOR_SCHEME_PREFIX}${hex}`;

export const parseColorChoice = (value: string | null | undefined): string | null => {
  if (!value || !value.startsWith(COLOR_SCHEME_PREFIX)) return null;
  return value.slice(COLOR_SCHEME_PREFIX.length);
};
