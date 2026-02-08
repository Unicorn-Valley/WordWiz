import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MultipleChoiceQuiz from "../../components/quiz/MultipleChoiceQuiz";
import FillBlankQuiz from "../../components/quiz/FillBlankQuiz";
import MatchingQuiz from "../../components/quiz/MatchingQuiz";
import QuizResultView from "../../components/quiz/QuizResult";
import { wordService, quizService } from "../../services";
import { useTheme } from "../../hooks/useTheme";
import type { ThemeColors } from "../../constants/colors";

const quizTypes = [
  { id: "multiple_choice", label: "객관식", desc: "4개 보기에서 정답 고르기", icon: "list" as const, color: "#a855f7" },
  { id: "fill_blank", label: "주관식", desc: "뜻을 직접 입력하기", icon: "pencil" as const, color: "#f43f5e" },
  { id: "matching", label: "매칭", desc: "단어와 뜻 연결하기", icon: "link" as const, color: "#f59e0b" },
];

const questionOptions = [5, 10, 15, 20];

export default function Quiz() {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [quizStarted, setQuizStarted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [words, setWords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWords = useCallback(async () => {
    try {
      const data = await wordService.getWords();
      setWords(data);
    } catch (error: any) {
      Alert.alert("오류", error.message || "단어를 불러오는데 실패했습니다.");
    }
  }, []);

  useEffect(() => {
    loadWords().finally(() => setIsLoading(false));
  }, [loadWords]);

  const handleComplete = async ({ total, correct, results }: any) => {
    setResult({ total, correct });
    try {
      const scorePercentage = Math.round((correct / total) * 100);
      const quizResult = await quizService.createQuizResult({
        quiz_type: selectedType as any,
        total_questions: total,
        correct_answers: correct,
        score_percentage: scorePercentage,
      });
      if (results?.length > 0) {
        const answers = results.map((r: any) => ({
          quiz_result_id: quizResult.id,
          word_id: r.wordId,
          is_correct: r.correct,
        }));
        await quizService.createQuizAnswers(answers);
      }
      for (const r of results) {
        try { await wordService.recordAnswer(r.wordId, r.correct); } catch {}
      }
    } catch (error: any) {
      console.error("퀴즈 결과 저장 실패:", error);
    }
  };

  const handleReset = () => {
    setQuizStarted(false);
    setResult(null);
    loadWords();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={s.container} edges={[]}>
        <View style={s.centerLoader}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (result) {
    return (
      <SafeAreaView style={s.container} edges={[]}>
        <ScrollView style={s.scrollView} contentContainerStyle={s.scrollContent}>
          <QuizResultView total={result.total} correct={result.correct} onRetry={() => setResult(null)} onBack={handleReset} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (quizStarted && selectedType) {
    return (
      <SafeAreaView style={s.container} edges={[]}>
        <ScrollView style={s.scrollView}>
          <View style={s.innerContainer}>
            <TouchableOpacity onPress={handleReset} style={s.backButton}>
              <Text style={s.backButtonText}>← 퀴즈 선택</Text>
            </TouchableOpacity>
            {selectedType === "multiple_choice" && <MultipleChoiceQuiz words={words} questionCount={questionCount} onComplete={handleComplete} />}
            {selectedType === "fill_blank" && <FillBlankQuiz words={words} questionCount={questionCount} onComplete={handleComplete} />}
            {selectedType === "matching" && <MatchingQuiz words={words} questionCount={Math.min(questionCount, 6)} onComplete={handleComplete} />}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={[]}>
      <ScrollView style={s.scrollView}>
        <View style={s.innerContainer}>
          <View style={s.header}>
            <View style={s.headerTitle}>
              <Ionicons name="bulb-outline" size={24} color={c.secondary} />
              <Text style={s.headerText}>퀴즈</Text>
            </View>
            <Text style={s.headerSubtext}>저장된 단어로 퀴즈를 풀어보세요</Text>
          </View>

          {words.length < 3 ? (
            <View style={s.emptyState}>
              <Ionicons name="bulb-outline" size={48} color={c.border} />
              <Text style={s.emptyStateText}>최소 3개 이상의 단어가 필요합니다</Text>
              <Text style={s.emptyStateSubtext}>단어를 먼저 추가해주세요!</Text>
            </View>
          ) : (
            <>
              <Text style={s.sectionLabel}>퀴즈 유형</Text>
              <FlatList
                data={quizTypes}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item: type }) => {
                  const isSelected = selectedType === type.id;
                  return (
                    <TouchableOpacity
                      onPress={() => setSelectedType(type.id)}
                      style={[s.quizTypeButton, isSelected && s.quizTypeButtonSelected]}
                    >
                      <View style={[s.quizTypeIcon, { backgroundColor: type.color }]}>
                        <Ionicons name={type.icon} size={20} color="white" />
                      </View>
                      <View style={s.quizTypeContent}>
                        <Text style={s.quizTypeLabel}>{type.label}</Text>
                        <Text style={s.quizTypeDesc}>{type.desc}</Text>
                      </View>
                      <View style={[s.radioButton, isSelected && s.radioButtonSelected]}>
                        {isSelected && <View style={s.radioButtonInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />

              <Text style={[s.sectionLabel, s.questionCountLabel]}>문제 수</Text>
              <View style={s.questionOptionsContainer}>
                <FlatList
                  data={questionOptions}
                  keyExtractor={(item) => item.toString()}
                  scrollEnabled={false}
                  horizontal
                  renderItem={({ item: n }) => (
                    <TouchableOpacity
                      onPress={() => setQuestionCount(n)}
                      disabled={n > words.length}
                      style={[s.questionOption, questionCount === n && s.questionOptionSelected, n > words.length && s.questionOptionDisabled]}
                    >
                      <Text style={[s.questionOptionText, questionCount === n && s.questionOptionTextSelected]}>{n}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              <TouchableOpacity
                onPress={() => setQuizStarted(true)}
                disabled={!selectedType}
                style={[s.startButton, !selectedType && s.startButtonDisabled]}
              >
                <Text style={s.startButtonText}>퀴즈 시작</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scrollView: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    innerContainer: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
    centerLoader: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: { marginBottom: 24 },
    headerTitle: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    headerText: { fontSize: 28, fontWeight: "bold", color: c.text },
    headerSubtext: { fontSize: 14, color: c.textSecondary, marginTop: 4 },
    emptyState: { paddingVertical: 48, paddingHorizontal: 20, backgroundColor: c.card, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: c.border },
    emptyStateText: { fontSize: 14, color: c.textTertiary, marginTop: 12 },
    emptyStateSubtext: { fontSize: 12, color: c.disabled, marginTop: 4 },
    sectionLabel: { fontSize: 14, fontWeight: "600", color: c.textSecondary, marginBottom: 12 },
    questionCountLabel: { marginTop: 24 },
    quizTypeButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, backgroundColor: c.card, borderRadius: 12, marginBottom: 10, borderWidth: 2, borderColor: c.border, gap: 16 },
    quizTypeButtonSelected: { backgroundColor: c.highlightBg, borderColor: c.secondary },
    quizTypeIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    quizTypeContent: { flex: 1 },
    quizTypeLabel: { fontSize: 14, fontWeight: "600", color: c.text, marginBottom: 4 },
    quizTypeDesc: { fontSize: 12, color: c.textTertiary },
    radioButton: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: c.disabled, justifyContent: "center", alignItems: "center" },
    radioButtonSelected: { borderColor: c.secondary, backgroundColor: c.secondary },
    radioButtonInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
    questionOptionsContainer: { marginBottom: 32 },
    questionOption: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, marginRight: 8, backgroundColor: c.card, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: c.border },
    questionOptionSelected: { backgroundColor: c.highlightBg, borderColor: c.secondary },
    questionOptionDisabled: { opacity: 0.3 },
    questionOptionText: { fontSize: 13, fontWeight: "500", color: c.textSecondary },
    questionOptionTextSelected: { color: c.secondary },
    startButton: { backgroundColor: c.secondary, borderRadius: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
    startButtonDisabled: { opacity: 0.5 },
    startButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
    backButton: { marginBottom: 16 },
    backButtonText: { fontSize: 14, color: c.textTertiary },
  });
