import { Creator, CreatorClaim } from "../../db/schema";
import { getClaimsPendingAdminReview } from "../../services/claims";
import Button from "../app/Button";

export const ClaimsTable = async () => {
  const claimsWithCreators = await getClaimsPendingAdminReview();

  return (
    <div class="flex flex-col gap-8">
      {/* Desktop Table View */}
      <div class="hidden md:block overflow-x-auto">
        <table id="claims-table" class="table">
          <thead>
            <tr>
              <th>Profile Claimed</th>
              <th>Requested At</th>
              <th>Verification URL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="claims-table-body">
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
        <ApproveClaimForm claim={claim} />
      </td>
      <td>
        <RejectClaimForm claim={claim} />
      </td>
    </tr>
  );
};

const ApproveClaimForm = ({ claim }: { claim: CreatorClaim }) => {
  const alpineAttrs = {
    "x-target": "claims-table toast",
    "x-target.error": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
  };

  return (
    <form
      method="post"
      action={`/dashboard/admin/claims/${claim.id}/approve`}
      {...alpineAttrs}
    >
      <Button variant="outline" color="primary">
        Approve
      </Button>
    </form>
  );
};

const RejectClaimForm = ({ claim }: { claim: CreatorClaim }) => {
  const alpineAttrs = {
    "x-target": "claims-table toast",
    "x-target.error": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
  };

  return (
    <form
      method="post"
      action={`/dashboard/admin/claims/${claim.id}/reject`}
      {...alpineAttrs}
    >
      <Button variant="outline" color="danger">
        Reject
      </Button>
    </form>
  );
};
export default ClaimsTable;
