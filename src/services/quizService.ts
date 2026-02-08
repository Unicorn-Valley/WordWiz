import { supabase } from "../config/supabase";
import {
  QuizResult,
  CreateQuizResultInput,
  WordQuizAnswer,
  CreateQuizAnswerInput,
} from "../types/database.types";

/**
 * 퀴즈 관련 API 서비스
 */
class QuizService {
  /**
   * 퀴즈 결과 저장
   */
  async createQuizResult(input: CreateQuizResultInput): Promise<QuizResult> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("인증이 필요합니다.");
    }

    const { data, error } = await supabase
      .from("quiz_results")
      .insert({
        user_id: user.id,
        quiz_type: input.quiz_type,
        total_questions: input.total_questions,
        correct_answers: input.correct_answers,
        score_percentage: input.score_percentage,
        difficulty: input.difficulty || "mixed",
      })
      .select()
      .single();

    if (error) {
      console.error("퀴즈 결과 저장 실패:", error);
      throw new Error("퀴즈 결과 저장에 실패했습니다.");
    }

    return data;
  }

  /**
   * 퀴즈 답안 기록 저장 (여러 개)
   */
  async createQuizAnswers(
    answers: CreateQuizAnswerInput[],
  ): Promise<WordQuizAnswer[]> {
    const { data, error } = await supabase
      .from("word_quiz_answers")
      .insert(answers)
      .select();

    if (error) {
      console.error("퀴즈 답안 저장 실패:", error);
      throw new Error("퀴즈 답안 저장에 실패했습니다.");
    }

    return data || [];
  }

  /**
   * 사용자의 퀴즈 결과 조회
   */
  async getQuizResults(limit: number = 20): Promise<QuizResult[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("인증이 필요합니다.");
    }

    const { data, error } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("퀴즈 결과 조회 실패:", error);
      throw new Error("퀴즈 결과를 불러오는데 실패했습니다.");
    }

    return data || [];
  }

  /**
   * 특정 퀴즈의 답안 조회
   */
  async getQuizAnswers(quizResultId: string): Promise<WordQuizAnswer[]> {
    const { data, error } = await supabase
      .from("word_quiz_answers")
      .select("*")
      .eq("quiz_result_id", quizResultId)
      .order("answered_at", { ascending: true });

    if (error) {
      console.error("퀴즈 답안 조회 실패:", error);
      throw new Error("퀴즈 답안을 불러오는데 실패했습니다.");
    }

    return data || [];
  }

  /**
   * 퀴즈 유형별 통계
   */
  async getQuizStatsByType(quizType: QuizResult["quiz_type"]) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("인증이 필요합니다.");
    }

    const { data, error } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", user.id)
      .eq("quiz_type", quizType);

    if (error) {
      console.error("퀴즈 통계 조회 실패:", error);
      return {
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
      };
    }

    if (!data || data.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
      };
    }

    const totalQuizzes = data.length;
    const averageScore =
      data.reduce((sum, quiz) => sum + quiz.score_percentage, 0) / totalQuizzes;
    const bestScore = Math.max(...data.map((quiz) => quiz.score_percentage));

    return {
      totalQuizzes,
      averageScore: Math.round(averageScore),
      bestScore,
    };
  }

  /**
   * 최근 퀴즈 성적 추이 (최근 N개)
   */
  async getRecentQuizTrend(limit: number = 10) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("인증이 필요합니다.");
    }

    const { data, error } = await supabase
      .from("quiz_results")
      .select("completed_at, score_percentage, quiz_type")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("퀴즈 추이 조회 실패:", error);
      return [];
    }

    return data || [];
  }
}

export const quizService = new QuizService();
