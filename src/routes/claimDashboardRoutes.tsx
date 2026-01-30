import { Hono } from "hono";
import { creatorClaims, creators } from "../db/schema";
import { nanoid } from "nanoid";
import { db } from "../db/client";
import ClaimPage from "../pages/ClaimPage";
import { getUser } from "../utils";
import { getCreatorById } from "../services/creators";
import {
  getClaimById,
  getClaimByToken,
  rejectClaim,
  reviewClaim,
  updateCreatorOwnerAndStatus,
} from "../services/claims";
import { and, eq, inArray } from "drizzle-orm";
import ClaimsOverview from "../pages/dashboard/ClaimsOverview";
import AuthModal from "../components/app/AuthModal";
import { getUserById } from "../services/users";
import Modal from "../components/app/Modal";

export const claimDashboardRoutes = new Hono();

claimDashboardRoutes.get("/", async (c) => {
  const user = getUser(c);
  if (!user) {
    return c.redirect("/auth/login");
  }

  const claims = await db.query.creatorClaims.findMany({
    where: and(
      eq(creatorClaims.status, "pending"),
      eq(creatorClaims.creatorCreatedByUserId, user.id)
    ),
  });

  // get creators for each claim
  const creatorsWithClaims = await db.query.creators.findMany({
    where: inArray(
      creators.id,
      claims.map((claim) => claim.creatorId)
    ),
    with: {
      claims: true,
    },
  });
  console.log("creatorsWithClaims", creatorsWithClaims);

  return c.html(
    <ClaimsOverview
      claims={claims}
      creatorsWithClaims={creatorsWithClaims}
      user={user}
    />
  );
});

// GET CLAIM PAGE
claimDashboardRoutes.get("/:creatorId", async (c) => {
  const creatorId = c.req.param("creatorId");
  const user = getUser(c);
  if (!user) {
    // must be logged in to claim a creator
    return c.html(<AuthModal action="to claim a creator profile." />);
  }

  return c.html(<ClaimPage user={user} creatorId={creatorId} />);
});

// POST CLAIM
claimDashboardRoutes.post("/:creatorId", async (c) => {
  const creatorId = c.req.param("creatorId");
  const creator = await getCreatorById(creatorId);
  if (!creator) {
    return c.json({ message: "Creator not found" }, 404);
  }

  const userWhoCreatedCreator = await getUserById(creator.createdByUserId);
  if (!userWhoCreatedCreator) {
    return c.html(
      <Modal>
        <p>User who created creator not found</p>
      </Modal>
    );
  }

  const user = getUser(c);
  if (!user) {
    return c.html(<AuthModal action="to claim a creator profile." />);
  }

  const token = nanoid(32);

  // create claim
  const [claim] = await db
    .insert(creatorClaims)
    .values({
      creatorId,
      userId: user.id,
      verificationToken: token,
    })
    .returning();

  // send email to creator page creator to verify the claim
  const { data, error } = await supabase.functions.invoke("send-email", {
    body: {
      to: userWhoCreatedCreator.email,
      subject: `${user.name} is claiming the profile for ${creator.displayName}`,
      html: `
          Please visit your dashboard to review the claim.
          ${user.name} is claiming the profile for ${creator.displayName}.<br><br>
          Approve claim: https://bookish.io/claim/${creator.id}/verify?token=${claim.verificationToken}<br>
          Reject claim: https://bookish.io/claim/${creator.id}/reject?token=${claim.verificationToken}
        `,
    },
  });

  const publisher = await getCreatorById(userWhoCreatedCreator.id);

  return c.html(
    <Modal>
      <div>{`Your claim has been sent to ${publisher?.displayName} for review.`}</div>
    </Modal>
  );
});

// APPROVE CLAIM
claimDashboardRoutes.post("/approve/:claimId", async (c) => {
  const claimId = c.req.param("claimId");
  const claim = await getClaimById(claimId);
  if (!claim) {
    return c.json({ message: "Claim not found" }, 404);
  }
  await reviewClaim(claim);
});

// REDEEM CLAIM (APPROVE CLAIM)
claimDashboardRoutes.get("/verify/:token", async (c) => {
  const token = c.req.param("token");
  const claim = await getClaimByToken(token);

  if (!claim || claim.status !== "pending") {
    return c.html(<div>Invalid token</div>);
  }
  await updateCreatorOwnerAndStatus(claim);
  await approveClaim(claim);

  return c.html(<div>Claim verified successfully</div>);
});

// REDEEM CLAIM (REJECT CLAIM)
claimDashboardRoutes.get("/reject/:token", async (c) => {
  const token = c.req.param("token");
  const claim = await getClaimByToken(token);

  if (!claim || claim.status !== "pending") {
    return c.html(<div>Invalid token</div>);
  }

  await rejectClaim(claim);
  return c.html(<div>Claim rejected successfully</div>);
});
