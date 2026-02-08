import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../hooks/useTheme";
import type { ThemeColors } from "../../constants/colors";
import { statisticsService, quizService } from "../../services";

const { width } = Dimensions.get("window");
const PADDING = 20;
const GAP = 12;
const STAT_CARD_WIDTH = (width - PADDING * 2 - GAP) / 2;

export const HomeScreen: React.FC = () => {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [quizTrend, setQuizTrend] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [dashData, streakData, trendData] = await Promise.all([
        statisticsService.getDashboardData(),
        statisticsService.getStudyStreak(),
        quizService.getRecentQuizTrend(5),
      ]);
      setDashboard(dashData);
      setStreak(streakData);
      setQuizTrend(trendData);
    } catch (error) {
      console.error("Dashboard load error:", error);
    }
  }, []);

  useEffect(() => {
    loadData().finally(() => setIsLoading(false));
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const totalWords = dashboard?.totalWords ?? 0;
  const masteredWords = dashboard?.masteredWords ?? 0;
  const progress = totalWords > 0 ? masteredWords / totalWords : 0;

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* 인사 헤더 */}
      <View style={s.header}>
        <Text style={s.greeting}>환영합니다!</Text>
        <Text style={s.userName}>{user?.name || user?.email}</Text>
      </View>

      {/* 학습 스트릭 */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={[s.cardIcon, { backgroundColor: "rgba(255, 149, 0, 0.12)" }]}>
            <Ionicons name="flame-outline" size={18} color={c.warning} />
          </View>
          <Text style={s.cardTitle}>학습 스트릭</Text>
        </View>
        <View style={s.streakRow}>
          <View style={s.streakItem}>
            <Text style={s.streakNumber}>{streak?.currentStreak ?? 0}</Text>
            <Text style={s.streakUnit}>일</Text>
            <Text style={s.streakLabel}>현재 연속</Text>
          </View>
          <View style={s.streakDivider} />
          <View style={s.streakItem}>
            <Text style={s.streakNumber}>{streak?.longestStreak ?? 0}</Text>
            <Text style={s.streakUnit}>일</Text>
            <Text style={s.streakLabel}>최장 기록</Text>
          </View>
        </View>
      </View>

      {/* 학습 진행률 */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={[s.cardIcon, { backgroundColor: "rgba(52, 199, 89, 0.12)" }]}>
            <Ionicons name="trending-up-outline" size={18} color={c.success} />
          </View>
          <Text style={s.cardTitle}>학습 진행률</Text>
        </View>
        <View style={s.progressSection}>
          <View style={s.progressBarBg}>
            <View
              style={[
                s.progressBarFill,
                { width: `${Math.round(progress * 100)}%` },
              ]}
            />
          </View>
          <Text style={s.progressText}>
            {masteredWords} / {totalWords} 단어 마스터 ({Math.round(progress * 100)}%)
          </Text>
        </View>
      </View>

      {/* 통계 그리드 (2x2) */}
      <View style={s.statsGrid}>
        <StatCard s={s} icon="book-outline" color={c.primary} value={totalWords} label="전체 단어" />
        <StatCard s={s} icon="checkmark-circle-outline" color={c.success} value={masteredWords} label="마스터" />
        <StatCard s={s} icon="bookmark-outline" color={c.warning} value={dashboard?.bookmarkedWords ?? 0} label="북마크" />
        <StatCard s={s} icon="bulb-outline" color={c.secondary} value={dashboard?.quizzesCompleted ?? 0} label="퀴즈 완료" />
      </View>

      {/* 최근 퀴즈 성적 */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={[s.cardIcon, { backgroundColor: "rgba(0, 122, 255, 0.12)" }]}>
            <Ionicons name="bar-chart-outline" size={18} color={c.primary} />
          </View>
          <Text style={s.cardTitle}>최근 퀴즈 성적</Text>
        </View>
        {quizTrend.length === 0 ? (
          <Text style={s.emptyText}>아직 퀴즈 기록이 없습니다</Text>
        ) : (
          <View style={s.quizList}>
            {quizTrend.map((quiz: any, index: number) => {
              const score = quiz.score_percentage ?? 0;
              const barColor =
                score >= 80 ? c.success : score >= 50 ? c.warning : c.error;
              const typeLabel =
                quiz.quiz_type === "multiple_choice"
                  ? "객관식"
                  : quiz.quiz_type === "fill_blank"
                    ? "주관식"
                    : "매칭";

              return (
                <View key={index} style={s.quizItem}>
                  <View style={s.quizInfo}>
                    <Text style={s.quizType}>{typeLabel}</Text>
                    <Text style={s.quizDate}>
                      {new Date(quiz.completed_at).toLocaleDateString("ko-KR")}
                    </Text>
                  </View>
                  <View style={s.quizScoreRow}>
                    <View style={s.quizBarBg}>
                      <View
                        style={[
                          s.quizBarFill,
                          { width: `${score}%`, backgroundColor: barColor },
                        ]}
                      />
                    </View>
                    <Text style={s.quizScore}>{score}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// --- 통계 카드 서브 컴포넌트 ---
const StatCard: React.FC<{
  s: ReturnType<typeof makeStyles>;
  icon: string;
  color: string;
  value: number;
  label: string;
}> = ({ s, icon, color, value, label }) => (
  <View style={s.statCard}>
    <View style={[s.statIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon as any} size={22} color={color} />
    </View>
    <Text style={s.statValue}>{value}</Text>
    <Text style={s.statLabel}>{label}</Text>
  </View>
);

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    content: {
      padding: PADDING,
      paddingBottom: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: c.background,
    },

    // 인사 헤더
    header: {
      marginBottom: 24,
    },
    greeting: {
      fontSize: 28,
      fontWeight: "700",
      color: c.text,
      marginBottom: 4,
    },
    userName: {
      fontSize: 15,
      color: c.textSecondary,
    },

    // 카드 공통
    card: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 18,
      marginBottom: 12,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 16,
    },
    cardIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: c.text,
    },

    // 스트릭
    streakRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    streakItem: {
      flex: 1,
      alignItems: "center",
    },
    streakNumber: {
      fontSize: 36,
      fontWeight: "700",
      color: c.text,
    },
    streakUnit: {
      fontSize: 14,
      color: c.textSecondary,
      marginTop: -2,
    },
    streakLabel: {
      fontSize: 12,
      color: c.gray,
      marginTop: 4,
    },
    streakDivider: {
      width: 1,
      height: 48,
      backgroundColor: c.border,
    },

    // 진행률
    progressSection: {
      gap: 10,
    },
    progressBarBg: {
      height: 10,
      backgroundColor: c.progressBg,
      borderRadius: 5,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: c.success,
      borderRadius: 5,
    },
    progressText: {
      fontSize: 13,
      color: c.textSecondary,
    },

    // 통계 그리드
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: GAP,
      marginBottom: 12,
    },
    statCard: {
      width: STAT_CARD_WIDTH,
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    statIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "700",
      color: c.text,
    },
    statLabel: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 4,
    },

    // 퀴즈 트렌드
    quizList: {
      gap: 14,
    },
    quizItem: {
      gap: 6,
    },
    quizInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    quizType: {
      fontSize: 13,
      fontWeight: "600",
      color: c.text,
    },
    quizDate: {
      fontSize: 12,
      color: c.gray,
    },
    quizScoreRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    quizBarBg: {
      flex: 1,
      height: 8,
      backgroundColor: c.progressBg,
      borderRadius: 4,
      overflow: "hidden",
    },
    quizBarFill: {
      height: "100%",
      borderRadius: 4,
    },
    quizScore: {
      fontSize: 13,
      fontWeight: "600",
      color: c.text,
      width: 40,
      textAlign: "right",
    },
    emptyText: {
      fontSize: 14,
      color: c.gray,
      textAlign: "center",
      paddingVertical: 16,
    },
  });
