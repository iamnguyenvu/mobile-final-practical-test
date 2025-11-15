import { openDatabase } from "@/db";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function RootLayout() {
  useEffect(() => {
    // Khởi tạo database khi app start (chỉ trên native platforms)
    if (Platform.OS !== 'web') {
      openDatabase().catch(console.error);
    }
  }, []);

  return <Stack />;
}
