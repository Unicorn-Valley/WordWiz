import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../hooks/useTheme";
import type { ThemeColors } from "../../constants/colors";

/**
 * 프로필 화면
 */
export const ProfileScreen: React.FC = () => {
  const c = useTheme();
  const s = useMemo(() => makeStyles(c), [c]);
  const { user, signOut } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.card}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {user?.name?.charAt(0).toUpperCase() ||
              user?.email?.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={s.name}>{user?.name || "사용자"}</Text>
        <Text style={s.email}>{user?.email}</Text>

        <View style={s.infoContainer}>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>가입일</Text>
            <Text style={s.infoValue}>
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("ko-KR")
                : "-"}
            </Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>사용자 ID</Text>
            <Text style={s.infoValue}>{user?.id.substring(0, 8)}...</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={s.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={18} color={c.error} />
        <Text style={s.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    card: {
      backgroundColor: c.card,
      borderRadius: 12,
      padding: 24,
      alignItems: "center",
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    avatarText: {
      fontSize: 32,
      color: "#fff",
      fontWeight: "bold",
    },
    name: {
      fontSize: 24,
      fontWeight: "bold",
      color: c.text,
      marginBottom: 8,
    },
    email: {
      fontSize: 16,
      color: c.textSecondary,
      marginBottom: 24,
    },
    infoContainer: {
      width: "100%",
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    infoLabel: {
      fontSize: 14,
      color: c.textSecondary,
      fontWeight: "600",
    },
    infoValue: {
      fontSize: 14,
      color: c.text,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 12,
      gap: 6,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      marginTop: 20,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    logoutText: {
      fontSize: 14,
      fontWeight: "500",
      color: c.error,
    },
  });
