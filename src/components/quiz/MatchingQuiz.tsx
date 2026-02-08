import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import type { ThemeColors } from "../../constants/colors";

const { width } = Dimensions.get("window");
const columnWidth = (width - 50) / 2;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MatchingQuiz({ words, questionCount, onComplete }) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);

  const quizWords = useMemo(() => {
    return shuffle(words).slice(0, Math.min(questionCount, 6, words.length));
  }, [words, questionCount]);

  const shuffledMeanings = useMemo(() => shuffle(quizWords), [quizWords]);

  const [selectedEnglish, setSelectedEnglish] = useState(null);
  const [matched, setMatched] = useState({});
  const [wrong, setWrong] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [shakeAnim] = useState(new Animated.Value(0));

  const handleEnglishClick = (id) => {
    if (matched[id]) return;
    setSelectedEnglish(id);
    setWrong(null);
  };

  const handleMeaningClick = (word) => {
    if (!selectedEnglish || Object.values(matched).includes(word.id)) return;

    setAttempts((p) => p + 1);
    if (selectedEnglish === word.id) {
      const newMatched = { ...matched, [word.id]: word.id };
      setMatched(newMatched);
      setSelectedEnglish(null);

      if (Object.keys(newMatched).length === quizWords.length) {
        const total = quizWords.length;
        const wrongCount = attempts + 1 - total;
        onComplete({
          total,
          correct: Math.max(0, total - wrongCount),
          results: quizWords.map((w) => ({ wordId: w.id, correct: true })),
        });
      }
    } else {
      setWrong(word.id);
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      setTimeout(() => setWrong(null), 600);
    }
  };

  return (
    <View>
      <View style={s.headerContainer}>
        <Text style={s.headingText}>영어 단어와 뜻을 매칭하세요</Text>
        <Text style={s.progressText}>
          {Object.keys(matched).length}/{quizWords.length} 완료
        </Text>
      </View>

      <View style={s.gridContainer}>
        {/* English Column */}
        <View style={[s.column, { width: columnWidth }]}>
          <Text style={s.columnLabel}>English</Text>
          <FlatList
            data={quizWords}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item: w }) => {
              const isMatched = matched[w.id];
              const isSelected = selectedEnglish === w.id;

              return (
                <TouchableOpacity
                  onPress={() => handleEnglishClick(w.id)}
                  disabled={isMatched}
                  style={[
                    s.matchButton,
                    isMatched && s.matchButtonMatched,
                    isSelected && s.matchButtonSelected,
                  ]}
                >
                  {isMatched && (
                    <Ionicons
                      name='checkmark-circle'
                      size={16}
                      color={c.success}
                      style={s.checkIcon}
                    />
                  )}
                  <Text
                    style={[
                      s.matchButtonText,
                      isMatched && s.matchButtonTextMatched,
                    ]}
                  >
                    {w.english}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Meaning Column */}
        <View style={[s.column, { width: columnWidth }]}>
          <Text style={s.columnLabel}>뜻</Text>
          <FlatList
            data={shuffledMeanings}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item: w }) => {
              const isMatched = Object.values(matched).includes(w.id);
              const isWrong = wrong === w.id;

              const shakeInterpolate = shakeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, isWrong ? 5 : 0],
              });

              return (
                <Animated.View
                  style={{
                    transform: [{ translateX: shakeInterpolate }],
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleMeaningClick(w)}
                    disabled={isMatched}
                    style={[
                      s.matchButton,
                      isMatched && s.matchButtonMatched,
                      isWrong && s.matchButtonWrong,
                    ]}
                  >
                    {isMatched && (
                      <Ionicons
                        name='checkmark-circle'
                        size={16}
                        color={c.success}
                        style={s.checkIcon}
                      />
                    )}
                    <Text
                      style={[
                        s.matchButtonText,
                        isMatched && s.matchButtonTextMatched,
                        isWrong && s.matchButtonTextWrong,
                      ]}
                    >
                      {w.meaning}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            }}
          />
        </View>
      </View>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    headerContainer: {
      alignItems: "center",
      marginBottom: 24,
    },
    headingText: {
      fontSize: 14,
      color: c.textSecondary,
      marginBottom: 8,
    },
    progressText: {
      fontSize: 12,
      color: c.textTertiary,
    },
    gridContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    column: {},
    columnLabel: {
      fontSize: 10,
      color: c.textTertiary,
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      textAlign: "center",
      marginBottom: 8,
    },
    matchButton: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      marginBottom: 8,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: c.progressBg,
      backgroundColor: c.inputBg,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    matchButtonMatched: {
      backgroundColor: c.correctBg,
      borderColor: c.success,
    },
    matchButtonSelected: {
      backgroundColor: c.highlightBg,
      borderColor: c.secondary,
    },
    matchButtonWrong: {
      backgroundColor: c.wrongBg,
      borderColor: c.error,
    },
    matchButtonText: {
      fontSize: 13,
      fontWeight: "500",
      color: c.text,
      flexShrink: 1,
    },
    matchButtonTextMatched: {
      color: c.success,
    },
    matchButtonTextWrong: {
      color: c.error,
    },
    checkIcon: {
      marginRight: 2,
    },
  });
