/**
 * Returns up to two-letter initials from a name: first letter of the first
 * word + first letter of the last word, both uppercased.
 *
 *   "Sarah Johnson"          → "SJ"
 *   "Sarah Marie Johnson"    → "SJ"
 *   "karen"                  → "K"
 *   ""  /  null  /  "   "    → "?"
 */
export const getInitials = (name: string | null | undefined): string => {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  const first = words[0].charAt(0);
  const last = words[words.length - 1].charAt(0);
  return (first + last).toUpperCase();
};
