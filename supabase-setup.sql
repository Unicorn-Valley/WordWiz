-- ============================================
-- WordWiz Supabase Database Setup
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요
-- ============================================

-- ============================================
-- 1. words 테이블 (사용자별 단어 저장)
-- ============================================
CREATE TABLE IF NOT EXISTS public.words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  english VARCHAR(255) NOT NULL,
  meaning TEXT NOT NULL,
  part_of_speech VARCHAR(50) CHECK (part_of_speech IN ('noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection', 'other')),
  example_sentence TEXT,
  source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'scan')),
  difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
  is_bookmarked BOOLEAN DEFAULT FALSE,
  times_correct INTEGER DEFAULT 0,
  times_wrong INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_word UNIQUE(user_id, english)
);

-- words 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_words_user_id ON public.words(user_id);
CREATE INDEX IF NOT EXISTS idx_words_bookmarked ON public.words(user_id, is_bookmarked) WHERE is_bookmarked = TRUE;
CREATE INDEX IF NOT EXISTS idx_words_mastery ON public.words(user_id, mastery_level);
CREATE INDEX IF NOT EXISTS idx_words_created ON public.words(user_id, created_at DESC);

-- ============================================
-- 2. quiz_results 테이블 (퀴즈 결과 저장)
-- ============================================
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_type VARCHAR(50) NOT NULL CHECK (quiz_type IN ('multiple_choice', 'fill_blank', 'matching')),
  total_questions INTEGER NOT NULL CHECK (total_questions > 0),
  correct_answers INTEGER NOT NULL CHECK (correct_answers >= 0),
  score_percentage INTEGER NOT NULL CHECK (score_percentage >= 0 AND score_percentage <= 100),
  difficulty VARCHAR(20) DEFAULT 'mixed' CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- quiz_results 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed ON public.quiz_results(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_type ON public.quiz_results(user_id, quiz_type);

-- ============================================
-- 3. word_quiz_answers 테이블 (퀴즈 문제별 답안 기록)
-- ============================================
CREATE TABLE IF NOT EXISTS public.word_quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_result_id UUID NOT NULL REFERENCES public.quiz_results(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
  user_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- word_quiz_answers 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_word_quiz_answers_result ON public.word_quiz_answers(quiz_result_id);
CREATE INDEX IF NOT EXISTS idx_word_quiz_answers_word ON public.word_quiz_answers(word_id);

-- ============================================
-- 4. user_statistics 테이블 (사용자 학습 통계)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_words INTEGER DEFAULT 0,
  bookmarked_words INTEGER DEFAULT 0,
  mastered_words INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  total_quiz_score_percentage FLOAT DEFAULT 0,
  average_word_mastery FLOAT DEFAULT 0,
  last_studied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_statistics 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON public.user_statistics(user_id);

-- ============================================
-- 5. RLS (Row Level Security) 활성화
-- ============================================
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS 정책 - words 테이블
-- ============================================
-- 조회 정책
CREATE POLICY "Users can view their own words"
  ON public.words FOR SELECT
  USING (auth.uid() = user_id);

-- 삽입 정책
CREATE POLICY "Users can insert their own words"
  ON public.words FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 수정 정책
CREATE POLICY "Users can update their own words"
  ON public.words FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 삭제 정책
CREATE POLICY "Users can delete their own words"
  ON public.words FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. RLS 정책 - quiz_results 테이블
-- ============================================
CREATE POLICY "Users can view their own quiz results"
  ON public.quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz results"
  ON public.quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 8. RLS 정책 - word_quiz_answers 테이블
-- ============================================
CREATE POLICY "Users can view their own quiz answers"
  ON public.word_quiz_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_results
      WHERE quiz_results.id = word_quiz_answers.quiz_result_id
      AND quiz_results.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own quiz answers"
  ON public.word_quiz_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_results
      WHERE quiz_results.id = word_quiz_answers.quiz_result_id
      AND quiz_results.user_id = auth.uid()
    )
  );

-- ============================================
-- 9. RLS 정책 - user_statistics 테이블
-- ============================================
CREATE POLICY "Users can view their own statistics"
  ON public.user_statistics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics"
  ON public.user_statistics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics"
  ON public.user_statistics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 10. 트리거 함수 - updated_at 자동 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- words 테이블에 트리거 적용
CREATE TRIGGER update_words_updated_at
  BEFORE UPDATE ON public.words
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- user_statistics 테이블에 트리거 적용
CREATE TRIGGER update_user_statistics_updated_at
  BEFORE UPDATE ON public.user_statistics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 11. 트리거 함수 - 사용자 통계 자동 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION public.update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- user_statistics 레코드가 없으면 생성
  INSERT INTO public.user_statistics (user_id)
  VALUES (COALESCE(NEW.user_id, OLD.user_id))
  ON CONFLICT (user_id) DO NOTHING;

  -- 통계 업데이트
  UPDATE public.user_statistics
  SET
    total_words = (SELECT COUNT(*) FROM public.words WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)),
    bookmarked_words = (SELECT COUNT(*) FROM public.words WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND is_bookmarked = TRUE),
    mastered_words = (SELECT COUNT(*) FROM public.words WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND mastery_level >= 80),
    average_word_mastery = (SELECT COALESCE(AVG(mastery_level), 0) FROM public.words WHERE user_id = COALESCE(NEW.user_id, OLD.user_id))
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- words 테이블 변경 시 통계 자동 업데이트
CREATE TRIGGER update_words_statistics
  AFTER INSERT OR UPDATE OR DELETE ON public.words
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_statistics();

-- ============================================
-- 12. 퀴즈 통계 업데이트 함수
-- ============================================
CREATE OR REPLACE FUNCTION public.update_quiz_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- user_statistics 레코드가 없으면 생성
  INSERT INTO public.user_statistics (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- 퀴즈 통계 업데이트
  UPDATE public.user_statistics
  SET
    quizzes_completed = (SELECT COUNT(*) FROM public.quiz_results WHERE user_id = NEW.user_id),
    total_quiz_score_percentage = (SELECT COALESCE(AVG(score_percentage), 0) FROM public.quiz_results WHERE user_id = NEW.user_id),
    last_studied_at = NEW.completed_at
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- quiz_results 테이블에 트리거 적용
CREATE TRIGGER update_quiz_statistics_trigger
  AFTER INSERT ON public.quiz_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quiz_statistics();

-- ============================================
-- 완료!
-- ============================================
-- 테이블, 인덱스, RLS 정책, 트리거가 모두 생성되었습니다.
-- Supabase Dashboard에서 테이블을 확인하세요.
