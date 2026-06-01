import { err, ok, type Result } from "../../../../lib/result";

type BufferGraphQlResponse = {
  data?: {
    createPost?:
      | { post?: { id: string } }
      | { message?: string };
  };
  errors?: { message: string }[];
};

export async function bufferCreateScheduledImagePost(params: {
  text: string;
  imageUrl: string;
  dueAt: Date;
  firstComment?: string;
}): Promise<Result<{ postId: string }, { reason: string }>> {
  const accessToken = process.env.BUFFER_ACCESS_TOKEN;
  const channelId = process.env.BUFFER_INSTAGRAM_CHANNEL_ID;
  if (!accessToken || !channelId) {
    return err({ reason: "Buffer is not configured" });
  }

  const mutation = `
    mutation CreateBotdInstagramPost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post { id }
        }
        ... on MutationError {
          message
        }
      }
    }
  `;

  const response = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          text: params.text,
          channelId,
          schedulingType: "automatic",
          mode: "customScheduled",
          dueAt: params.dueAt.toISOString(),
          assets: [{ image: { url: params.imageUrl } }],
          metadata: {
            instagram: {
              type: "post",
              ...(params.firstComment
                ? { firstComment: params.firstComment }
                : {}),
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    return err({ reason: `Buffer API error (${response.status})` });
  }

  let payload: BufferGraphQlResponse;
  try {
    payload = (await response.json()) as BufferGraphQlResponse;
  } catch {
    return err({ reason: "Buffer API returned invalid JSON" });
  }

  if (payload.errors?.length) {
    return err({ reason: payload.errors.map((e) => e.message).join("; ") });
  }

  const createPost = payload.data?.createPost;
  if (createPost && "message" in createPost && createPost.message) {
    return err({ reason: createPost.message });
  }

  const postId = createPost && "post" in createPost ? createPost.post?.id : null;
  if (!postId) {
    return err({ reason: "Buffer did not return a post id" });
  }

  return ok({ postId });
}
