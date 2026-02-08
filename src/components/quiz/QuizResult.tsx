import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import type { ThemeColors } from "../../constants/colors";

export default function QuizResultView({ total, correct, onRetry, onBack }) {
  const c = useTheme();
  const s = makeStyles(c);

  const percentage = Math.round((correct / total) * 100);

  const getMessage = () => {
    if (percentage === 100) return { text: "완벽합니다! 🎉", color: c.success };
    if (percentage >= 80) return { text: "훌륭해요! 👏", color: c.success };
    if (percentage >= 60) return { text: "잘했어요! 💪", color: c.warning };
    if (percentage >= 40)
      return { text: "조금 더 노력해봐요! 📖", color: c.warning };
    return { text: "다시 도전해보세요! 🔥", color: c.error };
  };

  const message = getMessage();
  const scaleAnim = new Animated.Value(0.9);

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 5,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[s.container, { transform: [{ scale: scaleAnim }] }]}
    >
      <View style={s.trophyContainer}>
        <View style={s.trophyBox}>
          <Ionicons
            name='trophy'
            size={40}
            color={percentage >= 60 ? c.warning : c.textTertiary}
          />
        </View>
      </View>

      <Text style={[s.messageText, { color: message.color }]}>
        {message.text}
      </Text>

      <View style={s.scoreContainer}>
        <Text style={s.scoreValue}>{percentage}%</Text>
        <Text style={s.scoreLabel}>
          {total}문제 중 {correct}개 정답
        </Text>
      </View>

      <View style={s.buttonContainer}>
        <TouchableOpacity onPress={onBack} style={s.backButton}>
          <Ionicons name='arrow-back' size={16} color={c.textSecondary} />
          <Text style={s.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRetry} style={s.retryButton}>
          <Ionicons name='refresh' size={16} color={c.white} />
          <Text style={s.retryButtonText}>다시 풀기</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      paddingVertical: 32,
    },
    trophyContainer: {
      marginBottom: 16,
    },
    trophyBox: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: c.tagBg,
      borderWidth: 1,
      borderColor: c.progressBg,
      justifyContent: "center",
      alignItems: "center",
    },
    messageText: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 16,
    },
    scoreContainer: {
      backgroundColor: c.tagBg,
      borderRadius: 16,
      paddingHorizontal: 24,
      paddingVertical: 24,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: c.progressBg,
      alignItems: "center",
    },
    scoreValue: {
      fontSize: 48,
      fontWeight: "bold",
      color: c.text,
      marginBottom: 8,
    },
    scoreLabel: {
      fontSize: 14,
      color: c.textSecondary,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
      maxWidth: 280,
    },
    backButton: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: c.progressBg,
      backgroundColor: c.card,
    },
    backButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: c.textSecondary,
    },
    retryButton: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: c.success,
    },
    retryButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: c.white,
    },
  });
