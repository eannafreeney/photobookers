import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { formValidator, paramValidator } from "../../../lib/validator";
import { getUser, setFlash } from "../../../utils";
import {
  createMessage,
  getMessagesByCreator,
} from "../../../features/dashboard/messages/services";
import { requireCreatorEditAccess } from "../../../middleware/creatorGuard";
import { creatorIdSchema } from "../../../schemas";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import Breadcrumbs from "../../../features/dashboard/admin/components/Breadcrumbs";
import MessageForm from "../../../features/dashboard/messages/forms/MessageForm";
import { MessageFormContext } from "../../../features/dashboard/messages/types";
import { showErrorAlert } from "../../../lib/alertHelpers";
import { createMessageFormSchema } from "../../../features/dashboard/messages/schema";

export const GET = createRoute(
  paramValidator(creatorIdSchema),
  requireCreatorEditAccess,
  async (c: Context) => {
    const creator = c.get("creator");
    const user = await getUser(c);
    const currentPath = c.req.path;
    const messages = await getMessagesByCreator(creator.id);

    return c.html(
      <AppLayout title="Messages" user={user} currentPath={currentPath}>
        <Page>
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard/books" },
              {
                label: creator.displayName,
                href: `/dashboard/creators/${creator.id}`,
              },
              { label: "Messages" },
            ]}
          />
          <MessageForm creatorId={creator.id} />
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h1 class="text-xl font-semibold">Messages to followers</h1>
              <a
                href={`/dashboard/creators/${creator.id}/messages/new`}
                class="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-content hover:opacity-90"
              >
                New message
              </a>
            </div>
            <p class="text-sm text-on-surface">
              Only people who follow you can see these messages.
            </p>
            {messages.length === 0 ? (
              <p class="text-on-surface">No messages yet.</p>
            ) : (
              <ul class="space-y-4">
                {messages.map((msg) => (
                  <li
                    key={msg.id}
                    class="rounded-lg border border-outline bg-surface-alt p-4"
                  >
                    <p class="whitespace-pre-wrap text-sm">{msg.body}</p>
                    {msg.imageUrls?.length ? (
                      <div class="mt-2 flex flex-wrap gap-2">
                        {msg.imageUrls.map((url) => (
                          <img
                            key={url}
                            src={url}
                            alt=""
                            class="max-h-32 rounded object-cover"
                          />
                        ))}
                      </div>
                    ) : null}
                    <p class="mt-2 text-xs text-on-surface">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleString()
                        : "—"}{" "}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Page>
      </AppLayout>,
    );
  },
);

export const POST = createRoute(
  paramValidator(creatorIdSchema),
  formValidator(createMessageFormSchema),
  requireCreatorEditAccess,
  async (c: MessageFormContext) => {
    const creatorId = c.req.valid("param").creatorId;
    const form = c.req.valid("form");
    const imageUrls = form.imageUrls
      ? form.imageUrls
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    const message = await createMessage(creatorId, {
      body: form.body,
      imageUrls: imageUrls?.length ? imageUrls : undefined,
    });

    if (!message) return showErrorAlert(c, "Failed to create message");
    await setFlash(c, "success", "Message posted! Your followers will see it.");
    return c.redirect(`/dashboard/creators/${creatorId}/messages`);
  },
);
