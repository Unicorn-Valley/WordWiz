import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

export default function MultipleChoiceQuiz({
  words,
  questionCount,
  onComplete,
}) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);

  const questions = useMemo(() => {
    const shuffled = shuffle(words);
    const count = Math.min(questionCount, shuffled.length);
    return shuffled.slice(0, count).map((word) => {
      const wrongOptions = shuffle(words.filter((w) => w.id !== word.id)).slice(
        0,
        3,
      );
      const options = shuffle([word, ...wrongOptions]);
      return { word, options };
    });
  }, [words, questionCount]);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState([]);
  const [progressAnim] = useState(new Animated.Value(0));

  const question = questions[current];
  const isCorrect = selected === question?.word.id;

  const handleSelect = (id) => {
    if (answered) return;
    setSelected(id);
    setAnswered(true);
    setResults((prev) => [
      ...prev,
      { wordId: question.word.id, correct: id === question.word.id },
    ]);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      const correct =
        results.length > 0 ? results.filter((r) => r.correct).length : 0;
      onComplete({
        total: questions.length,
        correct,
        results,
      });
    } else {
      setCurrent((prev) => prev + 1);
      setSelected(null);
      setAnswered(false);
      Animated.timing(progressAnim, {
        toValue: ((current + 2) / questions.length) * 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  if (!question) return null;

  const progressWidth = `${((current + 1) / questions.length) * 100}%` as unknown as number;

  return (
    <View>
      {/* Progress */}
      <View style={s.progressContainer}>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={s.progressText}>
          {current + 1}/{questions.length}
        </Text>
      </View>

      {/* Question */}
      <View style={s.questionContainer}>
        <Text style={s.questionLabel}>이 단어의 뜻은?</Text>
        <Text style={s.questionText}>{question.word.english}</Text>
        {question.word.part_of_speech && (
          <View style={s.partOfSpeechBadge}>
            <Text style={s.partOfSpeechText}>
              {question.word.part_of_speech}
            </Text>
          </View>
        )}
      </View>

      {/* Options */}
      <FlatList
        data={question.options}
        keyExtractor={(item, index) => index.toString()}
        scrollEnabled={false}
        renderItem={({ item: opt, index }) => {
          const isThis = selected === opt.id;
          const isAnswer = opt.id === question.word.id;
          let optionStyle = s.optionButtonDefault;
          let optionTextStyle = s.optionTextDefault;

          if (answered && isAnswer) {
            optionStyle = s.optionButtonCorrect;
            optionTextStyle = s.optionTextCorrect;
          } else if (answered && isThis && !isAnswer) {
            optionStyle = s.optionButtonWrong;
            optionTextStyle = s.optionTextWrong;
          }

          return (
            <TouchableOpacity
              onPress={() => handleSelect(opt.id)}
              disabled={answered}
              style={[s.optionButton, optionStyle]}
            >
              <View style={s.optionLabel}>
                <Text style={s.optionLabelText}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={[s.optionText, optionTextStyle]}>
                {opt.meaning}
              </Text>
              {answered && isAnswer && (
                <Ionicons name='checkmark-circle' size={20} color={c.success} />
              )}
              {answered && isThis && !isAnswer && (
                <Ionicons name='close-circle' size={20} color={c.error} />
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Next Button */}
      {answered && (
        <TouchableOpacity onPress={handleNext} style={s.nextButton}>
          <Text style={s.nextButtonText}>
            {current + 1 >= questions.length ? "결과 보기" : "다음 문제"}
          </Text>
          <Ionicons name='arrow-forward' size={16} color={c.white} />
        </TouchableOpacity>
      )}
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
      backgroundColor: c.success,
      borderRadius: 3,
    },
    progressText: {
      fontSize: 12,
      color: c.textSecondary,
      fontWeight: "500",
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
      marginBottom: 12,
    },
    partOfSpeechBadge: {
      backgroundColor: c.tagBg,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 8,
    },
    partOfSpeechText: {
      fontSize: 12,
      color: c.textTertiary,
    },
    optionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
      marginBottom: 10,
      borderRadius: 12,
      borderWidth: 2,
      gap: 12,
    },
    optionButtonDefault: {
      backgroundColor: c.inputBg,
      borderColor: c.progressBg,
    },
    optionButtonCorrect: {
      backgroundColor: c.correctBg,
      borderColor: c.success,
    },
    optionButtonWrong: {
      backgroundColor: c.wrongBg,
      borderColor: c.error,
    },
    optionLabel: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.progressBg,
      justifyContent: "center",
      alignItems: "center",
    },
    optionLabelText: {
      fontSize: 12,
      fontWeight: "500",
      color: c.textSecondary,
    },
    optionText: {
      flex: 1,
      fontSize: 14,
      color: c.text,
    },
    optionTextDefault: {},
    optionTextCorrect: {
      color: c.success,
    },
    optionTextWrong: {
      color: c.error,
    },
    nextButton: {
      flexDirection: "row",
      backgroundColor: c.success,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 24,
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: c.white,
    },
  });
