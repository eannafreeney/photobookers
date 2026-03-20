import { Creator, CreatorClaim, User } from "../../../../../db/schema";
import Button from "../../../../../components/app/Button";
import { getClaimsPendingAdminReview } from "../services";
import Table from "../../../../../components/app/Table";
import Link from "../../../../../components/app/Link";

const ClaimsTableAdmin = async () => {
  const claims = await getClaimsPendingAdminReview();

  const targetId = "claims-table-body";

  const tableBodyAttrs = {
    "x-init": "true",
    "@ajax:before": "$dispatch('dialog:open')",
    "@claims:updated.window": `$dispatch('dialog:close'); $ajax('/dashboard/admin/claims', { target: 'claims-table-body' })`,
  };

  return (
    <Table id="claims-table">
      <Table.Head>
        <tr>
          <Table.HeadRow>User Profile</Table.HeadRow>
          <Table.HeadRow>User Email</Table.HeadRow>
          <Table.HeadRow>Creator Profile</Table.HeadRow>
          <Table.HeadRow>Claimed At</Table.HeadRow>
          <Table.HeadRow>Verification URL</Table.HeadRow>
          <Table.HeadRow>Actions</Table.HeadRow>
        </tr>
      </Table.Head>
      <Table.Body id={targetId} {...tableBodyAttrs}>
        {claims.map((claim) => (
          <ClaimsTableRow
            claim={claim.claim}
            creator={claim.creator}
            user={claim.user}
          />
        ))}
      </Table.Body>
    </Table>
  );
};

export default ClaimsTableAdmin;

type ClaimsTableRowProps = {
  claim: CreatorClaim;
  creator: Creator;
  user: User;
};

const ClaimsTableRow = ({ claim, creator, user }: ClaimsTableRowProps) => {
  if (!claim || !claim.id || !claim.creatorId || !user) {
    return <></>;
  }

  return (
    <tr>
      <Table.BodyRow>
        {user?.firstName} {user?.lastName}
      </Table.BodyRow>
      <Table.BodyRow>{user.email}</Table.BodyRow>
      <Table.BodyRow>
        <Link href={`/creators/${creator.slug}`}>{creator.displayName}</Link>
      </Table.BodyRow>
      <Table.BodyRow>
        {claim.requestedAt
          ? new Date(claim.requestedAt).toLocaleDateString()
          : ""}
      </Table.BodyRow>
      <Table.BodyRow>
        <a
          href={claim.verificationUrl ?? ""}
          class="link link-primary"
          target="_blank"
        >
          {claim.verificationUrl ?? "No verification URL"}
        </a>
      </Table.BodyRow>
      <Table.BodyRow>
        <ApproveClaimForm claim={claim} />
      </Table.BodyRow>
      <Table.BodyRow>
        <RejectClaimForm claim={claim} />
      </Table.BodyRow>
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
