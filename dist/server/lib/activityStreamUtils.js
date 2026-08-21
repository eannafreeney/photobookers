function isBroadcastableActivityEvent(event) {
  return Boolean(event.targetImageUrl?.trim());
}
function formatSseMessage(event, data) {
  return `event: ${event}
data: ${data}

`;
}
export {
  formatSseMessage,
  isBroadcastableActivityEvent
};
