import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Animated,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PullToRefresh({ onRefresh, children }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullAnim = useRef(new Animated.Value(0)).current;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor='#10b981'
        />
      }
      scrollEnabled={true}
    >
      <View>
        {isRefreshing && (
          <View style={styles.refreshIndicator}>
            <Ionicons
              name='sync'
              size={20}
              color='#10b981'
              style={styles.refreshIcon}
            />
          </View>
        )}
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  refreshIndicator: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshIcon: {
    marginBottom: 8,
  },
});
