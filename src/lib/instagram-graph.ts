/**
 * Instagram Graph API client for fetching business account media & insights.
 * Requires env vars: INSTAGRAM_BUSINESS_ACCOUNT_ID, INSTAGRAM_ACCESS_TOKEN
 *
 * ponytail: uses long-lived token directly — upgrade path is server-side OAuth refresh flow
 */

const BASE = "https://graph.facebook.com/v21.0";

function getConfig() {
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accountId || !token) return null;
  return { accountId, token };
}

export type InstagramPost = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
  insights: {
    reach: number;
    impressions: number;
    saved: number;
    shares: number;
    engagement: number;
  };
};

export type InstagramAccountInsights = {
  followers_count: number;
  media_count: number;
  recentPosts: InstagramPost[];
};

type GraphMediaNode = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Instagram API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function fetchPostInsights(
  postId: string,
  mediaType: string,
  token: string,
): Promise<InstagramPost["insights"]> {
  // Reels/videos have different metric names
  const isReel = mediaType === "VIDEO";
  const metrics = isReel
    ? "reach,plays,saved,shares"
    : "reach,impressions,saved,shares";

  try {
    const data = await fetchJson<{
      data: Array<{ name: string; values: Array<{ value: number }> }>;
    }>(`${BASE}/${postId}/insights?metric=${metrics}&access_token=${token}`);

    const map = Object.fromEntries(
      data.data.map((m) => [m.name, m.values[0]?.value ?? 0]),
    );

    return {
      reach: map.reach ?? 0,
      impressions: map.impressions ?? map.plays ?? 0,
      saved: map.saved ?? 0,
      shares: map.shares ?? 0,
      engagement:
        (map.reach ?? 0) > 0
          ? 0
          : 0, // calculated below
    };
  } catch {
    // Insights may fail for very old posts or albums
    return { reach: 0, impressions: 0, saved: 0, shares: 0, engagement: 0 };
  }
}

export async function fetchInstagramData(): Promise<
  [Error, null] | [null, InstagramAccountInsights]
> {
  const config = getConfig();
  if (!config)
    return [
      new Error(
        "INSTAGRAM_BUSINESS_ACCOUNT_ID and INSTAGRAM_ACCESS_TOKEN env vars required",
      ),
      null,
    ];

  const { accountId, token } = config;

  try {
    // Fetch account info
    const account = await fetchJson<{
      followers_count: number;
      media_count: number;
    }>(
      `${BASE}/${accountId}?fields=followers_count,media_count&access_token=${token}`,
    );

    // Fetch recent media (last 25 posts)
    const media = await fetchJson<{
      data: GraphMediaNode[];
    }>(
      `${BASE}/${accountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=25&access_token=${token}`,
    );

    // Fetch insights for each post
    const posts: InstagramPost[] = await Promise.all(
      media.data.map(async (post) => {
        const insights = await fetchPostInsights(
          post.id,
          post.media_type,
          token,
        );
        const totalEngagement =
          post.like_count + post.comments_count + insights.saved + insights.shares;
        insights.engagement =
          insights.reach > 0
            ? Math.round((totalEngagement / insights.reach) * 10000) / 100
            : 0;

        return { ...post, insights };
      }),
    );

    return [
      null,
      {
        followers_count: account.followers_count,
        media_count: account.media_count,
        recentPosts: posts,
      },
    ];
  } catch (err) {
    return [err instanceof Error ? err : new Error(String(err)), null];
  }
}

export async function generateInstagramInsights(
  data: InstagramAccountInsights,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return "OPENAI_API_KEY not set — cannot generate insights.";

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  // Build a summary for the prompt
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
    engagement_rate: `${p.insights.engagement}%`,
  }));

  const prompt = `You are a social media strategist for Photobookers, an Instagram account about photobooks, photography books, and book collecting.

Here are the recent ${data.recentPosts.length} posts with their metrics:
${JSON.stringify(postSummaries, null, 2)}

Account has ${data.followers_count} followers.

Analyse these metrics and provide:
1. **Top performers** — which posts did best and why (look at engagement rate, saves, shares)
2. **Patterns** — what content types, topics, or posting times work best
3. **Weak spots** — what underperformed and possible reasons
4. **5 specific post ideas** — based on what's working, suggest new posts with brief caption directions

Be concise, actionable, and specific to the photobook niche.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return `OpenAI error: ${response.status}`;
    }

    const result = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return result.choices?.[0]?.message?.content?.trim() ?? "No response";
  } catch (err) {
    return `Error generating insights: ${err}`;
  }
}
