import Hyperview from "hyperview";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const BASE_URL = process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:3000";

const ENTRYPOINT_URL = `${BASE_URL}/hyperview`;

function formatDate(date: Date, format: string): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return format
    .replace("YYYY", String(date.getFullYear()))
    .replace("MM", pad(date.getMonth() + 1))
    .replace("DD", pad(date.getDate()));
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Hyperview
          entrypointUrl={ENTRYPOINT_URL}
          fetch={fetch}
          formatDate={formatDate}
        />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
