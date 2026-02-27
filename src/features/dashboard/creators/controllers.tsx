import { Context } from "hono";
import { getUser } from "../../../utils";
import EditCreatorPage from "../../../pages/dashboard/EditCreatorPage";
import { updateCreatorProfile } from "../../../services/creators";
import { showErrorAlert, showSuccessAlert } from "../../../lib/alertHelpers";
import { CreatorFormWithBookContext } from "./types";

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

export const updateCreator = async (c: CreatorFormWithBookContext) => {
  const creator = c.get("creator");
  const formData = c.req.valid("form");

  const updatedCreator = await updateCreatorProfile(formData, creator.id);

  if (!updatedCreator) return showErrorAlert(c, "Failed to update artist");

  return showSuccessAlert(c, `${updatedCreator.displayName} Updated!`);
};
