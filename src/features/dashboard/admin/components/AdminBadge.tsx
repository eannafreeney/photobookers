const AdminBadge = ({ xData }: { xData: string }) => (
  <span
    id={`${xData}-badge`}
    x-data={xData}
    x-init="init()"
    x-show="count > 0"
    x-text="count"
    class="ml-1 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-white"
  />
);

export default AdminBadge;
