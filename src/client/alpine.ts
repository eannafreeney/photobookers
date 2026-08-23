import Alpine from "alpinejs";

type AlpineInstance = typeof Alpine;

/** Alpine instance set by main.js before dashboard/admin bundles run. */
export function alpine(): AlpineInstance {
  return (window as unknown as { Alpine: AlpineInstance }).Alpine;
}
