export const dispatchEvents = (events: string[]) => (
  <div x-sync id="server_events">
    <div x-init={events.map((e) => `$dispatch('${e}')`).join("; ")}></div>
  </div>
);
