const colorCache = new Map<string, { background: string; textColor: string }>();

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getUserColor(username: string): {
  background: string;
  textColor: string;
} {
  if (colorCache.has(username)) {
    return colorCache.get(username)!;
  }

  const hash = hashString(username);
  const hue = hash % 280;
  const saturation = 35 + (hash % 16);
  const lightness = 85 + (hash % 8);
  const background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const textSaturation = 50 + (hash % 16);
  const textLightness = 25 + (hash % 11);
  const textColor = `hsl(${hue}, ${textSaturation}%, ${textLightness}%)`;
  
  const result = { background, textColor };
  colorCache.set(username, result);
  return result;
}
