import { err, ok } from "../../../../../lib/result.js";
function summarizeBufferResponseBody(status, bodyText, payload) {
  if (payload?.errors?.length) {
    return payload.errors.map((e) => e.message).join("; ");
  }
  const createPost = payload?.data?.createPost;
  if (createPost && "message" in createPost && createPost.message) {
    return createPost.message;
  }
  const trimmed = bodyText.trim();
  if (trimmed) {
    const maxLen = 500;
    const snippet = trimmed.length > maxLen ? `${trimmed.slice(0, maxLen)}\u2026` : trimmed;
    return `Buffer API error (${status}): ${snippet}`;
  }
  return `Buffer API error (${status})`;
}
function getBufferConfig() {
  const accessToken = process.env.BUFFER_ACCESS_TOKEN?.trim();
  const channelId = process.env.BUFFER_INSTAGRAM_CHANNEL_ID?.trim();
  if (!accessToken || !channelId) {
    return err({ reason: "Buffer is not configured" });
  }
  return ok({ accessToken, channelId });
}
async function bufferPostExists(postId) {
  const [configError, config] = getBufferConfig();
  if (configError) return err(configError);
  const query = `
    query GetPost($input: PostInput!) {
      post(input: $input) {
        id
      }
    }
  `;
  const response = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.accessToken}`
    },
    body: JSON.stringify({
      query,
      variables: { input: { id: postId } }
    })
  });
  const bodyText = await response.text();
  let payload = null;
  if (bodyText) {
    try {
      payload = JSON.parse(bodyText);
    } catch {
      return err({ reason: "Buffer API returned invalid JSON" });
    }
  }
  if (!response.ok) {
    return err({
      reason: summarizeBufferResponseBody(response.status, bodyText, payload)
    });
  }
  const notFound = payload?.errors?.some(
    (error) => error.message === "Post not found" || error.extensions?.code === "NOT_FOUND"
  );
  if (notFound) return ok(false);
  if (payload?.errors?.length) {
    return err({ reason: payload.errors.map((e) => e.message).join("; ") });
  }
  return ok(Boolean(payload?.data?.post?.id));
}
async function bufferCreatePost(input) {
  const [configError, config] = getBufferConfig();
  if (configError) return err(configError);
  const mutation = `
    mutation CreateInstagramPost($input: CreatePostInput!) {
      createPost(input: $input) {
        __typename
        ... on PostActionSuccess {
          post { id }
        }
        ... on MutationError {
          message
        }
        ... on InvalidInputError {
          message
        }
      }
    }
  `;
  const response = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.accessToken}`
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          channelId: config.channelId,
          ...input
        }
      }
    })
  });
  const bodyText = await response.text();
  let payload = null;
  if (bodyText) {
    try {
      payload = JSON.parse(bodyText);
    } catch {
      if (!response.ok) {
        return err({
          reason: summarizeBufferResponseBody(response.status, bodyText, null)
        });
      }
      return err({ reason: "Buffer API returned invalid JSON" });
    }
  }
  if (!response.ok) {
    return err({
      reason: summarizeBufferResponseBody(response.status, bodyText, payload)
    });
  }
  if (payload?.errors?.length) {
    return err({ reason: payload.errors.map((e) => e.message).join("; ") });
  }
  const createPost = payload?.data?.createPost;
  if (createPost && "message" in createPost && createPost.message) {
    return err({ reason: createPost.message });
  }
  const postId = createPost && "post" in createPost ? createPost.post?.id : null;
  if (!postId) {
    return err({ reason: "Buffer did not return a post id" });
  }
  return ok({ postId });
}
async function bufferCreateScheduledImagePost(params) {
  const imageUrls = dedupeBufferImageUrls(
    params.imageUrls ?? (params.imageUrl ? [params.imageUrl] : [])
  );
  if (imageUrls.length === 0) {
    return err({ reason: "At least one image URL is required" });
  }
  return bufferCreatePost({
    text: params.text,
    schedulingType: "automatic",
    mode: "customScheduled",
    dueAt: params.dueAt.toISOString(),
    assets: imageUrls.map((url) => ({ image: { url } })),
    metadata: {
      instagram: {
        type: "post",
        shouldShareToFeed: true,
        ...params.firstComment ? { firstComment: params.firstComment } : {},
        ...params.stickerFields ? { stickerFields: params.stickerFields } : {}
      }
    }
  });
}
function dedupeBufferImageUrls(urls) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const url of urls) {
    const trimmed = url.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}
async function bufferDeletePost(postId) {
  const [configError, config] = getBufferConfig();
  if (configError) return err(configError);
  const mutation = `
    mutation DeletePost($input: PostInput!) {
      deletePost(input: $input) {
        __typename
        ... on PostActionSuccess {
          post { id }
        }
        ... on MutationError {
          message
        }
        ... on InvalidInputError {
          message
        }
      }
    }
  `;
  const response = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.accessToken}`
    },
    body: JSON.stringify({
      query: mutation,
      variables: { input: { id: postId } }
    })
  });
  const bodyText = await response.text();
  let payload = null;
  if (bodyText) {
    try {
      payload = JSON.parse(bodyText);
    } catch {
      if (!response.ok) {
        return err({
          reason: summarizeBufferResponseBody(response.status, bodyText, null)
        });
      }
      return err({ reason: "Buffer API returned invalid JSON" });
    }
  }
  if (!response.ok) {
    return err({
      reason: summarizeBufferResponseBody(response.status, bodyText, payload)
    });
  }
  const notFound = payload?.errors?.some(
    (error) => error.message === "Post not found" || error.extensions?.code === "NOT_FOUND"
  );
  if (notFound) return ok(void 0);
  if (payload?.errors?.length) {
    return err({ reason: payload.errors.map((e) => e.message).join("; ") });
  }
  return ok(void 0);
}
async function bufferCreateScheduledStory(params) {
  const stickerFields = params.stickerFields ?? { text: params.caption };
  return bufferCreatePost({
    text: params.caption,
    schedulingType: "notification",
    mode: "customScheduled",
    dueAt: params.dueAt.toISOString(),
    assets: [{ image: { url: params.imageUrl } }],
    metadata: {
      instagram: {
        type: "story",
        shouldShareToFeed: false,
        ...params.link ? { link: params.link } : {},
        stickerFields
      }
    }
  });
}
export {
  bufferCreateScheduledImagePost,
  bufferCreateScheduledStory,
  bufferDeletePost,
  bufferPostExists
};
