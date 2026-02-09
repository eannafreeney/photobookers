import { Creator, CreatorClaim } from "../../db/schema";
import { getClaimsPendingAdminReview } from "../../services/claims";

export const ClaimsTable = async () => {
  const claimsWithCreators = await getClaimsPendingAdminReview();
  console.log(claimsWithCreators);

  return (
    <div class="flex flex-col gap-8">
      {/* Desktop Table View */}
      <div class="hidden md:block overflow-x-auto">
        <table id="claims_table" class="table">
          <thead>
            <tr>
              <th>Profile Claimed</th>
              <th>Requested At</th>
              <th>Verification URL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="claims_table">
            {claimsWithCreators.map((claim) => (
              <ClaimsTableRow claim={claim.claim} creator={claim.creator} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

type ClaimsTableRowProps = {
  claim: CreatorClaim;
  creator: Creator;
};

const ClaimsTableRow = ({ claim, creator }: ClaimsTableRowProps) => {
  if (!claim || !claim.id || !claim.creatorId || !claim.userId) {
    return <></>;
  }

  return (
    <tr>
      <td>{creator.displayName}</td>
      <td>
        {claim.requestedAt
          ? new Date(claim.requestedAt).toLocaleDateString()
          : ""}
      </td>
      <td>
        <a
          href={claim.verificationUrl ?? ""}
          class="link link-primary"
          target="_blank"
        >
          {claim.verificationUrl ?? "No verification URL"}
        </a>
      </td>
      <td>
        <form method="post" action={`/dashboard/claims/approve/${claim.id}`}>
          <button class="btn btn-outline btn-primary">Approve</button>
        </form>
      </td>
      <td>
        <form method="post" action={`/dashboard/claims/reject/${claim.id}`}>
          <button class="btn btn-outline btn-primary">Reject</button>
        </form>
      </td>
    </tr>
  );
};

export default ClaimsTable;
