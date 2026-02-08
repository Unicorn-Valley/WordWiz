import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import type { ThemeColors } from "../../constants/colors";

interface Word {
  english: string;
  meaning: string;
  part_of_speech?: string;
  example_sentence?: string;
}

interface ExtractedWordsListProps {
  words: Word[];
  onDone: () => void;
}

export default function ExtractedWordsList({
  words,
  onDone,
}: ExtractedWordsListProps) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const [selected, setSelected] = useState<boolean[]>(words.map(() => true));
  const [saving, setSaving] = useState(false);

  const toggleWord = (index: number) => {
    setSelected((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleSave = async () => {
    const toSave = words
      .filter((_, i) => selected[i])
      .map((w) => ({
        english: w.english,
        meaning: w.meaning,
        part_of_speech: w.part_of_speech || "other",
        example_sentence: w.example_sentence || "",
        source: "scan",
        difficulty: "medium",
        mastery_level: 0,
        times_correct: 0,
        times_wrong: 0,
        is_bookmarked: false,
      }));

    if (toSave.length === 0) return;

    setSaving(true);
    try {
      // TODO: 백엔드 연동 - 추출된 단어를 서버에 저장
      // await wordService.bulkCreate(toSave);
      Alert.alert("성공", `${toSave.length}개 단어가 저장되었습니다!`);
      onDone();
    } catch (error) {
      Alert.alert("오류", "단어 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = selected.filter(Boolean).length;

  return (
    <View style={s.container}>
      {/* 헤더 */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>추출된 단어</Text>
          <Text style={s.headerCount}>
            {selectedCount}/{words.length}개 선택됨
          </Text>
        </View>
        <TouchableOpacity
          style={[
            s.saveButton,
            (saving || selectedCount === 0) && s.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving || selectedCount === 0}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="save-outline" size={16} color="#fff" />
          )}
          <Text style={s.saveText}>저장하기</Text>
        </TouchableOpacity>
      </View>

      {/* 단어 목록 */}
      <ScrollView
        style={s.list}
        showsVerticalScrollIndicator={false}
      >
        {words.map((word, i) => (
          <TouchableOpacity
            key={i}
            style={[
              s.wordCard,
              selected[i] ? s.wordSelected : s.wordUnselected,
            ]}
            onPress={() => toggleWord(i)}
            activeOpacity={0.7}
          >
            <View style={s.wordRow}>
              <View
                style={[
                  s.check,
                  selected[i] ? s.checkOn : s.checkOff,
                ]}
              >
                {selected[i] && (
                  <Ionicons name="checkmark" size={13} color="#fff" />
                )}
              </View>

              <View style={s.wordInfo}>
                <View style={s.wordTitleRow}>
                  <Text style={s.wordEnglish}>{word.english}</Text>
                  {word.part_of_speech && (
                    <View style={s.posBadge}>
                      <Text style={s.posText}>{word.part_of_speech}</Text>
                    </View>
                  )}
                </View>
                <Text style={s.wordMeaning}>{word.meaning}</Text>
                {word.example_sentence && (
                  <Text style={s.wordExample}>
                    "{word.example_sentence}"
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: c.text,
    },
    headerCount: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 2,
    },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: c.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
    },
    saveButtonDisabled: {
      opacity: 0.4,
    },
    saveText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#fff",
    },
    list: {
      maxHeight: 420,
    },
    wordCard: {
      padding: 14,
      borderRadius: 14,
      marginBottom: 8,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    wordSelected: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.selectedBorder,
    },
    wordUnselected: {
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.border,
      opacity: 0.55,
    },
    wordRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    check: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    checkOn: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    checkOff: {
      borderColor: c.gray,
      backgroundColor: "transparent",
    },
    wordInfo: {
      flex: 1,
    },
    wordTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    wordEnglish: {
      fontSize: 15,
      fontWeight: "600",
      color: c.text,
    },
    posBadge: {
      backgroundColor: c.tagBg,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
    },
    posText: {
      fontSize: 10,
      color: c.textSecondary,
      fontWeight: "500",
    },
    wordMeaning: {
      fontSize: 13,
      color: c.textSecondary,
      marginTop: 4,
    },
    wordExample: {
      fontSize: 12,
      color: c.gray,
      fontStyle: "italic",
      marginTop: 4,
    },
  });
