type Props = {
  displayName: string;
};

const benefits = [
  {
    title: "Control",
    body: "Fix your catalog, buy links, and how your work is presented.",
  },
  {
    title: "Audience",
    body: "Post updates to followers and mark book fair attendance.",
  },
  {
    title: "Insights",
    body: "Unlock full analytics on views, favorites, and purchase clicks.",
  },
];

const ClaimBenefitsPanel = ({ displayName }: Props) => (
  <div class="flex flex-col gap-4 rounded-radius border border-outline bg-surface-alt/40 p-5">
    <div>
      <p class="kicker text-accent mb-1">Already on Photobookers</p>
      <p class="text-sm text-on-surface text-pretty md:text-base">
        <strong>{displayName}</strong> already has a public profile with books
        on Photobookers. Claim it to take control — collectors are already
        finding you.
      </p>
    </div>
    <ul class="grid gap-3 sm:grid-cols-3">
      {benefits.map((item) => (
        <li
          key={item.title}
          class="list-none rounded-radius border border-outline bg-surface p-4"
        >
          <p class="font-medium text-on-surface-strong">{item.title}</p>
          <p class="mt-1 text-sm text-on-surface-weak">{item.body}</p>
        </li>
      ))}
    </ul>
  </div>
);

export default ClaimBenefitsPanel;
