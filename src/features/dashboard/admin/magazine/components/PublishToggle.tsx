// A publish/unpublish switch mirroring the books toggle. Publishing auto-assigns
// the next issue number if the issue doesn't have one yet.

type Props = {
  issueId: string;
  isPublished: boolean;
  redirect: string;
};

const PublishMagazineIssueToggle = ({
  issueId,
  isPublished,
  redirect,
}: Props) => (
  <form
    method="post"
    action={`/dashboard/admin/magazine/${issueId}/publish`}
    x-data="{}"
  >
    <input type="hidden" name="redirect" value={redirect} />
    <label
      class="inline-flex cursor-pointer"
      title={isPublished ? "Unpublish" : "Publish"}
    >
      <input
        type="checkbox"
        class="peer sr-only"
        checked={isPublished}
        x-on:change="$root.requestSubmit()"
      />
      <div class="relative h-6 w-11 rounded-full border border-outline bg-surface-alt after:absolute after:bottom-0 after:left-0.25 after:top-0 after:my-auto after:h-5 after:w-5 after:rounded-full after:bg-on-surface after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-5 peer-checked:after:bg-on-primary peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-outline-strong peer-active:outline-offset-0"></div>
    </label>
  </form>
);

export default PublishMagazineIssueToggle;
