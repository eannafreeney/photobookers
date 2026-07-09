import Alpine from "alpinejs";

export function registerSpotlightBlurbModal() {
  Alpine.data("spotlightBlurbModal", (generateAction: string) => ({
    isGenerating: false,

    async generate() {
      if (this.isGenerating) return;
      const form = this.$root;
      const textarea = form.querySelector("#spotlight-blurb-textarea");
      if (
        !(form instanceof HTMLFormElement) ||
        !(textarea instanceof HTMLTextAreaElement)
      ) {
        return;
      }

      this.isGenerating = true;
      try {
        const response = await fetch(generateAction, {
          method: "POST",
          body: new FormData(form),
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });
        const nextBlurb = await response.text();
        if (!response.ok) throw new Error(nextBlurb || "Failed to generate blurb");
        textarea.value = nextBlurb;
      } catch (error) {
        console.error("generate spotlight blurb", error);
      } finally {
        this.isGenerating = false;
      }
    },
  }));
}
