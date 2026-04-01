const AdminBadge = ({ xData }: { xData: string }) => {
  const alpineAttrs = {
    "x-init": "true",
    "@admin-notifications-badge:updated.window": `() => console.log('admin-notifications-badge:updated'), $ajax('/dashboard/admin/notifications', { target: '${xData}-badge' })`,
  };

  return (
    <span
      {...alpineAttrs}
      id={`${xData}-badge`}
      x-data={`${xData}()`}
      x-init="init()"
      x-show="count > 0"
      x-text="count"
      class="ml-1 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-white"
    />
  );
};

export default AdminBadge;
