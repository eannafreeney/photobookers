import Button from "@/components/app/Button";
import FormPost from "@/components/forms/FormPost";
import Input from "@/components/forms/Input";
import { loadingIcon } from "@/lib/icons";

type Props = {
  /** Base issue action path, e.g. `/dashboard/admin/magazine/{id}`. */
  action: string;
  bookId: string;
  /** DOM id of the enclosing card, so a send swaps the whole card in place. */
  targetId: string;
  artistPrompt: string | null;
  artistEmail: string | null;
  artistEmailSentAt: Date | string | null;
};

const formatSent = (value: Date | string): string => {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Emails the artist their editorial question. Once sent it locks to a "sent"
// line (resend is intentionally blocked). With no address on file the button
// opens a modal to capture one, which is saved to the artist's account.
const ArtistEmailAction = ({
  action,
  bookId,
  targetId,
  artistPrompt,
  artistEmail,
  artistEmailSentAt,
}: Props) => {
  if (artistEmailSentAt) {
    return (
      <p class="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#4f7a4a]">
        ✓ Question emailed {formatSent(artistEmailSentAt)}
      </p>
    );
  }

  if (!artistPrompt) {
    return (
      <p class="mt-1 text-xs italic text-on-surface-weak">
        No artist question set — add one before emailing.
      </p>
    );
  }

  const emailAction = `${action}/email-artist`;
  const busyAttrs = {
    "@ajax:before": "busy = true",
    "@ajax:after": "busy = false",
  };
  // Dotted / namespaced Alpine attribute names must be passed as string keys.
  const overlayAttrs = {
    "x-transition:enter": "transition ease-out duration-200",
    "x-transition:enter-start": "opacity-0",
    "x-transition:enter-end": "opacity-100",
    "x-on:keydown.esc.window": "open = false",
    "x-on:click.self": "open = false",
  };

  // Artist has an address on file → one-click send.
  if (artistEmail) {
    return (
      <FormPost
        action={emailAction}
        x-data="{ busy: false }"
        x-target={`${targetId} toast`}
        {...busyAttrs}
        className="mt-1"
      >
        <input type="hidden" name="bookId" value={bookId} />
        <Button variant="outline" color="primary" width="auto" x-bind:disabled="busy">
          <span x-show="!busy">Email question to artist</span>
          <span x-show="busy" class="inline-flex items-center gap-1">
            Sending… {loadingIcon}
          </span>
        </Button>
      </FormPost>
    );
  }

  // No address on file → capture one in a modal; the route saves it, then sends.
  return (
    <div x-data="{ open: false, busy: false }" class="mt-1">
      <Button
        type="button"
        variant="outline"
        color="primary"
        width="auto"
        x-on:click="open = true"
      >
        Email question to artist…
      </Button>

      <div
        x-cloak
        x-show="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        {...overlayAttrs}
      >
        <div class="flex w-full max-w-md flex-col gap-4 rounded-radius border border-outline bg-surface p-4 text-on-surface shadow-xl">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-on-surface-strong">Add artist email</h3>
            <button
              type="button"
              aria-label="Close"
              x-on:click="open = false"
              class="cursor-pointer text-on-surface transition hover:opacity-75"
            >
              ✕
            </button>
          </div>
          <p class="text-xs text-on-surface-weak">
            This artist has no email on file. Enter one — it will be saved to their
            account and the question sent.
          </p>
          <FormPost
            action={emailAction}
            x-target={`${targetId} toast`}
            {...busyAttrs}
            className="flex flex-col gap-3"
          >
            <input type="hidden" name="bookId" value={bookId} />
            <Input label="Artist email" type="email" name="email" required autofocus />
            <div class="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                color="primary"
                width="auto"
                x-on:click="open = false"
              >
                Cancel
              </Button>
              <Button variant="solid" color="primary" width="auto" x-bind:disabled="busy">
                <span x-show="!busy">Save &amp; send</span>
                <span x-show="busy" class="inline-flex items-center gap-1">
                  Sending… {loadingIcon}
                </span>
              </Button>
            </div>
          </FormPost>
        </div>
      </div>
    </div>
  );
};

export default ArtistEmailAction;
