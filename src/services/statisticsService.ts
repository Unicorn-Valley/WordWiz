import { supabase } from "../config/supabase";
import { UserStatistics } from "../types/database.types";

/**
 * 사용자 통계 API 서비스
 */
class StatisticsService {
  /**
   * 현재 사용자의 학습 통계 조회
   */
  async getUserStatistics(): Promise<UserStatistics | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("인증이 필요합니다.");
    }

    const { data, error } = await supabase
      .from("user_statistics")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // 통계가 아직 없는 경우 (첫 사용자)
      if (error.code === "PGRST116") {
        return this.initializeUserStatistics();
      }
      console.error("사용자 통계 조회 실패:", error);
      throw new Error("통계를 불러오는데 실패했습니다.");
    }

    return data;
  }

  /**
   * 사용자 통계 초기화 (첫 로그인 시)
   */
  async initializeUserStatistics(): Promise<UserStatistics> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("인증이 필요합니다.");
    }

    const { data, error } = await supabase
      .from("user_statistics")
      .insert({
        user_id: user.id,
        total_words: 0,
        bookmarked_words: 0,
        mastered_words: 0,
        quizzes_completed: 0,
        total_quiz_score_percentage: 0,
        average_word_mastery: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("통계 초기화 실패:", error);
      throw new Error("통계 초기화에 실패했습니다.");
    }

    return data;
  }

  /**
   * 학습 대시보드 데이터 조회
   */
  async getDashboardData() {
    const stats = await this.getUserStatistics();

    if (!stats) {
      return {
        totalWords: 0,
        bookmarkedWords: 0,
        masteredWords: 0,
        learningWords: 0,
        quizzesCompleted: 0,
        averageScore: 0,
        averageMastery: 0,
        lastStudied: null,
      };
    }

    return {
      totalWords: stats.total_words,
      bookmarkedWords: stats.bookmarked_words,
      masteredWords: stats.mastered_words,
      learningWords: stats.total_words - stats.mastered_words,
      quizzesCompleted: stats.quizzes_completed,
      averageScore: Math.round(stats.total_quiz_score_percentage),
      averageMastery: Math.round(stats.average_word_mastery),
      lastStudied: stats.last_studied_at,
    };
  }

  /**
   * 학습 진행률 계산
   */
  async getLearningProgress() {
    const stats = await this.getUserStatistics();

    if (!stats || stats.total_words === 0) {
      return {
        totalWords: 0,
        masteredWords: 0,
        progressPercentage: 0,
      };
    }

    const progressPercentage = Math.round(
      (stats.mastered_words / stats.total_words) * 100,
    );

    return {
      totalWords: stats.total_words,
      masteredWords: stats.mastered_words,
      progressPercentage,
    };
  }

  /**
   * 학습 스트릭 계산 (연속 학습 일수)
   * Note: 이 기능을 위해서는 매일 학습 기록이 필요합니다.
   * 현재는 간단한 버전으로 구현
   */
  async getStudyStreak() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("인증이 필요합니다.");
    }

    // 최근 퀴즈 결과 조회 (날짜별)
    const { data, error } = await supabase
      .from("quiz_results")
      .select("completed_at")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
      };
    }

    // 날짜별로 그룹화
    const uniqueDates = new Set(
      data.map((quiz) => new Date(quiz.completed_at).toDateString()),
    );

    const dates = Array.from(uniqueDates)
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    // 현재 스트릭 계산
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
      const date = new Date(dates[i]);
      date.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === i) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      currentStreak,
      longestStreak: dates.length, // 간단한 구현
      lastStudyDate: dates[0].toISOString(),
    };
  }
}

export const statisticsService = new StatisticsService();
