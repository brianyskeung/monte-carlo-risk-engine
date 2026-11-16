// Anonymous per-browser identity for saved runs. There are no accounts: each
// browser generates a random UUID once, keeps it in localStorage, and sends it
// as X-Client-Id on every /api/runs request. The backend scopes saved runs to
// that id, so visitors only ever see and delete their own history.

const CLIENT_ID_STORAGE_KEY = "monte-carlo-risk-engine:client-id";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Random v4 UUID, with a getRandomValues fallback for non-secure contexts. */
function generateUuid(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

/** Reads this browser's id, creating and storing one on first use. */
function loadClientId(): string {
  try {
    const saved = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    if (saved && UUID_PATTERN.test(saved)) return saved;

    const created = generateUuid();
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, created);
    return created;
  } catch {
    // storage blocked (e.g. some private modes): runs last for this tab only
    return generateUuid();
  }
}

export const CLIENT_ID = loadClientId();

/** Headers to attach to every saved-run request. */
export const CLIENT_HEADERS = { "X-Client-Id": CLIENT_ID };
