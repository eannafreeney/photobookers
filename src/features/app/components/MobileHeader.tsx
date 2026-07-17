import { PropsWithChildren } from "hono/jsx";

type Props = PropsWithChildren<{ kicker: string; title: string }>;

function MobileHeader({ kicker, title, children }: Props) {
  return (
    <div class="flex flex-col gap-1 border-b-2 border-on-surface-strong pb-3">
      <span class="kicker text-accent">{kicker}</span>
      {title && (
        <h1 class="font-display text-3xl font-medium leading-tight text-on-surface-strong text-balance pb-1">
          {title}
        </h1>
      )}
      {children}
    </div>
  );
}

export default MobileHeader;
