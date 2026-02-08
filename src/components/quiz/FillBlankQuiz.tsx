import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import type { ThemeColors } from "../../constants/colors";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FillBlankQuiz({ words, questionCount, onComplete }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);

  const questions = useMemo(() => {
    const shuffled = shuffle(words);
    return shuffled.slice(0, Math.min(questionCount, shuffled.length));
  }, [words, questionCount]);

  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState([]);
  const [progressAnim] = useState(new Animated.Value(0));

  const question = questions[current];

  const normalize = (s) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z가-힣ㄱ-ㅎㅏ-ㅣ0-9\s]/g, "");

  const checkAnswer = () => {
    const isCorrect =
      normalize(answer) === normalize(question.meaning) ||
      question.meaning
        .split(",")
        .some((m) => normalize(answer) === normalize(m)) ||
      question.meaning
        .split("/")
        .some((m) => normalize(answer) === normalize(m));
    setAnswered(true);
    setResults((prev) => [
      ...prev,
      { wordId: question.id, correct: isCorrect },
    ]);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      const correct = results.filter((r) => r.correct).length;
      onComplete({ total: questions.length, correct, results });
    } else {
      setCurrent((prev) => prev + 1);
      setAnswer("");
      setAnswered(false);
      Animated.timing(progressAnim, {
        toValue: ((current + 2) / questions.length) * 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const isCorrect = results[current]?.correct;

  if (!question) return null;

  const progressWidth = `${((current + 1) / questions.length) * 100}%` as unknown as number;

  return (
    <View>
      {/* Progress */}
      <View style={s.progressContainer}>
        <View style={s.progressBar}>
          <View
            style={[
              s.progressFill,
              { width: progressWidth, backgroundColor: c.secondary },
            ]}
          />
        </View>
        <Text style={s.progressText}>
          {current + 1}/{questions.length}
        </Text>
      </View>

      {/* Question */}
      <View style={s.questionContainer}>
        <Text style={s.questionLabel}>이 단어의 뜻을 입력하세요</Text>
        <Text style={s.questionText}>{question.english}</Text>
      </View>

      {/* Input and Answer */}
      <View style={s.answerContainer}>
        <TextInput
          style={[
            s.input,
            answered && isCorrect && s.inputCorrect,
            answered && !isCorrect && s.inputWrong,
          ]}
          placeholder='뜻을 입력하세요...'
          placeholderTextColor={c.disabled}
          value={answer}
          onChangeText={setAnswer}
          editable={!answered}
          onSubmitEditing={() => !answered && answer && checkAnswer()}
        />

        {answered && (
          <View
            style={[
              s.feedbackContainer,
              isCorrect ? s.feedbackCorrect : s.feedbackWrong,
            ]}
          >
            {isCorrect ? (
              <View style={s.feedbackContent}>
                <Ionicons name='checkmark-circle' size={20} color={c.success} />
                <Text style={s.feedbackTextCorrect}>정답입니다!</Text>
              </View>
            ) : (
              <View>
                <View style={s.feedbackContent}>
                  <Ionicons name='close-circle' size={20} color={c.error} />
                  <Text style={s.feedbackTextWrong}>오답</Text>
                </View>
                <Text style={s.correctAnswerText}>
                  정답:{" "}
                  <Text style={s.correctAnswerValue}>
                    {question.meaning}
                  </Text>
                </Text>
              </View>
            )}
          </View>
        )}

        {!answered ? (
          <TouchableOpacity
            onPress={checkAnswer}
            disabled={!answer}
            style={[s.checkButton, !answer && s.checkButtonDisabled]}
          >
            <Text style={s.checkButtonText}>확인</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleNext} style={s.nextButton}>
            <Text style={s.nextButtonText}>
              {current + 1 >= questions.length ? "결과 보기" : "다음 문제"}
            </Text>
            <Ionicons name='arrow-forward' size={16} color={c.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    progressContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 24,
    },
    progressBar: {
      flex: 1,
      height: 6,
      backgroundColor: c.progressBg,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },
    progressText: {
      fontSize: 12,
      color: c.textSecondary,
    },
    questionContainer: {
      alignItems: "center",
      marginBottom: 32,
    },
    questionLabel: {
      fontSize: 12,
      color: c.textTertiary,
      marginBottom: 8,
    },
    questionText: {
      fontSize: 28,
      fontWeight: "bold",
      color: c.text,
    },
    answerContainer: {
      gap: 16,
    },
    input: {
      fontSize: 18,
      height: 56,
      backgroundColor: c.inputBg,
      borderWidth: 2,
      borderColor: c.progressBg,
      borderRadius: 12,
      color: c.text,
      paddingHorizontal: 16,
      textAlign: "center",
    },
    inputCorrect: {
      borderColor: c.success,
      backgroundColor: c.correctBg,
    },
    inputWrong: {
      borderColor: c.error,
      backgroundColor: c.wrongBg,
    },
    feedbackContainer: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 12,
    },
    feedbackCorrect: {
      backgroundColor: c.correctBg,
    },
    feedbackWrong: {
      backgroundColor: c.wrongBg,
    },
    feedbackContent: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    feedbackTextCorrect: {
      fontWeight: "500",
      color: c.success,
    },
    feedbackTextWrong: {
      fontWeight: "500",
      color: c.error,
    },
    correctAnswerText: {
      fontSize: 13,
      color: c.textSecondary,
      textAlign: "center",
    },
    correctAnswerValue: {
      color: c.text,
      fontWeight: "500",
    },
    checkButton: {
      backgroundColor: c.secondary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    checkButtonDisabled: {
      opacity: 0.5,
    },
    checkButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: c.white,
    },
    nextButton: {
      flexDirection: "row",
      backgroundColor: c.success,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: c.white,
    },
  });
