import type { BetaAnalyticsDataClient } from "@google-analytics/data";

let client: BetaAnalyticsDataClient | null = null;

export async function getGa4Client(
  credentials: Record<string, unknown>,
): Promise<BetaAnalyticsDataClient> {
  if (!client) {
    const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
    client = new BetaAnalyticsDataClient({ credentials });
  }
  return client;
}

export function resetGa4ClientForTests(): void {
  client = null;
}
