// import { paramValidator } from "../../../../lib/validator";
// import { createRoute } from "hono-fsr";
// import { slugSchema } from "../../../../features/app/schema";
// import { Context } from "hono";
// import { getUser } from "../../../../utils";
// import { getMessagesByCreatorSlug } from "../../../../features/app/services";
// import InfoPage from "../../../../pages/InfoPage";
// import AppLayout from "../../../../components/layouts/AppLayout";
// import Page from "../../../../components/layouts/Page";
// import MobileCreatorCard from "../../../../components/app/MobileCreatorCard";
// import CreatorNavTabs from "../../../../features/app/components/CreatorNavTabs";
// import { findFollow } from "../../../../db/queries";

// export const GET = createRoute(
//   paramValidator(slugSchema),
//   async (c: Context) => {
//     const slug = c.req.param("slug");
//     const user = await getUser(c);
//     const currentPath = c.req.path;

//     const [error, result] = await getMessagesByCreatorSlug(slug);

//     if (error)
//       return c.html(<InfoPage errorMessage={error.reason} user={user} />);

//     const { creator, associatedCreators, messages } = result;
//     const isFollower = user?.id
//       ? Boolean(await findFollow(creator.id, user.id))
//       : false;

//     const redactClass = !isFollower
//       ? "select-none blur-[3px] pointer-events-none"
//       : "";

//     const mockMessage = {
//       id: "mock-1",
//       creatorId: creator.id,
//       body: "This is a mock message for UI testing. New print run dropping next week.",
//       imageUrls: [
//         "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=80",
//         "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80",
//       ],
//       createdAt: new Date(),
//       updatedAt: null,
//     } as const;

//     const mockMessage2 = {
//       id: "mock-2",
//       creatorId: creator.id,
//       body: "This is a mock message for UI testing. New print run dropping next week. This is a mock message for UI testing. New print run dropping next week. This is a mock message for UI testing. New print run dropping next week.",
//       imageUrls: [
//         "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=80",
//       ],
//       createdAt: new Date(),
//       updatedAt: null,
//     } as const;

//     const messagesForUi = [mockMessage, mockMessage2, ...messages];

//     return c.html(
//       <AppLayout
//         title={creator?.displayName ?? ""}
//         user={user}
//         currentPath={currentPath}
//         adminEditHref={`/dashboard/admin/creators/${creator.id}`}
//       >
//         <Page>
//           <div class="flex flex-col gap-6">
//             {/* <MobileCreatorCard creator={creator} user={user} />
//             <CreatorNavTabs
//               showCreatorsTab={associatedCreators.length > 0}
//               creator={creator}
//               currentPath={currentPath}
//             /> */}
//             <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <div class="lg:col-span-2 flex flex-col gap-4">
//                 <h2 class="text-lg font-semibold text-on-surface-strong">
//                   Messages
//                 </h2>
//                 {messagesForUi.length === 0 ? (
//                   <div class="rounded-radius border border-outline bg-surface-alt p-6 text-sm text-on-surface">
//                     No messages yet.
//                   </div>
//                 ) : (
//                   messagesForUi.map((message) => (
//                     <article class="rounded-radius border border-outline bg-surface p-4 shadow-sm">
//                       <header class="mb-3 flex items-center justify-between gap-3">
//                         <div class="flex items-center gap-2 min-w-0">
//                           <img
//                             src={creator.coverUrl ?? ""}
//                             alt={creator.displayName}
//                             class="size-8 rounded-full object-cover"
//                           />
//                           <span class="truncate text-sm font-medium text-on-surface-strong">
//                             {creator.displayName}
//                           </span>
//                         </div>
//                         <time class="shrink-0 text-xs text-on-surface">
//                           {message.createdAt
//                             ? new Date(message.createdAt).toLocaleDateString()
//                             : ""}
//                         </time>
//                       </header>
//                       <div class="relative">
//                         <div class={redactClass}>
//                           <p class="whitespace-pre-wrap text-sm text-on-surface">
//                             {message.body}
//                           </p>
//                           {message.imageUrls &&
//                             message.imageUrls.length > 0 && (
//                               <div class="mt-3 flex flex-col gap-2">
//                                 {message.imageUrls.map((url, idx) => (
//                                   <a
//                                     href={url}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     class="block"
//                                   >
//                                     <img
//                                       src={url}
//                                       alt={`Message image ${idx + 1}`}
//                                       class="w-full rounded-radius object-cover border border-outline"
//                                       loading="lazy"
//                                     />
//                                   </a>
//                                 ))}
//                               </div>
//                             )}
//                         </div>
//                         {!isFollower && (
//                           <div class="absolute inset-0 grid place-items-center">
//                             <div class="rounded-full border border-outline bg-surface/90 px-3 py-1 text-xs font-medium text-on-surface-strong shadow-sm">
//                               Follow to unlock
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </article>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>
//         </Page>
//       </AppLayout>,
//     );
//   },
// );
