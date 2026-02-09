import { AuthUser } from "../../../types";
import Button from "../app/Button";
import Input from "../cms/ui/Input";

type Props = {
  creatorId: string;
  user: AuthUser;
  buttonType: string;
  creatorWebsite?: string;
};

const ClaimModal = ({ creatorId, user, buttonType, creatorWebsite }: Props) => {
  const alpineAttrs = {
    "x-data": `claimForm(${JSON.stringify({ creatorWebsite: creatorWebsite ?? null })})`,
    "x-target": `toast claim-${creatorId}`,
    "x-target.error": "toast",
    "x-on:ajax:after": "$dispatch('dialog:close')",
  };

  return (
    <div class="flex flex-col gap-4 p-2">
      <h2 class="text-2xl font-bold">Claim Creator Profile</h2>
      <p class="text-sm text-gray-600">
        Verify your identity by adding a verification code to your website.
      </p>
      <form method="post" action={`/claim/${creatorId}`} {...alpineAttrs}>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Verification Method</label>
          <select
            name="verificationMethod"
            class="border rounded px-3 py-2"
            required
          >
            <option value="website">Website</option>
            <option value="instagram" disabled>
              Instagram (Coming Soon)
            </option>
          </select>
        </div>

        <Input
          label="Website URL"
          name="form.verificationUrl"
          type="url"
          placeholder="https://yourwebsite.com"
          required
          readOnly={!!creatorWebsite}
        />

        <p class="text-xs text-gray-500 mb-8">
          We'll send you a verification code to add to your website. Make sure
          the URL is publicly accessible.
        </p>

        <input type="hidden" name="email" value={user?.email} />
        <input type="hidden" name="buttonType" value={buttonType} />
        <Button variant="solid" color="primary">
          Start Verification
        </Button>
      </form>
    </div>
  );
};

export default ClaimModal;
