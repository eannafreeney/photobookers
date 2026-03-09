// src/features/claims/modals/ClaimModal.tsx
import { AuthUser } from "../../../../types";
import Button from "../../../components/app/Button";
import Input from "../../../components/forms/Input";

type Props = {
  creatorId: string;
  user: AuthUser;
  creatorWebsite?: string;
};

const ClaimModal = ({ creatorId, user, creatorWebsite }: Props) => {
  const alpineAttrs = {
    "x-data": `claimForm(${JSON.stringify({ creatorWebsite: creatorWebsite ?? null })})`,
    "x-target": `toast`,
    "x-on:submit": "submitForm($event)",
    "x-on:ajax:after": "$dispatch('dialog:close')",
  };

  return (
    <div class="flex flex-col gap-4 p-2">
      <h2 class="text-2xl font-bold">Claim Creator Profile</h2>

      <form method="post" action={`/claims/${creatorId}`} {...alpineAttrs}>
        <div class="flex flex-col gap-3 mb-4">
          {creatorWebsite ? (
            <>
              <p class="text-sm text-gray-600">
                This creator has <strong>{creatorWebsite}</strong> on file.
                {` `}
                {`If your account email (`}
                <strong>{user.email}</strong>
                {`) is at the same domain, you'll be approved instantly. Otherwise, your claim will be reviewed by our team.`}
              </p>
              <input
                type="hidden"
                name="form.verificationUrl"
                value={creatorWebsite}
              />
            </>
          ) : (
            <>
              <p class="text-sm text-gray-600">
                This creator doesn't have a website on file. Please provide
                their website URL. Your claim will then be reviewed by our team.
              </p>
              <Input
                label="Creator's Website URL"
                name="form.verificationUrl"
                type="url"
                placeholder="https://yourwebsite.com"
                required
              />
            </>
          )}
        </div>

        <input type="hidden" name="email" value={user?.email} />
        <Button variant="solid" color="primary">
          Submit Claim
        </Button>
      </form>
    </div>
  );
};

export default ClaimModal;
