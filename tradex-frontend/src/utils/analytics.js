const EVENTS_KEY = "tradex_analytics_events";
const SESSION_KEY = "tradex_analytics_session";

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getStoredEvents() {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY)) || [];
  } catch {
    return [];
  }
}

function storeEvents(events) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-500)));
}

export function trackEvent(eventName, payload = {}) {
  const event = {
    event: eventName,
    payload,
    sessionId: getSessionId(),
    timestamp: new Date().toISOString(),
  };

  const events = getStoredEvents();
  events.push(event);
  storeEvents(events);

  if (import.meta.env.DEV) {
    console.debug("[analytics]", eventName, payload);
  }
}

export function getEvents() {
  return getStoredEvents();
}

export function clearEvents() {
  localStorage.removeItem(EVENTS_KEY);
}
