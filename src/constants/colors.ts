/**
 * 앱 전역 색상 정의 (라이트/다크 테마)
 */

const palette = {
  // Brand
  primary: "#007AFF",
  primaryLight: "#4DA3FF",
  primaryDark: "#0051A8",
  secondary: "#5856D6",

  // Status
  success: "#34C759",
  warning: "#FF9500",
  error: "#FF3B30",
  info: "#007AFF",

  // Fixed
  white: "#FFFFFF",
  black: "#000000",
};

export type ThemeColors = typeof lightTheme;

export const lightTheme = {
  ...palette,

  background: "#F5F5F5",
  card: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#666666",
  textTertiary: "#8E8E93",
  border: "#E0E0E0",
  inputBg: "#F0F0F0",
  lightGray: "#E5E5EA",
  gray: "#8E8E93",
  disabled: "#A0A0A0",
  shadow: "rgba(0, 0, 0, 0.1)",

  // 컴포넌트별
  cardBorder: "#E0E0E0",
  overlay: "rgba(0, 0, 0, 0.5)",
  progressBg: "#E5E5EA",
  tagBg: "#F0F0F0",
  selectedBg: "rgba(0, 122, 255, 0.08)",
  selectedBorder: "rgba(0, 122, 255, 0.25)",
  correctBg: "rgba(52, 199, 89, 0.1)",
  wrongBg: "rgba(255, 59, 48, 0.1)",
  highlightBg: "rgba(88, 86, 214, 0.08)",
};

export const darkTheme: ThemeColors = {
  ...palette,

  background: "#0f172a",
  card: "#1e293b",
  text: "#F5F5F5",
  textSecondary: "#94a3b8",
  textTertiary: "#64748b",
  border: "#334155",
  inputBg: "rgba(30, 41, 59, 0.6)",
  lightGray: "#334155",
  gray: "#64748b",
  disabled: "#475569",
  shadow: "rgba(0, 0, 0, 0.3)",

  // 컴포넌트별
  cardBorder: "#334155",
  overlay: "rgba(0, 0, 0, 0.7)",
  progressBg: "rgba(71, 85, 105, 0.5)",
  tagBg: "rgba(30, 41, 59, 0.8)",
  selectedBg: "rgba(0, 122, 255, 0.15)",
  selectedBorder: "rgba(0, 122, 255, 0.4)",
  correctBg: "rgba(52, 199, 89, 0.15)",
  wrongBg: "rgba(255, 59, 48, 0.15)",
  highlightBg: "rgba(88, 86, 214, 0.15)",
};

/** @deprecated 하위 호환용 — useTheme() 사용 권장 */
export const COLORS = lightTheme;
