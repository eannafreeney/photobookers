import type { ScrollView } from "react-native";

const scrollRefs = new Map<string, ScrollView>();

export function registerScrollRef(id: string, ref: ScrollView | null) {
  if (ref) {
    scrollRefs.set(id, ref);
    return;
  }
  scrollRefs.delete(id);
}

export function scrollToTop(id: string, animated = true) {
  scrollRefs.get(id)?.scrollTo({ y: 0, animated });
}
