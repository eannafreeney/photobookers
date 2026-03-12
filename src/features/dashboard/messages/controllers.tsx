import { Context } from "hono";
import { getUser, setFlash } from "../../../utils";
import { showErrorAlert } from "../../../lib/alertHelpers";
import { createMessage, getMessagesByCreator } from "./services";
import MessagesListPage from "./pages/MessageListPage";
import { MessageFormContext } from "./types";

export const getMessagesListPage = async (c: Context) => {
  const creator = c.get("creator");
  const user = await getUser(c);
  const currentPath = c.req.path;
  const messages = await getMessagesByCreator(creator.id);

  return c.html(
    <MessagesListPage
      creator={creator}
      user={user}
      currentPath={currentPath}
      messages={messages}
    />,
  );
};

export const postCreateMessage = async (c: MessageFormContext) => {
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
};
