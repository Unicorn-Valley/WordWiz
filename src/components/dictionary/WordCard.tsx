import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import type { ThemeColors } from "../../constants/colors";

const posLabels: Record<string, string> = {
  noun: "명사",
  verb: "동사",
  adjective: "형용사",
  adverb: "부사",
  preposition: "전치사",
  conjunction: "접속사",
  pronoun: "대명사",
  interjection: "감탄사",
  other: "기타",
};

const getMasteryInfo = (level: number) => {
  if (level >= 80)
    return { label: "마스터", icon: "trophy" as const, color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" };
  if (level >= 40)
    return { label: "학습중", icon: "flame" as const, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)" };
  return { label: "시작", icon: "leaf" as const, color: "#64748b", bg: "rgba(100, 116, 139, 0.12)" };
};

export default function WordCard({ word, onToggleBookmark, onDelete }: any) {
  const c = useTheme();
  const s = makeStyles(c);
  const masteryLevel = word.mastery_level || 0;
  const mastery = getMasteryInfo(masteryLevel);

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={s.contentContainer}>
          <View style={s.titleRow}>
            <Text style={s.english}>{word.english}</Text>
            {word.part_of_speech && (
              <View style={s.posTag}>
                <Text style={s.posText}>
                  {posLabels[word.part_of_speech] || word.part_of_speech}
                </Text>
              </View>
            )}
          </View>
          <Text style={s.meaning}>{word.meaning}</Text>
          {word.example_sentence && (
            <Text style={s.example}>"{word.example_sentence}"</Text>
          )}
        </View>

        <View style={s.actionsContainer}>
          <TouchableOpacity onPress={() => onToggleBookmark(word)} style={s.actionButton}>
            <Ionicons
              name={word.is_bookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color={word.is_bookmarked ? "#fbbf24" : c.textTertiary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(word)} style={s.actionButton}>
            <Ionicons name="trash-outline" size={18} color={c.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.masteryContainer}>
        <View style={[s.masteryBadge, { backgroundColor: mastery.bg }]}>
          <Ionicons name={mastery.icon} size={12} color={mastery.color} />
          <Text style={[s.masteryLabel, { color: mastery.color }]}>{mastery.label}</Text>
        </View>
        <View style={s.masteryBarRow}>
          <View style={s.masteryBg}>
            <View style={[s.masteryBar, { width: `${masteryLevel}%`, backgroundColor: mastery.color }]} />
          </View>
          <Text style={[s.masteryText, { color: mastery.color }]}>{masteryLevel}%</Text>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: c.cardBorder,
      marginBottom: 8,
    },
    cardHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
    contentContainer: { flex: 1, minWidth: 0 },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    english: { fontSize: 16, fontWeight: "bold", color: c.text },
    posTag: { backgroundColor: c.tagBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 },
    posText: { fontSize: 10, color: c.textTertiary },
    meaning: { fontSize: 14, color: c.textSecondary, marginTop: 2 },
    example: { fontSize: 12, color: c.textTertiary, fontStyle: "italic", marginTop: 6, lineHeight: 18 },
    actionsContainer: { flexDirection: "row", gap: 4, marginLeft: 8 },
    actionButton: { padding: 6, borderRadius: 8 },
    masteryContainer: { marginTop: 12, gap: 6 },
    masteryBadge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    masteryLabel: { fontSize: 11, fontWeight: "600" },
    masteryBarRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    masteryBg: { flex: 1, height: 6, backgroundColor: c.progressBg, borderRadius: 3, overflow: "hidden" },
    masteryBar: { height: "100%", borderRadius: 3 },
    masteryText: { fontSize: 11, fontWeight: "600", minWidth: 30, textAlign: "right" },
  });
