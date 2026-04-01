import Alpine from "alpinejs";

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
    <>
      <MobileActivityItem
        currentUserId={currentUserId}
        bgColor={infoVariant.bg}
        alpineAttrs={alpineAttrs}
      />
      <DesktopActivityItem
        alpineAttrs={alpineAttrs}
        currentUserId={currentUserId}
        bgColor={infoVariant.bg}
        borderColor={infoVariant.border}
      />
    </>
  );

  // return (
  //   <ul
  //     {...alpineAttrs}
  //     data-current-user-id={currentUserId ?? ""}
  //     class="fixed bottom-4 right-4 left-4 z-50 flex w-[calc(100vw-2rem)] flex-col gap-2"
  //   >
  //     <template x-for="item in items" x-bind:key="item.id">
  //       <li
  //         class={`list-none overflow-hidden rounded-sm border bg-surface text-on-surface-strong ${infoVariant.border}`}
  //       >
  //         <a
  //           x-bind:href="item.targetUrl || '#'"
  //           class={`flex w-full items-center gap-2 p-2 ${infoVariant.bg}`}
  //         >
  //           <template x-if="item.targetImageUrl">
  //             <img
  //               x-bind:src="item.targetImageUrl"
  //               x-bind:alt="item.targetName"
  //               class="size-10 rounded object-cover shrink-0"
  //               loading="lazy"
  //             />
  //           </template>
  //           <template x-if="!item.targetImageUrl">
  //             <div class="size-10 rounded bg-slate-300/40 shrink-0"></div>
  //           </template>
  //           <p class="text-sm font-medium tracking-wider">
  //             <span x-text="item.leadingText"></span>
  //             <strong x-text="item.targetName"></strong>
  //             <template x-if="item.targetCreatorName">
  //               <span>
  //                 {" "}
  //                 by <span x-text="item.targetCreatorName"></span>
  //               </span>
  //             </template>
  //             <span x-text="item.trailingText"></span>
  //           </p>
  //         </a>
  //       </li>
  //     </template>
  //   </ul>
  // );
};

export default ActivityStream;

type ActivityItemProps = {
  currentUserId?: string;
  bgColor: string;
  alpineAttrs: Record<string, any>;
  borderColor?: string;
};

const MobileActivityItem = ({
  currentUserId,
  bgColor,
  alpineAttrs,
}: ActivityItemProps) => (
  <div
    {...alpineAttrs}
    data-current-user-id={currentUserId ?? ""}
    class={`fixed bottom-4 right-4 left-4 z-50 sm:hidden ${bgColor}`}
  >
    <template x-if="activeItem">
      <div class="list-none overflow-hidden rounded-sm border bg-surface text-on-surface-strong">
        <a
          x-bind:href="activeItem.targetUrl || '#'"
          class="flex w-full items-center gap-2 p-2"
        >
          <template x-if="activeItem.targetImageUrl">
            <img
              x-bind:src="activeItem.targetImageUrl"
              x-bind:alt="activeItem.targetName"
              class="size-10 rounded object-cover shrink-0"
              loading="lazy"
            />
          </template>
          <template x-if="!activeItem.targetImageUrl">
            <div class="size-10 rounded bg-slate-300/40 shrink-0"></div>
          </template>
          <p class="text-sm font-medium tracking-wider min-w-0">
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
        x-on:click="showNextMobile()"
        x-text="`+${pendingCount}`"
      ></button>
    </template>
  </div>
);

const DesktopActivityItem = ({
  alpineAttrs,
  currentUserId,
  bgColor,
  borderColor,
}: ActivityItemProps) => (
  <ul
    {...alpineAttrs}
    data-current-user-id={currentUserId ?? ""}
    class="fixed bottom-4 right-4 left-4 z-50 hidden sm:flex w-[calc(100vw-2rem)] flex-col gap-2"
  >
    <template x-for="item in items" x-bind:key="item.id">
      <li
        class={`list-none overflow-hidden rounded-sm border bg-surface text-on-surface-strong ${borderColor}`}
      >
        <a
          x-bind:href="item.targetUrl || '#'"
          class={`flex w-full items-center gap-2 p-2 ${bgColor}`}
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
