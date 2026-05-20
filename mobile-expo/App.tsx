import Hyperview from "hyperview";
import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import React, { useMemo, useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "./lib/supabase";
import { createAuthedFetch } from "./lib/authedFetch";

const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:3000";
const ENTRYPOINT_URL = `${BASE_URL}/hyperview`;

function formatDate(date: Date | null | undefined, format: string): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return format
    .replace("YYYY", String(date.getFullYear()))
    .replace("MM", pad(date.getMonth() + 1))
    .replace("DD", pad(date.getDate()));
}

export default function App() {
  const [, setSessionTick] = useState(0);

  const [fontsLoaded, fontError] = useFonts({
    "Caveat-Regular": require("./assets/fonts/Caveat-Regular.ttf"),
    "Caveat-Medium": require("./assets/fonts/Caveat-Medium.ttf"),
    "Caveat-SemiBold": require("./assets/fonts/Caveat-SemiBold.ttf"),
    "Caveat-Bold": require("./assets/fonts/Caveat-Bold.ttf"),
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => setSessionTick((n) => n + 1));
    return () => subscription.unsubscribe();
  }, []);

  const authedFetch = useMemo(() => createAuthedFetch(supabase), []);

  if (!fontsLoaded && !fontError) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0099cc",
          }}
        >
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Hyperview
          entrypointUrl={ENTRYPOINT_URL}
          fetch={authedFetch}
          formatDate={formatDate as never}
        />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
