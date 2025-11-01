// Haptic feedback utility for mobile devices
export function vibrate(pattern = 10) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

export const HAPTIC_PATTERNS = {
  LIGHT: 10,
  MEDIUM: 20,
  STRONG: 30,
  SUCCESS: [10, 10, 10],
  ERROR: 50
}

