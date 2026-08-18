const BASE = "https://graph.facebook.com/v21.0";
function getConfig() {
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accountId || !token) return null;
  return { accountId, token };
}
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Instagram API ${res.status}: ${text}`);
  }
  return res.json();
}
async function fetchPostInsights(postId, mediaType, token) {
  const isReel = mediaType === "VIDEO";
  const metrics = isReel ? "reach,plays,saved,shares" : "reach,impressions,saved,shares";
  try {
    const data = await fetchJson(`${BASE}/${postId}/insights?metric=${metrics}&access_token=${token}`);
    const map = Object.fromEntries(
      data.data.map((m) => [m.name, m.values[0]?.value ?? 0])
    );
    return {
      reach: map.reach ?? 0,
      impressions: map.impressions ?? map.plays ?? 0,
      saved: map.saved ?? 0,
      shares: map.shares ?? 0,
      engagement: (map.reach ?? 0) > 0 ? 0 : 0
      // calculated below
    };
  } catch {
    return { reach: 0, impressions: 0, saved: 0, shares: 0, engagement: 0 };
  }
}
async function fetchInstagramData() {
  const config = getConfig();
  if (!config)
    return [
      new Error(
        "INSTAGRAM_BUSINESS_ACCOUNT_ID and INSTAGRAM_ACCESS_TOKEN env vars required"
      ),
      null
    ];
  const { accountId, token } = config;
  try {
    const account = await fetchJson(
      `${BASE}/${accountId}?fields=followers_count,media_count&access_token=${token}`
    );
    const media = await fetchJson(
      `${BASE}/${accountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=25&access_token=${token}`
    );
    const posts = await Promise.all(
      media.data.map(async (post) => {
        const insights = await fetchPostInsights(
          post.id,
          post.media_type,
          token
        );
        const totalEngagement = post.like_count + post.comments_count + insights.saved + insights.shares;
        insights.engagement = insights.reach > 0 ? Math.round(totalEngagement / insights.reach * 1e4) / 100 : 0;
        return { ...post, insights };
      })
    );
    return [
      null,
      {
        followers_count: account.followers_count,
        media_count: account.media_count,
        recentPosts: posts
      }
    ];
  } catch (err) {
    return [err instanceof Error ? err : new Error(String(err)), null];
  }
}
async function generateInstagramInsights(data) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return "OPENAI_API_KEY not set \u2014 cannot generate insights.";
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const postSummaries = data.recentPosts.map((p) => ({
    date: p.timestamp.slice(0, 10),
    type: p.media_type,
    caption: p.caption?.slice(0, 120) ?? "(no caption)",
    likes: p.like_count,
    comments: p.comments_count,
    reach: p.insights.reach,
    impressions: p.insights.impressions,
    saved: p.insights.saved,
    shares: p.insights.shares,
    engagement_rate: `${p.insights.engagement}%`
  }));
  const prompt = `You are a social media strategist for Photobookers, an Instagram account about photobooks, photography books, and book collecting.

Here are the recent ${data.recentPosts.length} posts with their metrics:
${JSON.stringify(postSummaries, null, 2)}

Account has ${data.followers_count} followers.

Analyse these metrics and provide:
1. **Top performers** \u2014 which posts did best and why (look at engagement rate, saves, shares)
2. **Patterns** \u2014 what content types, topics, or posting times work best
3. **Weak spots** \u2014 what underperformed and possible reasons
4. **5 specific post ideas** \u2014 based on what's working, suggest new posts with brief caption directions

Be concise, actionable, and specific to the photobook niche.`;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!response.ok) {
      return `OpenAI error: ${response.status}`;
    }
    const result = await response.json();
    return result.choices?.[0]?.message?.content?.trim() ?? "No response";
  } catch (err) {
    return `Error generating insights: ${err}`;
  }
}
export {
  fetchInstagramData,
  generateInstagramInsights
};
