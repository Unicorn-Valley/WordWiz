import { useColorScheme } from "react-native";
import { lightTheme, darkTheme, type ThemeColors } from "../constants/colors";

/**
 * 시스템 색상 모드에 따라 테마 색상을 반환
 */
export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkTheme : lightTheme;
}
