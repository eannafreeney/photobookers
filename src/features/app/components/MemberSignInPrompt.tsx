import Button from "../../../components/app/Button";

export type MemberSignInPromptContent = {
  headline: string;
  hint: string;
};

export const memberSignInPrompts = {
  feed: {
    headline: "Sign in to see your feed",
    hint: "Follow artists and publishers to get a personalised feed of their latest releases — free to join.",
  },
  library: {
    headline: "Sign in to view your library",
    hint: "Wishlist titles and keep track of your collection in one place. Create a free account to get started.",
  },
  messages: {
    headline: "Sign in to read creator updates",
    hint: "Notes and announcements from artists and publishers appear here. Sign up to follow creators and stay in the loop.",
  },
} as const satisfies Record<string, MemberSignInPromptContent>;

type Props = {
  prompt: MemberSignInPromptContent;
  currentPath: string;
};

const MemberSignInPrompt = ({ prompt, currentPath }: Props) => {
  const loginHref = `/auth/login?redirectUrl=${encodeURIComponent(currentPath)}`;
  const registerHref = `/auth/accounts`;

  return (
    <div class="mx-auto w-full max-w-lg border border-outline bg-surface-alt p-6 sm:p-8 text-center">
      <p class="font-display text-xl font-medium text-on-surface-strong text-balance sm:text-2xl">
        {prompt.headline}
      </p>
      <p class="mt-3 text-sm leading-relaxed text-on-surface text-pretty sm:text-base">
        {prompt.hint}
      </p>
      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a href={loginHref} class="w-full sm:w-auto">
          <Button variant="solid" color="primary" width="full">
            Log in
          </Button>
        </a>
        <a href={registerHref} class="w-full sm:w-auto">
          <Button variant="outline" color="primary" width="full">
            Create free account
          </Button>
        </a>
      </div>
    </div>
  );
};

export default MemberSignInPrompt;
