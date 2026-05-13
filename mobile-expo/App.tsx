import Hyperview from "hyperview";
import { NavigationContainer } from "@react-navigation/native";
import React, { useMemo, useState, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "./lib/supabase";
import { createAuthedFetch } from "./lib/authedFetch";

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
  const [, setSessionTick] = useState(0);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => setSessionTick((n) => n + 1));
    return () => subscription.unsubscribe();
  }, []);

  const authedFetch = useMemo(() => createAuthedFetch(supabase), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Hyperview
          entrypointUrl={ENTRYPOINT_URL}
          fetch={authedFetch}
          formatDate={formatDate}
        />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
