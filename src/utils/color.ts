/**
 * Map a Polish/English color label to a UI swatch hex color.
 */
export const getColorHex = (colorName?: string): string => {
  if (!colorName) return '#8B5CF6';
  const c = colorName.toLowerCase();
  if (c.includes('fiolet')) return '#7C3AED';
  if (c.includes('czarn')) return '#18181B';
  if (c.includes('biał')) return '#FFFFFF';
  if (c.includes('szar')) return '#94A3B8';
  if (c.includes('srebrn')) return '#CBD5E1';
  return '#8B5CF6';
};
