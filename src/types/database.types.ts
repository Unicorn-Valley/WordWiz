/**
 * Database 타입 정의
 */

export interface Word {
  id: string;
  user_id: string;
  english: string;
  meaning: string;
  part_of_speech?:
    | "noun"
    | "verb"
    | "adjective"
    | "adverb"
    | "preposition"
    | "conjunction"
    | "pronoun"
    | "interjection"
    | "other";
  example_sentence?: string;
  source: "manual" | "scan";
  difficulty: "easy" | "medium" | "hard";
  mastery_level: number;
  is_bookmarked: boolean;
  times_correct: number;
  times_wrong: number;
  last_reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWordInput {
  english: string;
  meaning: string;
  part_of_speech?: Word["part_of_speech"];
  example_sentence?: string;
  source?: Word["source"];
  difficulty?: Word["difficulty"];
}

export interface UpdateWordInput {
  english?: string;
  meaning?: string;
  part_of_speech?: Word["part_of_speech"];
  example_sentence?: string;
  difficulty?: Word["difficulty"];
  mastery_level?: number;
  is_bookmarked?: boolean;
  times_correct?: number;
  times_wrong?: number;
  last_reviewed_at?: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_type: "multiple_choice" | "fill_blank" | "matching";
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  completed_at: string;
}

export interface CreateQuizResultInput {
  quiz_type: QuizResult["quiz_type"];
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  difficulty?: QuizResult["difficulty"];
}

export interface WordQuizAnswer {
  id: string;
  quiz_result_id: string;
  word_id: string;
  user_answer?: string;
  is_correct: boolean;
  answered_at: string;
}

export interface CreateQuizAnswerInput {
  quiz_result_id: string;
  word_id: string;
  user_answer?: string;
  is_correct: boolean;
}

export interface UserStatistics {
  id: string;
  user_id: string;
  total_words: number;
  bookmarked_words: number;
  mastered_words: number;
  quizzes_completed: number;
  total_quiz_score_percentage: number;
  average_word_mastery: number;
  last_studied_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WordFilters {
  search?: string;
  is_bookmarked?: boolean;
  mastery_level_min?: number;
  mastery_level_max?: number;
  part_of_speech?: Word["part_of_speech"];
  difficulty?: Word["difficulty"];
  limit?: number;
  offset?: number;
}
