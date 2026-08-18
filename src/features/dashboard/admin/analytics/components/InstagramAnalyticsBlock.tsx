import {
  fetchInstagramData,
  generateInstagramInsights,
  type InstagramPost,
} from "../../../../../lib/instagram-graph";

const InstagramAnalyticsBlock = async () => {
  const [error, data] = await fetchInstagramData();

  if (error) {
    return (
      <div class="rounded-radius border border-outline bg-surface px-4 py-3 text-sm text-on-surface">
        {error.message}
      </div>
    );
  }

  const insights = await generateInstagramInsights(data);

  // Sort posts by engagement rate for the top performers table
  const sorted = [...data.recentPosts].sort(
    (a, b) => b.insights.engagement - a.insights.engagement,
  );

  return (
    <div class="flex flex-col gap-8">
      {/* Account overview */}
      <div class="flex gap-6">
        <Stat label="Followers" value={data.followers_count.toLocaleString()} />
        <Stat label="Total posts" value={data.media_count.toLocaleString()} />
        <Stat
          label="Avg engagement"
          value={`${avgEngagement(data.recentPosts)}%`}
        />
        <Stat
          label="Avg reach"
          value={avgReach(data.recentPosts).toLocaleString()}
        />
      </div>

      {/* AI Insights */}
      <div class="flex flex-col gap-2">
        <h3 class="text-base font-semibold text-on-surface">
          AI Analysis & Post Ideas
        </h3>
        <div class="prose prose-sm max-w-none rounded-radius border border-outline bg-surface-container p-4 text-on-surface whitespace-pre-wrap">
          {insights}
        </div>
      </div>

      {/* Posts table */}
      <div class="flex flex-col gap-2">
        <h3 class="text-base font-semibold text-on-surface">
          Recent Posts (by engagement rate)
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-outline text-xs text-on-surface-variant">
              <tr>
                <th class="pb-2 pr-3">Date</th>
                <th class="pb-2 pr-3">Type</th>
                <th class="pb-2 pr-3">Caption</th>
                <th class="pb-2 pr-3 text-right">Likes</th>
                <th class="pb-2 pr-3 text-right">Comments</th>
                <th class="pb-2 pr-3 text-right">Reach</th>
                <th class="pb-2 pr-3 text-right">Saves</th>
                <th class="pb-2 pr-3 text-right">Shares</th>
                <th class="pb-2 text-right">Eng. %</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((post) => (
                <tr key={post.id} class="border-b border-outline/50">
                  <td class="py-2 pr-3 whitespace-nowrap">
                    {post.timestamp.slice(0, 10)}
                  </td>
                  <td class="py-2 pr-3">
                    <MediaTypeBadge type={post.media_type} />
                  </td>
                  <td class="py-2 pr-3 max-w-[200px] truncate">
                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noopener"
                      class="hover:underline"
                    >
                      {post.caption?.slice(0, 60) ?? "—"}
                    </a>
                  </td>
                  <td class="py-2 pr-3 text-right">{post.like_count}</td>
                  <td class="py-2 pr-3 text-right">{post.comments_count}</td>
                  <td class="py-2 pr-3 text-right">
                    {post.insights.reach.toLocaleString()}
                  </td>
                  <td class="py-2 pr-3 text-right">{post.insights.saved}</td>
                  <td class="py-2 pr-3 text-right">{post.insights.shares}</td>
                  <td class="py-2 text-right font-medium">
                    {post.insights.engagement}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstagramAnalyticsBlock;

// --- Helpers ---

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div class="flex flex-col gap-0.5">
      <span class="text-xs text-on-surface-variant">{label}</span>
      <span class="text-lg font-semibold text-on-surface">{value}</span>
    </div>
  );
}

function MediaTypeBadge({
  type,
}: {
  type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
}) {
  const labels: Record<string, string> = {
    IMAGE: "📷",
    VIDEO: "🎬",
    CAROUSEL_ALBUM: "🎠",
  };
  return <span title={type}>{labels[type] ?? type}</span>;
}

function avgEngagement(posts: InstagramPost[]): string {
  if (!posts.length) return "0";
  const avg =
    posts.reduce((sum, p) => sum + p.insights.engagement, 0) / posts.length;
  return avg.toFixed(1);
}

function avgReach(posts: InstagramPost[]): number {
  if (!posts.length) return 0;
  return Math.round(
    posts.reduce((sum, p) => sum + p.insights.reach, 0) / posts.length,
  );
}
