import Button from "../../../../components/app/Button";
import SectionTitle from "../../../../components/app/SectionTitle";
import { Creator } from "../../../../db/schema";
import { creatorPath } from "../../../app/spotlightUrls";
import {
  BADGE_SPECS,
  badgeAssetPath,
  badgeEmbedHtml,
  type BadgeVariant,
} from "../../../../lib/embedBadge";

type Props = {
  creator: Pick<Creator, "displayName" | "slug">;
  /** Profile views attributed to `?ref=badge`. Null when analytics is unavailable. */
  badgeViewCount?: number | null;
};

const ProfileBadgeCard = ({ creator, badgeViewCount }: Props) => {
  const snippets = Object.fromEntries(
    BADGE_SPECS.map((spec) => [
      spec.variant,
      badgeEmbedHtml({
        slug: creator.slug,
        displayName: creator.displayName,
        variant: spec.variant,
      }),
    ]),
  ) as Record<BadgeVariant, string>;

  return (
    <section
      class="flex flex-col gap-4 rounded-radius border border-outline bg-surface-alt p-5"
      x-data={`{ variant: 'brand', snippets: ${JSON.stringify(snippets)}, copied: false }`}
    >
      <div class="flex flex-col gap-1">
        <SectionTitle className="">Put Photobookers on your site</SectionTitle>
        <p class="max-w-2xl text-sm text-on-surface text-pretty">
          Paste this next to your Instagram and website links so visitors can
          find your Photobookers profile. Pick a style, copy the code, and drop
          it into your site's HTML.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        {BADGE_SPECS.map((spec) => (
          <button
            type="button"
            x-on:click={`variant = '${spec.variant}'; copied = false`}
            x-bind:class={`variant === '${spec.variant}' ? 'border-accent text-on-surface-strong' : 'border-outline text-on-surface-weak'`}
            class="cursor-pointer rounded-radius border px-3 py-2 text-xs font-medium transition hover:opacity-75"
          >
            {spec.label}
          </button>
        ))}
      </div>

      {BADGE_SPECS.map((spec) => (
        <div
          x-cloak
          x-show={`variant === '${spec.variant}'`}
          class="flex flex-col gap-3"
        >
          <p class="text-xs text-on-surface-weak">{spec.hint}</p>
          <div class="flex flex-wrap items-center gap-3">
            {/* Both swatches: the mono variants only read correctly on one of them. */}
            <div class="flex items-center justify-center rounded-radius border border-outline bg-white px-6 py-4">
              <img
                src={badgeAssetPath(spec.variant)}
                alt={`${creator.displayName} on Photobookers`}
                width={spec.width}
                height={spec.height}
              />
            </div>
            <div class="flex items-center justify-center rounded-radius border border-outline bg-neutral-900 px-6 py-4">
              <img
                src={badgeAssetPath(spec.variant)}
                alt={`${creator.displayName} on Photobookers`}
                width={spec.width}
                height={spec.height}
              />
            </div>
          </div>
        </div>
      ))}

      <div class="flex flex-col gap-2">
        <label
          for="profile-badge-snippet"
          class="text-xs font-medium uppercase tracking-[0.16em] text-on-surface-weak"
        >
          Embed code
        </label>
        <textarea
          id="profile-badge-snippet"
          readonly
          rows={3}
          spellcheck={false}
          x-text="snippets[variant]"
          class="w-full resize-none rounded-radius border border-outline bg-surface p-3 font-mono text-xs text-on-surface-strong"
        >
          {/* Server-rendered default: the code stays readable if Alpine never boots. */}
          {snippets.brand}
        </textarea>
        <div class="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="solid"
            color="primary"
            width="auto"
            x-on:click="copied = true; navigator.clipboard.writeText(snippets[variant])"
            x-text="copied ? 'Copied!' : 'Copy code'"
          >
            Copy code
          </Button>
          {/* Untagged on purpose: the creator's own click must not inflate badge stats. */}
          <a
            href={creatorPath(creator.slug)}
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm underline decoration-accent underline-offset-4"
          >
            Preview your profile
          </a>
        </div>
      </div>

      {typeof badgeViewCount === "number" ? (
        <p class="text-sm text-on-surface-weak">
          {badgeViewCount === 0
            ? "No badge visits yet — they'll show up here once people start clicking through."
            : `${badgeViewCount.toLocaleString()} profile ${badgeViewCount === 1 ? "visit has" : "visits have"} come from your badge.`}
        </p>
      ) : null}
    </section>
  );
};

export default ProfileBadgeCard;
