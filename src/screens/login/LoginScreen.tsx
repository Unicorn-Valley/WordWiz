import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../../config/supabase";
import { useTheme } from "../../hooks/useTheme";
import type { ThemeColors } from "../../constants/colors";

WebBrowser.maybeCompleteAuthSession();

/**
 * 로그인 화면 - Google OAuth (Supabase OAuth 플로우)
 */
export const LoginScreen: React.FC = () => {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      const redirectUrl = Linking.createURL("auth/callback");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data?.url) {
        Alert.alert("오류", "로그인을 시작할 수 없습니다.");
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl,
      );

      if (result.type === "success") {
        const url = result.url;
        // URL fragment에서 토큰 추출
        const fragment = url.split("#")[1];
        if (fragment) {
          const params = new URLSearchParams(fragment);
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }
      }
    } catch (error: any) {
      Alert.alert("로그인 실패", error.message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.content}>
        <Text style={s.title}>환영합니다</Text>
        <Text style={s.subtitle}>Google 계정으로 시작하세요</Text>

        <TouchableOpacity
          style={[s.googleButton, isLoading && s.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          <Text style={s.googleIcon}>G</Text>
          <Text style={s.googleButtonText}>
            {isLoading ? "로그인 중..." : "Google로 계속하기"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: c.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: c.textSecondary,
      marginBottom: 48,
    },
    googleButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.card,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
      minWidth: 280,
      justifyContent: "center",
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    googleIcon: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#4285F4",
      marginRight: 12,
    },
    googleButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: c.text,
    },
  });
