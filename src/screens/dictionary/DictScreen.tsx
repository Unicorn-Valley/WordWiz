import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WordCard from "../../components/dictionary/WordCard";
import { wordService } from "../../services";
import { useTheme } from "../../hooks/useTheme";
import type { ThemeColors } from "../../constants/colors";

export default function Dictionary() {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showPosDrawer, setShowPosDrawer] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [newWord, setNewWord] = useState({ english: "", meaning: "", part_of_speech: "noun" });
  const [addLoading, setAddLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  const filteredWords = useMemo(() => {
    let result = words;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (w) => w.english?.toLowerCase().includes(q) || w.meaning?.toLowerCase().includes(q),
      );
    }
    if (filter === "bookmarked") result = result.filter((w) => w.is_bookmarked);
    if (filter === "mastered") result = result.filter((w) => (w.mastery_level || 0) >= 80);
    if (filter === "learning") result = result.filter((w) => (w.mastery_level || 0) < 80);
    return result;
  }, [words, search, filter]);

  const handleToggleBookmark = async (word: any) => {
    setWords((prev) => prev.map((w) => (w.id === word.id ? { ...w, is_bookmarked: !w.is_bookmarked } : w)));
    try {
      await wordService.toggleBookmark(word.id);
    } catch (error: any) {
      setWords((prev) => prev.map((w) => (w.id === word.id ? { ...w, is_bookmarked: word.is_bookmarked } : w)));
      Alert.alert("오류", error.message || "북마크 변경에 실패했습니다.");
    }
  };

  const handleDelete = async (word: any) => {
    Alert.alert("삭제 확인", "이 단어를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          setWords((prev) => prev.filter((w) => w.id !== word.id));
          try {
            await wordService.deleteWord(word.id);
          } catch (error: any) {
            setWords((prev) => [word, ...prev]);
            Alert.alert("오류", error.message || "삭제에 실패했습니다.");
          }
        },
      },
    ]);
  };

  const handleAdd = async () => {
    if (!newWord.english || !newWord.meaning) return;
    setAddLoading(true);
    try {
      const created = await wordService.createWord({
        english: newWord.english,
        meaning: newWord.meaning,
        part_of_speech: newWord.part_of_speech as any,
        source: "manual",
        difficulty: "medium",
      });
      setWords((prev) => [created, ...prev]);
      setNewWord({ english: "", meaning: "", part_of_speech: "noun" });
      setShowAdd(false);
      Alert.alert("성공", "단어가 추가되었습니다!");
    } catch (error: any) {
      Alert.alert("오류", error.message || "단어 추가에 실패했습니다.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWords().catch(() => {});
    setRefreshing(false);
  };

  return (
    <View style={s.container}>
      <ScrollView style={s.scrollView} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        <View style={s.content}>
          {/* Header */}
          <View style={s.header}>
            <View>
              <View style={s.titleRow}>
                <Ionicons name="book-outline" size={24} color={c.warning} />
                <Text style={s.title}>단어장</Text>
                <TouchableOpacity onPress={() => setShowHelp(true)} style={s.helpButton}>
                  <Ionicons name="help-circle-outline" size={20} color={c.textTertiary} />
                </TouchableOpacity>
              </View>
              <Text style={s.subtitle}>{words.length}개 단어</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAdd(true)} style={s.addButton}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={s.addButtonText}>추가</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={s.searchContainer}>
            <Ionicons name="search-outline" size={18} color={c.textTertiary} style={s.searchIcon} />
            <TextInput
              placeholder="단어 또는 뜻 검색..."
              placeholderTextColor={c.textTertiary}
              value={search}
              onChangeText={setSearch}
              style={s.searchInput}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch("")} style={s.clearButton}>
                <Ionicons name="close-outline" size={18} color={c.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScrollView}>
            {[
              { value: "all", label: "전체" },
              { value: "bookmarked", label: "북마크" },
              { value: "mastered", label: "마스터" },
              { value: "learning", label: "학습중" },
            ].map((f) => (
              <TouchableOpacity
                key={f.value}
                onPress={() => setFilter(f.value)}
                style={[s.filterButton, filter === f.value && s.filterButtonActive]}
              >
                <Text style={[s.filterButtonText, filter === f.value && s.filterButtonTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Word List */}
          {isLoading ? (
            <View style={s.centerContainer}>
              <ActivityIndicator size="large" color={c.primary} />
            </View>
          ) : filteredWords.length === 0 ? (
            <View style={s.emptyContainer}>
              <Ionicons name="book-outline" size={48} color={c.border} />
              <Text style={s.emptyText}>{search ? "검색 결과가 없습니다" : "아직 저장된 단어가 없어요"}</Text>
              <Text style={s.emptySubtext}>스캔으로 단어를 추가해보세요!</Text>
            </View>
          ) : (
            <View style={s.wordList}>{filteredWords.map((word) => (
              <WordCard key={word.id} word={word} onToggleBookmark={handleToggleBookmark} onDelete={handleDelete} />
            ))}</View>
          )}
        </View>
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>단어 직접 추가</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)} style={s.modalCloseButton}>
                <Ionicons name="close" size={24} color={c.text} />
              </TouchableOpacity>
            </View>
            <View style={s.modalBody}>
              <View style={s.inputGroup}>
                <Text style={s.label}>영어 단어</Text>
                <TextInput value={newWord.english} onChangeText={(t) => setNewWord({ ...newWord, english: t })} placeholder="apple" placeholderTextColor={c.textTertiary} style={s.input} />
              </View>
              <View style={s.inputGroup}>
                <Text style={s.label}>뜻</Text>
                <TextInput value={newWord.meaning} onChangeText={(t) => setNewWord({ ...newWord, meaning: t })} placeholder="사과" placeholderTextColor={c.textTertiary} style={s.input} />
              </View>
              <View style={s.inputGroup}>
                <Text style={s.label}>품사</Text>
                <TouchableOpacity onPress={() => setShowPosDrawer(true)} style={s.posButton}>
                  <Text style={s.posButtonText}>
                    {newWord.part_of_speech === "noun" ? "명사" : newWord.part_of_speech === "verb" ? "동사" : newWord.part_of_speech === "adjective" ? "형용사" : newWord.part_of_speech === "adverb" ? "부사" : "기타"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={c.textSecondary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleAdd}
                disabled={addLoading || !newWord.english || !newWord.meaning}
                style={[s.submitButton, (addLoading || !newWord.english || !newWord.meaning) && s.submitButtonDisabled]}
              >
                {addLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.submitButtonText}>추가하기</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Help Modal */}
      <Modal visible={showHelp} animationType="fade" transparent onRequestClose={() => setShowHelp(false)}>
        <View style={s.helpOverlay}>
          <View style={s.helpContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>학습 단계 안내</Text>
              <TouchableOpacity onPress={() => setShowHelp(false)} style={s.modalCloseButton}>
                <Ionicons name="close" size={24} color={c.text} />
              </TouchableOpacity>
            </View>
            <View style={s.helpBody}>
              {[
                { icon: "leaf" as const, color: "#64748b", label: "시작 (0~39%)", desc: "새로 추가했거나 아직 퀴즈를 많이 풀지 않은 단어예요." },
                { icon: "flame" as const, color: "#f59e0b", label: "학습중 (40~79%)", desc: "퀴즈에서 점점 맞추고 있어요. 조금만 더 노력하면 마스터!" },
                { icon: "trophy" as const, color: "#10b981", label: "마스터 (80%+)", desc: "퀴즈 정답률 80% 이상! 이 단어는 완벽히 익혔어요." },
              ].map((item, i) => (
                <View key={i} style={s.helpItem}>
                  <View style={[s.helpBadge, { backgroundColor: `${item.color}1F` }]}>
                    <Ionicons name={item.icon} size={16} color={item.color} />
                  </View>
                  <View style={s.helpTextGroup}>
                    <Text style={[s.helpLabel, { color: item.color }]}>{item.label}</Text>
                    <Text style={s.helpDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
              <View style={s.helpTip}>
                <Ionicons name="bulb-outline" size={14} color={c.secondary} />
                <Text style={s.helpTipText}>퀴즈를 풀면 정답률에 따라 게이지가 자동으로 올라갑니다.</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* POS Drawer */}
      <Modal visible={showPosDrawer} animationType="slide" transparent onRequestClose={() => setShowPosDrawer(false)}>
        <View style={s.drawerOverlay}>
          <TouchableOpacity style={s.drawerBackdrop} activeOpacity={1} onPress={() => setShowPosDrawer(false)} />
          <View style={s.drawerContent}>
            <View style={s.drawerHeader}>
              <Text style={s.drawerTitle}>품사 선택</Text>
            </View>
            <View style={s.drawerBody}>
              {[
                { value: "noun", label: "명사" },
                { value: "verb", label: "동사" },
                { value: "adjective", label: "형용사" },
                { value: "adverb", label: "부사" },
                { value: "other", label: "기타" },
              ].map((pos) => (
                <TouchableOpacity
                  key={pos.value}
                  onPress={() => { setNewWord({ ...newWord, part_of_speech: pos.value }); setShowPosDrawer(false); }}
                  style={[s.posOption, newWord.part_of_speech === pos.value && s.posOptionActive]}
                >
                  <Text style={[s.posOptionText, newWord.part_of_speech === pos.value && s.posOptionTextActive]}>
                    {pos.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scrollView: { flex: 1 },
    content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, maxWidth: 512, alignSelf: "center", width: "100%" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    title: { fontSize: 24, fontWeight: "bold", color: c.text, marginLeft: 8 },
    subtitle: { fontSize: 12, color: c.textSecondary, marginTop: 2 },
    addButton: { flexDirection: "row", alignItems: "center", backgroundColor: c.success, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 4 },
    addButtonText: { color: "#fff", fontSize: 14, fontWeight: "500" },
    searchContainer: { position: "relative", marginBottom: 16 },
    searchIcon: { position: "absolute", left: 12, top: 14, zIndex: 1 },
    searchInput: { paddingLeft: 40, paddingRight: 40, paddingVertical: 12, backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border, borderRadius: 12, color: c.text, fontSize: 14 },
    clearButton: { position: "absolute", right: 12, top: 14 },
    filterScrollView: { marginBottom: 20 },
    filterButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border, marginRight: 8 },
    filterButtonActive: { backgroundColor: c.selectedBg, borderColor: c.primary },
    filterButtonText: { fontSize: 12, fontWeight: "500", color: c.textSecondary },
    filterButtonTextActive: { color: c.primary },
    centerContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 48 },
    emptyContainer: { alignItems: "center", paddingVertical: 48 },
    emptyText: { fontSize: 14, color: c.textTertiary, marginTop: 12 },
    emptySubtext: { fontSize: 12, color: c.disabled, marginTop: 4 },
    wordList: { gap: 8 },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: "flex-end" },
    modalContent: { backgroundColor: c.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: c.border, maxHeight: "80%" },
    modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: c.border },
    modalTitle: { fontSize: 18, fontWeight: "600", color: c.text },
    modalCloseButton: { padding: 4 },
    modalBody: { paddingHorizontal: 20, paddingVertical: 20 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 12, color: c.textSecondary, marginBottom: 4 },
    input: { backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: c.text, fontSize: 14 },
    posButton: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
    posButtonText: { color: c.text, fontSize: 14 },
    submitButton: { backgroundColor: c.success, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
    submitButtonDisabled: { opacity: 0.5 },
    submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

    // Drawer
    drawerOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: "flex-end" },
    drawerBackdrop: { flex: 1 },
    drawerContent: { backgroundColor: c.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: c.border },
    drawerHeader: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: c.border },
    drawerTitle: { fontSize: 18, fontWeight: "600", color: c.text },
    drawerBody: { paddingHorizontal: 16, paddingVertical: 24, gap: 8 },
    posOption: { backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
    posOptionActive: { backgroundColor: c.selectedBg, borderColor: c.primary },
    posOptionText: { color: c.text, fontSize: 14 },
    posOptionTextActive: { color: c.primary },

    // Help
    helpButton: { marginLeft: 4, padding: 2 },
    helpOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
    helpContent: { backgroundColor: c.card, borderRadius: 20, borderWidth: 1, borderColor: c.border, width: "100%", maxWidth: 400 },
    helpBody: { paddingHorizontal: 20, paddingVertical: 20, gap: 16 },
    helpItem: { flexDirection: "row", alignItems: "center", gap: 12 },
    helpBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
    helpTextGroup: { flex: 1 },
    helpLabel: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
    helpDesc: { fontSize: 12, color: c.textSecondary, lineHeight: 17 },
    helpTip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: c.highlightBg, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, marginTop: 4 },
    helpTipText: { fontSize: 12, color: c.secondary, flex: 1, lineHeight: 17 },
  });
