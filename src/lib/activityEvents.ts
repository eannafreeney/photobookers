type ActivityType =
  | "book_liked"
  | "book_wishlisted"
  | "book_collected"
  | "creator_followed"
  | "book_commented";

export type ActivityEvent = {
  id: string;
  type: ActivityType;
  actorId?: string;
  actorName: string;
  targetName: string;
  targetImageUrl?: string | null;
  targetCreatorName?: string;
  targetUrl?: string;
  createdAt: string;
};

type Subscriber = (event: ActivityEvent) => void;

const subscribers = new Set<Subscriber>();

export const subscribeToActivityEvents = (subscriber: Subscriber) => {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
};

export const publishActivityEvent = (
  event: Omit<ActivityEvent, "id" | "createdAt">,
) => {
  const fullEvent: ActivityEvent = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...event,
  };

  for (const subscriber of subscribers) {
    subscriber(fullEvent);
  }
};
