import { Dimensions, type ScrollView } from "react-native";

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

export function scrollToIndex(id: string, index: number, animated = true) {
  const scrollView = scrollRefs.get(id);
  if (!scrollView) return;

  const width = Dimensions.get("window").width;
  scrollView.scrollTo({ x: index * width, y: 0, animated });
}
