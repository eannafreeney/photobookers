import { err, ok, type Result } from "../../../../lib/result";

type BufferGraphQlResponse = {
  data?: {
    createPost?:
      | { __typename?: string; post?: { id: string } }
      | { __typename?: string; message?: string };
  };
  errors?: { message: string }[];
};

function summarizeBufferResponseBody(
  status: number,
  bodyText: string,
  payload: BufferGraphQlResponse | null,
): string {
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
    const snippet =
      trimmed.length > maxLen ? `${trimmed.slice(0, maxLen)}…` : trimmed;
    return `Buffer API error (${status}): ${snippet}`;
  }

  return `Buffer API error (${status})`;
}

function getBufferConfig(): Result<
  { accessToken: string; channelId: string },
  { reason: string }
> {
  const accessToken = process.env.BUFFER_ACCESS_TOKEN?.trim();
  const channelId = process.env.BUFFER_INSTAGRAM_CHANNEL_ID?.trim();
  if (!accessToken || !channelId) {
    return err({ reason: "Buffer is not configured" });
  }
  return ok({ accessToken, channelId });
}

async function bufferCreatePost(
  input: Record<string, unknown>,
): Promise<Result<{ postId: string }, { reason: string }>> {
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
      Authorization: `Bearer ${config.accessToken}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          channelId: config.channelId,
          ...input,
        },
      },
    }),
  });

  const bodyText = await response.text();

  let payload: BufferGraphQlResponse | null = null;
  if (bodyText) {
    try {
      payload = JSON.parse(bodyText) as BufferGraphQlResponse;
    } catch {
      if (!response.ok) {
        return err({
          reason: summarizeBufferResponseBody(response.status, bodyText, null),
        });
      }
      return err({ reason: "Buffer API returned invalid JSON" });
    }
  }

  if (!response.ok) {
    return err({
      reason: summarizeBufferResponseBody(response.status, bodyText, payload),
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

export async function bufferCreateScheduledImagePost(params: {
  text: string;
  imageUrl: string;
  dueAt: Date;
  firstComment?: string;
}): Promise<Result<{ postId: string }, { reason: string }>> {
  return bufferCreatePost({
    text: params.text,
    schedulingType: "automatic",
    mode: "customScheduled",
    dueAt: params.dueAt.toISOString(),
    assets: [{ image: { url: params.imageUrl } }],
    metadata: {
      instagram: {
        type: "post",
        shouldShareToFeed: true,
        ...(params.firstComment
          ? { firstComment: params.firstComment }
          : {}),
      },
    },
  });
}

export async function bufferCreateScheduledStory(params: {
  stickerText: string;
  imageUrl: string;
  dueAt: Date;
  linkReminder?: string;
}): Promise<Result<{ postId: string }, { reason: string }>> {
  return bufferCreatePost({
    text: params.stickerText,
    schedulingType: "notification",
    mode: "customScheduled",
    dueAt: params.dueAt.toISOString(),
    assets: [{ image: { url: params.imageUrl } }],
    metadata: {
      instagram: {
        type: "story",
        shouldShareToFeed: false,
        stickerFields: {
          text: params.stickerText,
          ...(params.linkReminder ? { other: params.linkReminder } : {}),
        },
      },
    },
  });
}
