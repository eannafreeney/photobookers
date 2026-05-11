import Hyperview from "hyperview";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";

/**
 * The base URL of the Hyperview server.
 *
 * - In the iOS simulator or Android emulator, use the machine's LAN IP so the
 *   device can reach the host process.  Alternatively, for Android emulator
 *   you can use the special alias `10.0.2.2`.
 *
 * - On a physical device both the device and the dev machine must be on the
 *   same Wi-Fi network; replace the placeholder with your machine's IP.
 *
 * - In production, point this at your deployed domain.
 */
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
    <NavigationContainer>
      <Hyperview
        entrypointUrl={ENTRYPOINT_URL}
        fetch={fetch}
        formatDate={formatDate}
      />
    </NavigationContainer>
  );
}
