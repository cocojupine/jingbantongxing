/* Local UI state for the static demo. No accounts, network, or live services. */
const PREFIX = "jingban.ui.v2:";
const legacyKeys = { profile: "userProfile", bindings: "bindings", booking: "backpackBooking" };
const memory = new Map();

function store(session = false) {
  try { return session ? window.sessionStorage : window.localStorage; } catch { return null; }
}
function rawGet(key, session = false) {
  try { return store(session)?.getItem(key) ?? memory.get(key) ?? null; } catch { return memory.get(key) ?? null; }
}
function rawSet(key, value, session = false) {
  memory.set(key, value);
  try { store(session)?.setItem(key, value); } catch { /* The demo remains usable without storage. */ }
}
export function jbScope() {
  return `${rawGet("userRole") || "xinqingnian"}:${rawGet("userPhone") || "visitor"}`;
}
// Import previous demo data only into the identity that owned it when this version opened.
const legacyOwner = rawGet(PREFIX + "legacyOwner") || jbScope();
rawSet(PREFIX + "legacyOwner", legacyOwner);

function compatible(value, fallback) {
  if (fallback === null) return value === null || (typeof value === "object" && !Array.isArray(value));
  return Array.isArray(fallback) ? Array.isArray(value) : typeof value === typeof fallback && value !== null && !Array.isArray(value);
}
export function jbRead(key, fallback, session = false, scope = jbScope()) {
  try {
    const saved = rawGet(PREFIX + scope + ":" + key, session);
    const legacy = !session && scope === legacyOwner && legacyKeys[key] ? rawGet(legacyKeys[key]) : null;
    const value = JSON.parse(saved ?? legacy ?? "null");
    return compatible(value, fallback) ? value : fallback;
  } catch { return fallback; }
}
export function jbWrite(key, value, session = false, scope = jbScope()) {
  rawSet(PREFIX + scope + ":" + key, JSON.stringify(value), session);
  window.dispatchEvent(new CustomEvent("jingban-ui-change", { detail: { key, scope } }));
}
export function jbUseState(React, key, fallback, session = false) {
  const scope = jbScope();
  const [value, setValue] = React.useState(() => jbRead(key, fallback, session, scope));
  React.useEffect(() => { jbWrite(key, value, session, scope); }, [key, value, scope, session]);
  return [value, setValue];
}
export function jbFavorite(id) { return Boolean(jbRead("favorites", {})[id]); }
export function jbToggleFavorite(id) {
  const favorites = { ...jbRead("favorites", {}) };
  if (favorites[id]) delete favorites[id]; else favorites[id] = true;
  jbWrite("favorites", favorites);
  return Boolean(favorites[id]);
}
export function jbUseFavorites(React) {
  const [favorites, setFavorites] = React.useState(() => jbRead("favorites", {}));
  React.useEffect(() => {
    const update = event => {
      if (event.type === "jingban-ui-change" && event.detail?.key !== "favorites") return;
      setFavorites(jbRead("favorites", {}));
    };
    window.addEventListener("jingban-ui-change", update);
    window.addEventListener("storage", update);
    return () => { window.removeEventListener("jingban-ui-change", update); window.removeEventListener("storage", update); };
  }, []);
  return favorites;
}

function currentPath() { return (window.location.hash.slice(1) || "/").split("?")[0]; }
export function jbOpen(navigate, path) {
  navigate(path, { state: { jbFrom: currentPath() } });
}
export function jbLogout(navigate) {
  jbWrite("chat", [], true);
  jbWrite("pendingCall", null, true);
  for (const key of ["userRole", "userPhone"]) {
    memory.delete(key);
    try { store()?.removeItem(key); } catch { /* Storage may be unavailable. */ }
  }
  navigate("/", { replace: true });
}
export function jbBack(navigate, fallback, expectedSource) {
  const source = window.history.state?.usr?.jbFrom;
  const allowed = expectedSource ? source === expectedSource : ["/main", "/profile"].includes(source);
  if (allowed && window.history.state?.idx > 0) navigate(-1);
  else navigate(fallback, { replace: true });
}
export function jbUseListScroll(React, key) {
  const ref = React.useRef(null);
  React.useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.scrollTop = jbRead(key + ".scroll", 0, true);
    const save = () => jbWrite(key + ".scroll", node.scrollTop, true);
    node.addEventListener("scroll", save, { passive: true });
    return () => { save(); node.removeEventListener("scroll", save); };
  }, [key]);
  return ref;
}
export function jbShowBooking() {
  requestAnimationFrame(() => {
    const result = document.querySelector(".bp-booking-done");
    if (!result) return;
    const body = result.closest(".bp-body");
    if (!body) return;
    const card = result.closest(".card") || result;
    body.scrollTop += card.getBoundingClientRect().top - body.getBoundingClientRect().top - 12;
    result.setAttribute("tabindex", "-1");
    result.focus({ preventScroll: true });
  });
}
export function jbRestoreChat() {
  return jbRead("chat", [], true).filter(m => m && typeof m.content === "string").map(m =>
    m.loading ? { ...m, loading: false, content: m.content || "刚才的回复已中断，可以重新提问。" } : m
  );
}
export function jbAppendSummary(messages, summary, key) {
  const summaryId = summary.id || JSON.stringify(summary);
  if (messages.some(message => message.summaryId === summaryId)) return messages;
  const duration = summary.duration < 60 ? `${summary.duration} 秒` : `${Math.floor(summary.duration / 60)} 分 ${summary.duration % 60} 秒`;
  const lines = (summary.exchanges || []).flatMap(item => [`你问：${item.q}`, `小白答：${item.a}`]);
  return [...messages, { key, summaryId, role: "ai", content: [`语音通话小结 · 通话 ${duration}`, ...lines].join("\n") }];
}
