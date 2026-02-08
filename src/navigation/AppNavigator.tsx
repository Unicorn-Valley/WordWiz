import React, { useEffect, useMemo } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../hooks/useTheme";
import type { ThemeColors } from "../constants/colors";

// Screens
import { LoginScreen } from "../screens/login/LoginScreen";
import { HomeScreen } from "../screens/home/HomeScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import Dictionary from "../screens/dictionary/DictScreen";
import Quiz from "../screens/quiz/QuizScreen";
import ScanScreen from "../screens/scan/ScanScreen";

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- 탭별 Stack Navigator ---
const HomeStack = createNativeStackNavigator();
function HomeStackScreen() {
  const c = useTheme();
  const opts = useMemo(() => stackScreenOptions(c), [c]);
  return (
    <HomeStack.Navigator id="HomeStack" screenOptions={opts}>
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: "WordWiz" }}
      />
    </HomeStack.Navigator>
  );
}

const DictionaryStack = createNativeStackNavigator();
function DictionaryStackScreen() {
  const c = useTheme();
  const opts = useMemo(() => stackScreenOptions(c), [c]);
  return (
    <DictionaryStack.Navigator id="DictionaryStack" screenOptions={opts}>
      <DictionaryStack.Screen
        name="DictScreen"
        component={Dictionary}
        options={{ title: "단어장" }}
      />
    </DictionaryStack.Navigator>
  );
}

const ScanStack = createNativeStackNavigator();
function ScanStackScreen() {
  const c = useTheme();
  const opts = useMemo(() => stackScreenOptions(c), [c]);
  return (
    <ScanStack.Navigator id="ScanStack" screenOptions={opts}>
      <ScanStack.Screen
        name="ScanScreenInner"
        component={ScanScreen}
        options={{ title: "단어 스캔" }}
      />
    </ScanStack.Navigator>
  );
}

const QuizStack = createNativeStackNavigator();
function QuizStackScreen() {
  const c = useTheme();
  const opts = useMemo(() => stackScreenOptions(c), [c]);
  return (
    <QuizStack.Navigator id="QuizStack" screenOptions={opts}>
      <QuizStack.Screen
        name="QuizScreen"
        component={Quiz}
        options={{ title: "퀴즈" }}
      />
    </QuizStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator();
function ProfileStackScreen() {
  const c = useTheme();
  const opts = useMemo(() => stackScreenOptions(c), [c]);
  return (
    <ProfileStack.Navigator id="ProfileStack" screenOptions={opts}>
      <ProfileStack.Screen
        name="ProfileScreenInner"
        component={ProfileScreen}
        options={{ title: "프로필" }}
      />
    </ProfileStack.Navigator>
  );
}

// --- Bottom Tab Navigator ---
const TAB_ICONS: Record<string, { focused: string; unfocused: string }> = {
  Home: { focused: "home", unfocused: "home-outline" },
  Dictionary: { focused: "book", unfocused: "book-outline" },
  Scan: { focused: "scan", unfocused: "scan-outline" },
  Quiz: { focused: "bulb", unfocused: "bulb-outline" },
  Profile: { focused: "person", unfocused: "person-outline" },
};

function MainTabs() {
  const c = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.gray,
        tabBarStyle: {
          backgroundColor: c.card,
          borderTopColor: c.border,
          borderTopWidth: 1,
          paddingTop: 4,
          paddingBottom: Math.max(insets.bottom, 6),
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600" as const,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{ tabBarLabel: "홈" }}
      />
      <Tab.Screen
        name="Dictionary"
        component={DictionaryStackScreen}
        options={{ tabBarLabel: "단어장" }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanStackScreen}
        options={{ tabBarLabel: "스캔" }}
      />
      <Tab.Screen
        name="Quiz"
        component={QuizStackScreen}
        options={{ tabBarLabel: "퀴즈" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{ tabBarLabel: "프로필" }}
      />
    </Tab.Navigator>
  );
}

// --- Root Navigator ---
export const AppNavigator: React.FC = () => {
  const c = useTheme();
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <RootStack.Screen name="Login" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

// --- Helpers ---
const stackScreenOptions = (c: ThemeColors) => ({
  headerStyle: { backgroundColor: c.primary },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "bold" as const },
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
