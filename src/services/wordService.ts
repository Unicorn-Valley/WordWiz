import { supabase } from "../config/supabase";
import {
  Word,
  CreateWordInput,
  UpdateWordInput,
  WordFilters,
} from "../types/database.types";

/**
 * 단어 관련 API 서비스
 */
class WordService {
  /**
   * 현재 로그인한 사용자의 모든 단어 조회
   */
  async getWords(filters?: WordFilters): Promise<Word[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("인증이 필요합니다.");
    }

    let query = supabase
      .from("words")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // 필터 적용
    if (filters?.search) {
      query = query.or(
        `english.ilike.%${filters.search}%,meaning.ilike.%${filters.search}%`,
      );
    }

    if (filters?.is_bookmarked !== undefined) {
      query = query.eq("is_bookmarked", filters.is_bookmarked);
    }

    if (filters?.mastery_level_min !== undefined) {
      query = query.gte("mastery_level", filters.mastery_level_min);
    }

    if (filters?.mastery_level_max !== undefined) {
      query = query.lte("mastery_level", filters.mastery_level_max);
    }

    if (filters?.part_of_speech) {
      query = query.eq("part_of_speech", filters.part_of_speech);
    }

    if (filters?.difficulty) {
      query = query.eq("difficulty", filters.difficulty);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 50) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("단어 조회 실패:", error);
      throw new Error("단어를 불러오는데 실패했습니다.");
    }

    return data || [];
  }

  /**
   * 단어 상세 조회
   */
  async getWordById(id: string): Promise<Word> {
    const { data, error } = await supabase
      .from("words")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("단어 조회 실패:", error);
      throw new Error("단어를 찾을 수 없습니다.");
    }

    return data;
  }

  /**
   * 새 단어 추가
   */
  async createWord(input: CreateWordInput): Promise<Word> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("인증이 필요합니다.");
    }

    const { data, error } = await supabase
      .from("words")
      .insert({
        user_id: user.id,
        english: input.english,
        meaning: input.meaning,
        part_of_speech: input.part_of_speech || "other",
        example_sentence: input.example_sentence,
        source: input.source || "manual",
        difficulty: input.difficulty || "medium",
        mastery_level: 0,
        is_bookmarked: false,
        times_correct: 0,
        times_wrong: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("단어 추가 실패:", error);
      if (error.code === "23505") {
        // UNIQUE constraint violation
        throw new Error("이미 존재하는 단어입니다.");
      }
      throw new Error("단어 추가에 실패했습니다.");
    }

    return data;
  }

  /**
   * 단어 수정
   */
  async updateWord(id: string, input: UpdateWordInput): Promise<Word> {
    const { data, error } = await supabase
      .from("words")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("단어 수정 실패:", error);
      throw new Error("단어 수정에 실패했습니다.");
    }

    return data;
  }

  /**
   * 단어 삭제
   */
  async deleteWord(id: string): Promise<void> {
    const { error } = await supabase.from("words").delete().eq("id", id);

    if (error) {
      console.error("단어 삭제 실패:", error);
      throw new Error("단어 삭제에 실패했습니다.");
    }
  }

  /**
   * 북마크 토글
   */
  async toggleBookmark(id: string): Promise<Word> {
    const word = await this.getWordById(id);
    return this.updateWord(id, { is_bookmarked: !word.is_bookmarked });
  }

  /**
   * 학습 완료 (정답/오답 기록)
   */
  async recordAnswer(id: string, isCorrect: boolean): Promise<Word> {
    const word = await this.getWordById(id);

    const newCorrect = word.times_correct + (isCorrect ? 1 : 0);
    const newWrong = word.times_wrong + (isCorrect ? 0 : 1);
    const totalAttempts = newCorrect + newWrong;

    // 마스터리 레벨 계산 (정답률 기반)
    const masteryLevel = Math.min(
      100,
      Math.round((newCorrect / totalAttempts) * 100),
    );

    return this.updateWord(id, {
      times_correct: newCorrect,
      times_wrong: newWrong,
      mastery_level: masteryLevel,
      last_reviewed_at: new Date().toISOString(),
    });
  }

  /**
   * 북마크된 단어 조회
   */
  async getBookmarkedWords(): Promise<Word[]> {
    return this.getWords({ is_bookmarked: true });
  }

  /**
   * 마스터한 단어 조회 (마스터리 레벨 80% 이상)
   */
  async getMasteredWords(): Promise<Word[]> {
    return this.getWords({ mastery_level_min: 80 });
  }

  /**
   * 학습 중인 단어 조회 (마스터리 레벨 80% 미만)
   */
  async getLearningWords(): Promise<Word[]> {
    return this.getWords({ mastery_level_max: 79 });
  }

  /**
   * 단어 검색
   */
  async searchWords(searchTerm: string): Promise<Word[]> {
    return this.getWords({ search: searchTerm });
  }

  /**
   * 단어 개수 조회
   */
  async getWordCount(): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("인증이 필요합니다.");
    }

    const { count, error } = await supabase
      .from("words")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (error) {
      console.error("단어 개수 조회 실패:", error);
      return 0;
    }

    return count || 0;
  }
}

export const wordService = new WordService();
