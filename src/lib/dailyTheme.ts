// Daily rotating theme colors - changes based on day of week
const themeColors = [
  { name: 'lavender', hue: 270, saturation: 60, lightness: 65 },    // Sunday
  { name: 'soft-purple', hue: 262, saturation: 68, lightness: 58 }, // Monday
  { name: 'sky-blue', hue: 200, saturation: 80, lightness: 52 },    // Tuesday
  { name: 'mint-green', hue: 160, saturation: 55, lightness: 45 },  // Wednesday
  { name: 'coral', hue: 16, saturation: 85, lightness: 55 },        // Thursday
  { name: 'indigo', hue: 235, saturation: 70, lightness: 55 },      // Friday
  { name: 'peach', hue: 25, saturation: 90, lightness: 60 },        // Saturday
];

export function getDailyTheme() {
  const dayOfWeek = new Date().getDay();
  return themeColors[dayOfWeek];
}

export function getThemeHSL(variant: 'base' | 'light' | 'dark' | 'foreground' = 'base') {
  const theme = getDailyTheme();
  
  switch (variant) {
    case 'light':
      return `${theme.hue} ${theme.saturation}% 95%`;
    case 'dark':
      return `${theme.hue} ${theme.saturation}% 35%`;
    case 'foreground':
      return `${theme.hue} ${theme.saturation}% 98%`;
    default:
      return `${theme.hue} ${theme.saturation}% ${theme.lightness}%`;
  }
}

export function applyDailyTheme() {
  const theme = getDailyTheme();
  const root = document.documentElement;
  
  // Primary color variants
  root.style.setProperty('--familiar', `${theme.hue} ${theme.saturation}% ${theme.lightness}%`);
  root.style.setProperty('--familiar-50', `${theme.hue} ${theme.saturation}% 97%`);
  root.style.setProperty('--familiar-100', `${theme.hue} ${theme.saturation}% 94%`);
  root.style.setProperty('--familiar-200', `${theme.hue} ${theme.saturation}% 86%`);
  root.style.setProperty('--familiar-300', `${theme.hue} ${theme.saturation}% 74%`);
  root.style.setProperty('--familiar-400', `${theme.hue} ${theme.saturation}% 62%`);
  root.style.setProperty('--familiar-500', `${theme.hue} ${theme.saturation}% ${theme.lightness}%`);
  root.style.setProperty('--familiar-600', `${theme.hue} ${theme.saturation}% ${theme.lightness - 8}%`);
  root.style.setProperty('--familiar-700', `${theme.hue} ${theme.saturation}% ${theme.lightness - 15}%`);
  root.style.setProperty('--familiar-800', `${theme.hue} ${theme.saturation}% ${theme.lightness - 22}%`);
  root.style.setProperty('--familiar-900', `${theme.hue} ${theme.saturation}% ${theme.lightness - 30}%`);
  
  // Update primary & ring to match daily theme
  root.style.setProperty('--primary', `${theme.hue} ${theme.saturation}% ${theme.lightness}%`);
  root.style.setProperty('--ring', `${theme.hue} ${theme.saturation}% ${theme.lightness}%`);

  // Update purple gradient to match daily theme for the floating nav button
  root.style.setProperty('--purple-start', `${theme.hue} ${theme.saturation}% ${theme.lightness}%`);
  root.style.setProperty('--purple-end', `${Math.min(theme.hue + 18, 360)} ${Math.max(theme.saturation - 10, 40)}% ${Math.max(theme.lightness - 10, 35)}%`);
  
  return theme;
}
