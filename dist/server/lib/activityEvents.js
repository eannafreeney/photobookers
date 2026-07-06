const subscribers = /* @__PURE__ */ new Set();
const subscribeToActivityEvents = (subscriber) => {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
};
const publishActivityEvent = (event) => {
  const fullEvent = {
    id: crypto.randomUUID(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    ...event
  };
  for (const subscriber of subscribers) {
    subscriber(fullEvent);
  }
};
export {
  publishActivityEvent,
  subscribeToActivityEvents
};
