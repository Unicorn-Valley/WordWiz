import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import type { ThemeColors } from "../../constants/colors";

interface ScanUploaderProps {
  onWordsExtracted: (words: any[]) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
}

export default function ScanUploader({
  onWordsExtracted,
  isProcessing,
  setIsProcessing,
}: ScanUploaderProps) {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const [preview, setPreview] = useState<string | null>(null);

  const pickImage = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("권한 필요", "카메라 접근 권한이 필요합니다.");
          return;
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.8,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.8,
            base64: true,
          });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setPreview(asset.uri);
      setIsProcessing(true);

      // TODO: 백엔드 AI 모델 연동
      // asset.uri 또는 asset.base64를 서버로 전송하여 단어 추출
      try {
        // const response = await scanService.extractWords(asset.uri, asset.base64);
        // onWordsExtracted(response.words);

        Alert.alert(
          "백엔드 연동 필요",
          "AI 모델과 연동하여 단어를 추출하는 기능이 준비 중입니다.\n\n이미지가 성공적으로 선택되었습니다.",
          [{ text: "확인" }]
        );
        onWordsExtracted([]);
      } catch (error) {
        Alert.alert("오류", "단어 추출 중 오류가 발생했습니다.");
      } finally {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("오류", "이미지를 불러오는 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  };

  return (
    <View style={s.container}>
      {/* 이미지 미리보기 */}
      {preview && (
        <View style={s.previewCard}>
          <Image source={{ uri: preview }} style={s.previewImage} />
          {isProcessing && (
            <View style={s.processingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={s.processingText}>
                단어를 추출하고 있어요...
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 업로드 버튼 */}
      <View style={s.buttonRow}>
        <TouchableOpacity
          style={[s.uploadCard, isProcessing && s.disabled]}
          onPress={() => pickImage(true)}
          disabled={isProcessing}
          activeOpacity={0.7}
        >
          <View style={[s.uploadIcon, { backgroundColor: "rgba(6, 182, 212, 0.12)" }]}>
            <Ionicons name="camera-outline" size={28} color="#06b6d4" />
          </View>
          <Text style={s.uploadLabel}>카메라 촬영</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.uploadCard, isProcessing && s.disabled]}
          onPress={() => pickImage(false)}
          disabled={isProcessing}
          activeOpacity={0.7}
        >
          <View style={[s.uploadIcon, { backgroundColor: "rgba(88, 86, 214, 0.12)" }]}>
            <Ionicons name="images-outline" size={28} color={c.secondary} />
          </View>
          <Text style={s.uploadLabel}>갤러리 선택</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      gap: 12,
    },
    previewCard: {
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: c.card,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    previewImage: {
      width: "100%",
      height: 220,
      resizeMode: "cover",
    },
    processingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.55)",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    processingText: {
      fontSize: 14,
      fontWeight: "500",
      color: "#fff",
    },
    buttonRow: {
      flexDirection: "row",
      gap: 12,
    },
    uploadCard: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 24,
      borderRadius: 16,
      backgroundColor: c.card,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    disabled: {
      opacity: 0.5,
    },
    uploadIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
    },
    uploadLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: c.text,
    },
  });
