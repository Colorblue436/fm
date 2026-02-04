// Daily rotating theme colors - changes based on day of week
const themeColors = [
  { name: 'coral', hue: 16, saturation: 85, lightness: 55 },      // Sunday
  { name: 'teal', hue: 174, saturation: 72, lightness: 45 },      // Monday  
  { name: 'violet', hue: 270, saturation: 65, lightness: 55 },    // Tuesday
  { name: 'emerald', hue: 152, saturation: 68, lightness: 42 },   // Wednesday
  { name: 'amber', hue: 38, saturation: 92, lightness: 50 },      // Thursday
  { name: 'rose', hue: 350, saturation: 75, lightness: 55 },      // Friday
  { name: 'sky', hue: 199, saturation: 89, lightness: 48 },       // Saturday
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
  
  // Update primary to match daily theme
  root.style.setProperty('--primary', `${theme.hue} ${theme.saturation}% ${theme.lightness}%`);
  
  return theme;
}
