import { Hono } from "hono";
import {
  getFlash,
  getRandomCoverUrl,
  getUser,
  setFlash,
  slugify,
} from "../utils";
import AddCreatorPage from "../pages/dashboard/AddCreatorPage";
import { creatorFormSchema, creatorIdSchema } from "../schemas";
import {
  createCreatorProfile,
  getCreatorById,
  updateCreatorProfile,
} from "../services/creators";
import EditCreatorPage from "../pages/dashboard/EditCreatorPage";
import {
  formValidator,
  paramValidator,
} from "../lib/validator";
import Alert from "../components/app/Alert";
import { createSupabaseClient } from "../lib/supabase";

export const creatorDashboardRoutes = new Hono();

// GET ADD NEW CREATOR PAGE
creatorDashboardRoutes.get("/new", async (c) => {
  const type = c.req.query("type") ?? "artist";
  const user = await getUser(c);

  if (user.creator?.id) {
    return c.redirect("/dashboard/books");
  }

 

  return c.html(
    <AddCreatorPage user={user} type={type as "artist" | "publisher"}  />
  );
});

// CREATE NEW CREATOR
creatorDashboardRoutes.post(
  "/new",
  formValidator(creatorFormSchema),
  async (c) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");

    const creatorProfile = await createCreatorProfile({
      ...formData,
      slug: slugify(formData.displayName),
      ownerUserId: user?.id,
      createdByUserId: user?.id,
      status: "verified",
      type: formData.type ?? "artist",
      coverUrl: getRandomCoverUrl(),
    });

    if (!creatorProfile) {
      return c.html(
        <Alert type="danger" message="Failed to create creator profile" />,
        422
      );
    }

    // Clear the intendedCreatorType from user metadata since they've completed signup
    const supabase = createSupabaseClient(c);
    await supabase.auth.updateUser({
      data: {
        intendedCreatorType: null,
      },
    });

    await setFlash(c, "success", "Creator profile created successfully!");
    return c.redirect("/dashboard/books");
  }
);

// GET EDIT CREATOR PAGE
creatorDashboardRoutes.get(
  "/edit/:creatorId",
  paramValidator(creatorIdSchema),
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const user = await getUser(c);

    const creator = await getCreatorById(creatorId);

    const userOwnsCreator = user?.creator?.id === creatorId;
    const isCreatedByUser = user.id === creator?.createdByUserId;
    const hasOwner = creator?.ownerUserId === user.id;

    if (!userOwnsCreator || (!isCreatedByUser && !hasOwner)) {
      return c.html(<Alert type="danger" message="Unauthorized" />, 403);
    }

    if (!creator) {
      return c.html(<Alert type="danger" message="Creator not found" />, 404);
    }

    return c.html(<EditCreatorPage creator={creator} user={user} />);
  }
);

creatorDashboardRoutes.post(
  "/edit/:creatorId",
  paramValidator(creatorIdSchema),
  formValidator(creatorFormSchema),
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const formData = c.req.valid("form");

    const updatedCreator = await updateCreatorProfile(formData, creatorId);

    if (!updatedCreator) {
      return c.html(
        <Alert type="danger" message="Failed to update artist" />,
        422
      );
    }

    return c.html(
      <Alert
        type="success"
        message={`${updatedCreator.displayName} Updated!`}
      />
    );
  }
);

