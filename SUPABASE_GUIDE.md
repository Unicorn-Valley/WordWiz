# Supabase 데이터베이스 설정 및 사용 가이드

## 📋 목차

1. [데이터베이스 설정](#데이터베이스-설정)
2. [API 서비스 사용법](#api-서비스-사용법)
3. [React Native에서 사용하기](#react-native에서-사용하기)
4. [에러 처리](#에러-처리)

---

## 🔧 데이터베이스 설정

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속
2. 새 프로젝트 생성
3. Database Password 설정

### 2. 테이블 생성

1. Supabase Dashboard → SQL Editor 이동
2. `supabase-setup.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기
4. "RUN" 버튼 클릭하여 실행

### 3. 환경 변수 설정

`.env` 파일에 Supabase 정보 추가:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

---

## 💻 API 서비스 사용법

### 단어 서비스 (wordService)

#### 1. 단어 목록 조회

```typescript
import { wordService } from "@/services";

// 모든 단어 조회
const words = await wordService.getWords();

// 필터링하여 조회
const bookmarkedWords = await wordService.getWords({
  is_bookmarked: true,
  limit: 10,
});

// 검색
const searchResults = await wordService.searchWords("apple");

// 마스터한 단어만
const masteredWords = await wordService.getMasteredWords();
```

#### 2. 단어 추가

```typescript
const newWord = await wordService.createWord({
  english: "apple",
  meaning: "사과",
  part_of_speech: "noun",
  example_sentence: "I ate an apple.",
  source: "manual",
  difficulty: "easy",
});
```

#### 3. 단어 수정

```typescript
const updatedWord = await wordService.updateWord(wordId, {
  meaning: "사과 (과일)",
  example_sentence: "An apple a day keeps the doctor away.",
});
```

#### 4. 단어 삭제

```typescript
await wordService.deleteWord(wordId);
```

#### 5. 북마크 토글

```typescript
const word = await wordService.toggleBookmark(wordId);
```

#### 6. 학습 기록

```typescript
// 정답 처리
const word = await wordService.recordAnswer(wordId, true);

// 오답 처리
const word = await wordService.recordAnswer(wordId, false);
```

---

### 퀴즈 서비스 (quizService)

#### 1. 퀴즈 결과 저장

```typescript
import { quizService } from "@/services";

const quizResult = await quizService.createQuizResult({
  quiz_type: "multiple_choice",
  total_questions: 10,
  correct_answers: 8,
  score_percentage: 80,
  difficulty: "mixed",
});
```

#### 2. 퀴즈 답안 저장

```typescript
const answers = await quizService.createQuizAnswers([
  {
    quiz_result_id: quizResult.id,
    word_id: word1.id,
    user_answer: "사과",
    is_correct: true,
  },
  {
    quiz_result_id: quizResult.id,
    word_id: word2.id,
    user_answer: "바나나",
    is_correct: false,
  },
]);
```

#### 3. 퀴즈 결과 조회

```typescript
const recentQuizzes = await quizService.getQuizResults(20);
```

#### 4. 퀴즈 통계

```typescript
const stats = await quizService.getQuizStatsByType("multiple_choice");
// { totalQuizzes: 15, averageScore: 75, bestScore: 95 }
```

---

### 통계 서비스 (statisticsService)

#### 1. 사용자 통계 조회

```typescript
import { statisticsService } from "@/services";

const stats = await statisticsService.getUserStatistics();
```

#### 2. 대시보드 데이터

```typescript
const dashboard = await statisticsService.getDashboardData();
// {
//   totalWords: 50,
//   bookmarkedWords: 10,
//   masteredWords: 20,
//   learningWords: 30,
//   quizzesCompleted: 15,
//   averageScore: 75,
//   averageMastery: 60,
//   lastStudied: '2026-02-08T...'
// }
```

#### 3. 학습 진행률

```typescript
const progress = await statisticsService.getLearningProgress();
// { totalWords: 50, masteredWords: 20, progressPercentage: 40 }
```

#### 4. 학습 스트릭

```typescript
const streak = await statisticsService.getStudyStreak();
// { currentStreak: 5, longestStreak: 10, lastStudyDate: '2026-02-08' }
```

---

## 📱 React Native에서 사용하기

### DictScreen에 통합 예시

```typescript
import { useState, useEffect } from 'react';
import { wordService } from '@/services';

export default function DictScreen() {
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 단어 목록 불러오기
  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      setIsLoading(true);
      const data = await wordService.getWords();
      setWords(data);
    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 단어 추가
  const handleAddWord = async (wordData) => {
    try {
      const newWord = await wordService.createWord(wordData);
      setWords([newWord, ...words]);
      Alert.alert('성공', '단어가 추가되었습니다!');
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  // 북마크 토글
  const handleToggleBookmark = async (word) => {
    try {
      const updated = await wordService.toggleBookmark(word.id);
      setWords(words.map(w => w.id === updated.id ? updated : w));
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  // 단어 삭제
  const handleDeleteWord = async (wordId) => {
    try {
      await wordService.deleteWord(wordId);
      setWords(words.filter(w => w.id !== wordId));
      Alert.alert('성공', '삭제되었습니다');
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  return (
    // ... UI 코드
  );
}
```

### QuizScreen에 통합 예시

```typescript
import { quizService, wordService } from '@/services';

export default function QuizScreen() {
  const [words, setWords] = useState([]);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    const data = await wordService.getWords();
    setWords(data);
  };

  const handleQuizComplete = async ({ total, correct, results }) => {
    try {
      // 퀴즈 결과 저장
      const quizResult = await quizService.createQuizResult({
        quiz_type: 'multiple_choice',
        total_questions: total,
        correct_answers: correct,
        score_percentage: Math.round((correct / total) * 100)
      });

      // 각 답안 저장
      const answers = results.map(r => ({
        quiz_result_id: quizResult.id,
        word_id: r.wordId,
        is_correct: r.correct
      }));
      await quizService.createQuizAnswers(answers);

      // 각 단어의 마스터리 업데이트
      for (const result of results) {
        await wordService.recordAnswer(result.wordId, result.correct);
      }

      // 단어 목록 새로고침
      await loadWords();

    } catch (error) {
      console.error('퀴즈 결과 저장 실패:', error);
    }
  };

  return (
    // ... UI 코드
  );
}
```

### 통계 대시보드 예시

```typescript
import { statisticsService } from '@/services';

export default function StatsScreen() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await statisticsService.getDashboardData();
      setDashboard(data);
    } catch (error) {
      Alert.alert('오류', error.message);
    }
  };

  return (
    <View>
      <Text>총 단어: {dashboard?.totalWords}</Text>
      <Text>마스터: {dashboard?.masteredWords}</Text>
      <Text>평균 점수: {dashboard?.averageScore}%</Text>
    </View>
  );
}
```

---

## ⚠️ 에러 처리

### 일반적인 에러 처리 패턴

```typescript
try {
  const words = await wordService.getWords();
} catch (error) {
  if (error.message === "인증이 필요합니다.") {
    // 로그인 화면으로 이동
    navigation.navigate("Login");
  } else if (error.message === "이미 존재하는 단어입니다.") {
    Alert.alert("알림", "이미 추가된 단어입니다.");
  } else {
    Alert.alert("오류", "작업을 완료할 수 없습니다.");
    console.error(error);
  }
}
```

### 에러 타입별 처리

```typescript
const ERROR_MESSAGES = {
  AUTH_REQUIRED: "로그인이 필요합니다.",
  DUPLICATE_WORD: "이미 존재하는 단어입니다.",
  NETWORK_ERROR: "네트워크 연결을 확인해주세요.",
  UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
};
```

---

## 🔄 데이터 새로고침

### Pull-to-Refresh 구현

```typescript
const [refreshing, setRefreshing] = useState(false);

const handleRefresh = async () => {
  setRefreshing(true);
  try {
    await loadWords();
  } finally {
    setRefreshing(false);
  }
};

return (
  <ScrollView
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    }
  >
    {/* 내용 */}
  </ScrollView>
);
```

---

## 📊 실시간 업데이트 (선택사항)

Supabase Realtime을 사용한 실시간 동기화:

```typescript
useEffect(() => {
  const subscription = supabase
    .channel("words-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "words",
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        console.log("단어 변경됨:", payload);
        loadWords(); // 데이터 새로고침
      },
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## ✅ 체크리스트

설정 완료 확인:

- [ ] Supabase 프로젝트 생성
- [ ] `supabase-setup.sql` 실행
- [ ] `.env` 파일에 환경변수 설정
- [ ] 서비스 파일들 프로젝트에 추가
- [ ] DictScreen에 wordService 통합
- [ ] QuizScreen에 quizService 통합
- [ ] 에러 처리 구현
- [ ] 테스트

---

이제 완전한 사용자별 단어장 시스템이 구축되었습니다! 🎉
