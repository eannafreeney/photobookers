import { Context } from "hono";
import { getUser } from "../../../utils";
import { updateCreatorProfile } from "../../../services/creators";
import { showErrorAlert, showSuccessAlert } from "../../../lib/alertHelpers";
import { CreatorFormWithIdContext } from "./types";
import EditCreatorPage from "./pages/EditCreatorPage";

export const getEditCreatorPage = async (c: Context) => {
  const creator = c.get("creator");
  const user = await getUser(c);
  const currentPath = c.req.path;
  const page = Number(c.req.query("page") ?? 1);

  return c.html(
    <EditCreatorPage
      creator={creator}
      user={user}
      currentPath={currentPath}
      currentPage={page}
    />,
  );
};

export const updateCreator = async (c: CreatorFormWithIdContext) => {
  const creatorId = c.req.valid("param").creatorId;
  const formData = c.req.valid("form");

  const updatedCreator = await updateCreatorProfile(formData, creatorId);
  if (!updatedCreator) return showErrorAlert(c, "Failed to update artist");
  return showSuccessAlert(c, `${updatedCreator.displayName} Updated!`);
};
