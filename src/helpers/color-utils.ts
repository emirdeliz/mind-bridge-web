/**
 * Color utility functions for generating theme color palettes
 */

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (
  hex: string
): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Convert RGB to hex color
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Lighten a color by a percentage
 */
export const lightenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent / 100;
  return rgbToHex(
    rgb.r + (255 - rgb.r) * factor,
    rgb.g + (255 - rgb.g) * factor,
    rgb.b + (255 - rgb.b) * factor
  );
};

/**
 * Darken a color by a percentage
 */
export const darkenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - percent / 100;
  return rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor);
};

/**
 * Generate a complete color palette from a primary color
 * Returns an object with shades from 50 to 900, plus light, dark, and hover variants
 */
export const generateColorPalette = (primaryColor: string) => {
  return {
    // Light shades (higher number = more of the primary color mixed in)
    50: lightenColor(primaryColor, 95),
    100: lightenColor(primaryColor, 90),
    200: lightenColor(primaryColor, 75),
    300: lightenColor(primaryColor, 55),
    400: lightenColor(primaryColor, 30),
    // Base color
    500: primaryColor,
    // Dark shades
    600: darkenColor(primaryColor, 10),
    700: darkenColor(primaryColor, 25),
    800: darkenColor(primaryColor, 40),
    900: darkenColor(primaryColor, 55),
    // Named variants
    light: lightenColor(primaryColor, 90),
    dark: darkenColor(primaryColor, 25),
    hover: darkenColor(primaryColor, 15),
  };
};

/**
 * Apply theme colors to CSS variables on the document root
 */
export const applyThemeColors = (primaryColor: string): void => {
  const palette = generateColorPalette(primaryColor);
  const root = document.documentElement;

  // Apply primary color and its hover variant
  root.style.setProperty('--primary', primaryColor);
  root.style.setProperty('--primary-hover', palette.hover);
  root.style.setProperty('--primary-light', palette.light);
  root.style.setProperty('--primary-dark', palette.dark);

  // Apply all shade variants
  root.style.setProperty('--primary-50', palette[50]);
  root.style.setProperty('--primary-100', palette[100]);
  root.style.setProperty('--primary-200', palette[200]);
  root.style.setProperty('--primary-300', palette[300]);
  root.style.setProperty('--primary-400', palette[400]);
  root.style.setProperty('--primary-500', palette[500]);
  root.style.setProperty('--primary-600', palette[600]);
  root.style.setProperty('--primary-700', palette[700]);
  root.style.setProperty('--primary-800', palette[800]);
  root.style.setProperty('--primary-900', palette[900]);
};
