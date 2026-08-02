/**
 * Shared layout for 9:16 story text overlay. Used by the server renderer
 * (renderBotdStorySlide) and mirrored by client-side previews.
 */
export const STORY_OVERLAY_LAYOUT = {
  width: 1080,
  height: 1920,
  paddingX: 80,
  label: {
    y: 180,
    fontSize: 34,
    letterSpacing: 6,
    fontFamily: "Instrument Sans",
    fontWeight: 600,
  },
  title: {
    y: 270,
    fontSize: 56,
    fontFamily: "Fraunces",
    fontWeight: 600,
  },
  credits: {
    y: 340,
    fontSize: 34,
    fontFamily: "Instrument Sans",
    fontWeight: 600,
  },
  fade: {
    top: "rgba(0,0,0,0.45)",
    topEnd: 0.35,
    bottomStart: 0.72,
    bottom: "rgba(0,0,0,0.2)",
  },
} as const;
