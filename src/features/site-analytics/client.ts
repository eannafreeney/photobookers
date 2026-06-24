import { BetaAnalyticsDataClient } from "@google-analytics/data";

let client: BetaAnalyticsDataClient | null = null;

export function getGa4Client(
  credentials: Record<string, unknown>,
): BetaAnalyticsDataClient {
  if (!client) {
    client = new BetaAnalyticsDataClient({ credentials });
  }
  return client;
}

export function resetGa4ClientForTests(): void {
  client = null;
}
