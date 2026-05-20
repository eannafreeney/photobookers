import { Behavior } from "../../lib/hxml-comps";
import { xmlText } from "../../lib/hxml";
import type { Session } from "@supabase/supabase-js";

export function hyperviewSessionSyncAndNavigate(
  baseUrl: string,
  session: Session,
) {
  const featured = `${baseUrl}/hyperview/featured`;
  return (
    <view xmlns="https://hyperview.org/hyperview">
      <Behavior
        trigger="load"
        action="set-supabase-session"
        access-token={xmlText(session.access_token)}
        refresh-token={xmlText(session.refresh_token)}
      />
      <Behavior trigger="load" action="navigate" href={featured} />
    </view>
  );
}

export function hyperviewSignOutAndNavigate(baseUrl: string) {
  const featured = `${baseUrl}/hyperview/featured`;
  return (
    <view xmlns="https://hyperview.org/hyperview">
      <Behavior trigger="load" action="sign-out-supabase" />
      <Behavior trigger="load" action="navigate" href={featured} />
    </view>
  );
}
