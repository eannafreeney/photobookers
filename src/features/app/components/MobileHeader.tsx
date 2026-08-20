import VerificationBadge from "@/components/app/VerificationBadge";
import { PropsWithChildren } from "hono/jsx";

type Props = PropsWithChildren<{
  kicker: string;
  title: string;
  isVerified?: boolean;
}>;

function MobileHeader({ kicker, title, isVerified = false, children }: Props) {
  return (
    <div class="flex flex-col gap-1 border-b-2 border-on-surface-strong pb-3">
      <span class="kicker text-accent">{kicker}</span>
      <div class="flex items-center gap-2">
        {title && (
          <h1 class="font-display text-3xl font-medium leading-tight text-on-surface-strong text-balance pb-1">
            {title}
          </h1>
        )}
        {isVerified && <VerificationBadge creatorStatus="verified" size="xs" />}
      </div>
      {children}
    </div>
  );
}

export default MobileHeader;
