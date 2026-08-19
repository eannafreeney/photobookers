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
    <div {...alpineAttrs} data-current-user-id={currentUserId ?? ""}>
      <ActivityToast
        bgColor={infoVariant.bg}
        borderColor={infoVariant.border}
        className="fixed bottom-4 right-4 left-4 z-50 sm:hidden"
      />
      <ActivityToast
        bgColor={infoVariant.bg}
        borderColor={infoVariant.border}
        className="fixed bottom-4 right-4 z-40 hidden max-w-md sm:block"
      />
    </div>
  );
};

export default ActivityStream;

type ActivityToastProps = {
  bgColor: string;
  borderColor: string;
  className: string;
};

const ActivityToast = ({
  bgColor,
  borderColor,
  className,
}: ActivityToastProps) => (
  <div class={className}>
    <template x-if="activeItem">
      <div
        class={`list-none overflow-hidden rounded-sm border bg-surface text-on-surface-strong ${borderColor}`}
      >
        <a
          x-bind:href="activeItem.targetUrl || '#'"
          class={`flex w-full items-center gap-2 p-2 ${bgColor}`}
        >
          <template x-if="activeItem.targetImageUrl">
            <img
              x-bind:src="activeItem.targetImageUrl"
              x-bind:alt="activeItem.targetName"
              class="size-10 shrink-0 rounded object-cover"
              loading="lazy"
            />
          </template>
          <p class="min-w-0 text-sm font-medium tracking-wider">
            <span x-text="activeItem.leadingText"></span>
            <strong x-text="activeItem.targetName"></strong>
            <template x-if="activeItem.targetCreatorName">
              <span>
                {" "}
                by <span x-text="activeItem.targetCreatorName"></span>
              </span>
            </template>
            <span x-text="activeItem.trailingText"></span>
          </p>
        </a>
      </div>
    </template>
    <template x-if="pendingCount > 0">
      <button
        type="button"
        class="mt-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-on-surface shadow"
        x-on:click="dismissActive()"
        x-text="`+${pendingCount}`"
      ></button>
    </template>
  </div>
);
