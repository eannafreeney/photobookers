import { AuthUser } from "../../../../types";
import FeatureGuard from "../../../components/layouts/FeatureGuard";
import Button from "../../../components/app/Button";
import ShareButton from "../../api/components/ShareButton";
import {
  shelfProfileUrl,
  shelfShareText,
  shelfShareTitle,
} from "../../../lib/share";
import { getInitialsAvatar } from "../../../lib/avatar";

type Props = {
  user: AuthUser;
  suggestedSlug: string | null;
  message?: string | null;
};

const ShelfSharingPanel = ({ user, suggestedSlug, message }: Props) => {
  const avatarUrl =
    user.profileImageUrl ??
    getInitialsAvatar(user.firstName ?? "", user.lastName ?? "");
  const slugValue = user.shelfSlug ?? suggestedSlug ?? "";
  const publicShelfUrl = user.shelfSlug
    ? shelfProfileUrl(user.shelfSlug)
    : slugValue
      ? shelfProfileUrl(slugValue)
      : null;

  return (
    <FeatureGuard flagName="publicShelf">
      <details class="group rounded border border-outline bg-surface-alt">
        <summary class="flex cursor-pointer list-none items-center justify-between gap-4 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
          <span class="flex flex-col">
            <span class="text-sm font-semibold text-on-surface-strong">
              Share your shelf
            </span>
            <span class="mt-1 text-sm text-on-surface">
              Let others browse the photobooks you’ve favorited.
            </span>
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="size-5 shrink-0 text-on-surface transition-transform group-open:rotate-180"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </summary>
        <div
          id="shelf-sharing-container"
          class="flex flex-col gap-4 px-4 pb-4 sm:px-5 sm:pb-5"
        >
          <div class="flex items-center gap-4">
            <img
              id="shelf-avatar"
              src={avatarUrl}
              alt=""
              class="size-14 rounded-full object-cover shrink-0"
              loading="lazy"
            />
            <div class="flex flex-col gap-2">
              <p class="text-sm text-on-surface">
                {user.profileImageUrl
                  ? "Your profile photo appears on your public shelf."
                  : "Add a profile photo so your shelf feels personal."}
              </p>
              <form
                method="get"
                action={`/users/${user.id}/update`}
                x-target="modal-root"
              >
                <input
                  type="hidden"
                  name="msg"
                  value={
                    user.profileImageUrl
                      ? "Change your profile photo"
                      : "Add a profile photo for your shelf"
                  }
                />
                <Button
                  type="submit"
                  variant="outline"
                  color="primary"
                  width="fit"
                >
                  {user.profileImageUrl ? "Change photo" : "Add photo"}
                </Button>
              </form>
            </div>
          </div>

          {message ? (
            <p class="text-sm text-accent" role="status">
              {message}
            </p>
          ) : null}

          <form
            method="post"
            action="/api/users/me/shelf-sharing"
            class="flex flex-col gap-3"
            {...{
              "x-target": "shelf-sharing-container",
              "x-target.error": "shelf-sharing-container",
            }}
          >
            <label class="flex items-center gap-2 text-sm text-on-surface">
              <input
                type="checkbox"
                name="shelfPublic"
                value="true"
                checked={user.shelfPublic ? true : undefined}
                class="rounded border-outline"
              />
              Make my shelf public
            </label>

            <div class="flex flex-col gap-1">
              <label
                for="shelfSlug"
                class="text-sm font-medium text-on-surface-strong"
              >
                Public URL
              </label>
              <div class="flex items-center gap-2">
                <span class="text-sm text-on-surface shrink-0">/shelf/</span>
                <input
                  id="shelfSlug"
                  name="shelfSlug"
                  type="text"
                  value={slugValue}
                  class="w-full rounded border border-outline bg-surface px-3 py-2 text-sm text-on-surface"
                  autocomplete="off"
                  spellcheck={false}
                />
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="solid" color="primary" width="fit">
                Save sharing settings
              </Button>
              {user.shelfPublic && publicShelfUrl ? (
                <>
                  <a
                    href={publicShelfUrl}
                    class="text-sm text-accent underline underline-offset-2"
                  >
                    View public shelf
                  </a>
                </>
              ) : null}
            </div>
          </form>
        </div>
      </details>
    </FeatureGuard>
  );
};

export default ShelfSharingPanel;
