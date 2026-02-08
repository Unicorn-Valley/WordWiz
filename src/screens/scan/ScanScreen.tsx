import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import type { ThemeColors } from "../../constants/colors";
import ScanUploader from "../../components/scan/ScanUploader";
import ExtractedWordsList from "../../components/scan/ExtractedWordsList";

export default function ScanScreen() {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const [extractedWords, setExtractedWords] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReset = () => {
    setExtractedWords([]);
  };

  return (
    <View style={s.container}>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 설명 */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <View style={s.headerIcon}>
              <Ionicons name='scan-outline' size={20} color='#06b6d4' />
            </View>
            <Text style={s.title}>단어 스캔</Text>
          </View>
          <Text style={s.subtitle}>
            영어 단어장을 촬영하면 자동으로 단어를 추출합니다
          </Text>
        </View>

        {extractedWords.length === 0 ? (
          <ScanUploader
            onWordsExtracted={setExtractedWords}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        ) : (
          <View>
            <TouchableOpacity
              style={s.resetButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Ionicons name='arrow-back' size={16} color={c.primary} />
              <Text style={s.resetText}>다시 스캔하기</Text>
            </TouchableOpacity>
            <ExtractedWordsList words={extractedWords} onDone={handleReset} />
          </View>
        )}

        {/* 스캔 팁 */}
        {extractedWords.length === 0 && !isProcessing && (
          <View style={s.tipsCard}>
            <Text style={s.tipsTitle}>스캔 팁</Text>
            <View style={s.tipsList}>
              {[
                {
                  icon: "sunny-outline",
                  text: "밝은 곳에서 촬영하면 인식률이 높아져요",
                },
                {
                  icon: "eye-outline",
                  text: "단어와 뜻이 명확히 보이도록 찍어주세요",
                },
                {
                  icon: "document-outline",
                  text: "한 페이지씩 촬영하는 것이 좋아요",
                },
                {
                  icon: "hand-left-outline",
                  text: "흔들리지 않게 고정해서 촬영하세요",
                },
              ].map((tip, i) => (
                <View key={i} style={s.tipRow}>
                  <Ionicons
                    name={tip.icon as any}
                    size={16}
                    color={c.textSecondary}
                  />
                  <Text style={s.tipText}>{tip.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    header: {
      marginBottom: 24,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    },
    headerIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(6, 182, 212, 0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: c.text,
    },
    subtitle: {
      fontSize: 14,
      color: c.textSecondary,
      marginLeft: 44,
    },
    resetButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: 16,
    },
    resetText: {
      fontSize: 14,
      fontWeight: "500",
      color: c.primary,
    },
    tipsCard: {
      marginTop: 28,
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 18,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    tipsTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: c.text,
      marginBottom: 14,
    },
    tipsList: {
      gap: 10,
    },
    tipRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    tipText: {
      fontSize: 13,
      color: c.textSecondary,
      flex: 1,
    },
  });
