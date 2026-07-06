let client = null;
async function getGa4Client(credentials) {
  if (!client) {
    const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
    client = new BetaAnalyticsDataClient({ credentials });
  }
  return client;
}
function resetGa4ClientForTests() {
  client = null;
}
export {
  getGa4Client,
  resetGa4ClientForTests
};
