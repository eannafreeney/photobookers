const ActivityStream = ({ currentUserId }: { currentUserId?: string }) => {
  const alpineAttrs = {
    "x-data": "activityFeed",
    "x-init": "connect()",
    "x-on:beforeunload.window": "disconnect()",
  };

  const infoVariant = {
    border: "border-sky-700",
    bg: "bg-info/10",
  };

  return (
    <ul
      {...alpineAttrs}
      data-current-user-id={currentUserId ?? ""}
      class="fixed bottom-4 right-4 z-50 flex max-w-md flex-col gap-2"
    >
      <template x-for="item in items" x-bind:key="item.id">
        <li
          class={`list-none overflow-hidden rounded-sm border bg-surface text-on-surface-strong ${infoVariant.border}`}
        >
          <a
            x-bind:href="item.targetUrl || '#'"
            class={`flex w-full items-center gap-2 p-2 ${infoVariant.bg}`}
          >
            <template x-if="item.targetImageUrl">
              <img
                x-bind:src="item.targetImageUrl"
                x-bind:alt="item.targetName"
                class="size-10 rounded object-cover shrink-0"
                loading="lazy"
              />
            </template>
            <template x-if="!item.targetImageUrl">
              <div class="size-10 rounded bg-slate-300/40 shrink-0"></div>
            </template>
            <p class="text-sm font-medium tracking-wider">
              <span x-text="item.leadingText"></span>
              <strong x-text="item.targetName"></strong>
              <template x-if="item.targetCreatorName">
                <span>
                  {" "}
                  by <span x-text="item.targetCreatorName"></span>
                </span>
              </template>
              <span x-text="item.trailingText"></span>
            </p>
          </a>
        </li>
      </template>
    </ul>
  );
};

export default ActivityStream;
