var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/state.js
var state_exports = {};
__export(state_exports, {
  activeKeys: () => activeKeys,
  ageAt: () => ageAt,
  avatarData: () => avatarData,
  bindingError: () => bindingError,
  bookingValid: () => bookingValid,
  emptyProfile: () => emptyProfile,
  getList: () => getList,
  getProfile: () => getProfile,
  localDate: () => localDate,
  nextShow: () => nextShow,
  profileError: () => profileError,
  readJSON: () => readJSON,
  safeBack: () => safeBack,
  signIn: () => signIn,
  signOut: () => signOut
});
var activeKeys = [
  "userProfile",
  "profileCompleted",
  "bindings",
  "backpackBooking",
  "favorites"
];
var emptyProfile = {
  avatar: "",
  name: "",
  gender: "",
  birthday: "",
  region: "",
  relation: "",
  emergencyPhone: "",
  sensory: [],
  interests: [],
  advice: ""
};
function readJSON(key, fallback, storage = localStorage) {
  try {
    const value = JSON.parse(storage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}
function getProfile(storage = localStorage) {
  const value = readJSON("userProfile", {}, storage);
  const result = { ...emptyProfile };
  for (const key of Object.keys(result)) {
    if (Array.isArray(result[key]))
      result[key] = Array.isArray(value[key]) ? value[key].filter((x) => typeof x === "string") : [];
    else result[key] = typeof value[key] === "string" ? value[key] : "";
  }
  return result;
}
function getList(key, storage = localStorage) {
  const value = readJSON(key, [], storage);
  return Array.isArray(value) ? value : [];
}
function localDate(date = /* @__PURE__ */ new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function ageAt(birthday, today = /* @__PURE__ */ new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday) || birthday > localDate(today))
    return null;
  const [year, month, day] = birthday.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return null;
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || today.getMonth() + 1 === month && today.getDate() < day)
    age--;
  return age >= 0 && age < 130 ? age : null;
}
function profileError(profile, today = /* @__PURE__ */ new Date()) {
  if (!profile.name.trim()) return "\u8BF7\u586B\u5199\u59D3\u540D";
  if (profile.name.trim().length > 30) return "\u59D3\u540D\u8BF7\u63A7\u5236\u5728 30 \u4E2A\u5B57\u4EE5\u5185";
  if (profile.birthday && ageAt(profile.birthday, today) === null)
    return "\u8BF7\u586B\u5199\u6709\u6548\u7684\u51FA\u751F\u65E5\u671F\uFF0C\u4E0D\u80FD\u665A\u4E8E\u4ECA\u5929";
  if (profile.emergencyPhone && !/^1\d{10}$/.test(profile.emergencyPhone))
    return "\u8BF7\u586B\u5199\u6B63\u786E\u7684 11 \u4F4D\u7D27\u6025\u8054\u7CFB\u7535\u8BDD";
  return "";
}
function bindingError({ name, phone, relation }, bindings, ownPhone) {
  if (!name.trim()) return "\u8BF7\u586B\u5199\u5BF9\u65B9\u59D3\u540D";
  if (!/^1\d{10}$/.test(phone)) return "\u8BF7\u586B\u5199\u6B63\u786E\u7684 11 \u4F4D\u624B\u673A\u53F7";
  if (phone === ownPhone) return "\u4E0D\u80FD\u7ED1\u5B9A\u81EA\u5DF1\u7684\u8D26\u53F7";
  if (bindings.some((item) => item.phone === phone))
    return "\u8BE5\u8D26\u53F7\u5DF2\u6DFB\u52A0\uFF0C\u8BF7\u52FF\u91CD\u590D\u7ED1\u5B9A";
  if (!relation) return "\u8BF7\u9009\u62E9\u5173\u7CFB";
  return "";
}
function saveActive(storage) {
  const phone = storage.getItem("userPhone");
  if (!phone) return;
  const snapshot = Object.fromEntries(
    activeKeys.map((key) => [key, storage.getItem(key)])
  );
  const role = storage.getItem("accountRole") || storage.getItem("userRole") || "xinqingnian";
  storage.setItem(`jb-account:${phone}:${role}`, JSON.stringify(snapshot));
}
function signIn(phone, role, storage = localStorage) {
  const previousRole = storage.getItem("accountRole") || storage.getItem("userRole");
  const identityChanged = storage.getItem("userPhone") !== phone || previousRole !== role;
  saveActive(storage);
  const snapshot = readJSON(`jb-account:${phone}:${role}`, {}, storage);
  for (const key of activeKeys) {
    if (typeof snapshot[key] === "string") storage.setItem(key, snapshot[key]);
    else storage.removeItem(key);
  }
  storage.setItem("userPhone", phone);
  storage.setItem("userRole", role);
  storage.setItem("accountRole", role);
  if (identityChanged) {
    globalThis.sessionStorage?.removeItem("jb-chat");
    globalThis.sessionStorage?.removeItem("jb-call-summary");
  }
}
function signOut(storage = localStorage) {
  saveActive(storage);
  for (const key of [...activeKeys, "userPhone", "userRole", "accountRole"])
    storage.removeItem(key);
  globalThis.sessionStorage?.removeItem("jb-chat");
  globalThis.sessionStorage?.removeItem("jb-call-summary");
}
function bookingValid(booking) {
  return booking && typeof booking.code === "string" && /^BP\d+$/.test(booking.code) && typeof booking.point === "string" && /^\d{4}-\d{2}-\d{2}$/.test(booking.date) && Number.isInteger(booking.count) && booking.count >= 1 && booking.count <= 3;
}
function safeBack(navigate, fallback = "/main") {
  if (window.history.state?.idx > 0) navigate(-1);
  else navigate(fallback, { replace: true });
}
function nextShow(shows, now = /* @__PURE__ */ new Date()) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return shows.flatMap(
    (show) => show.time.split(" / ").map((time) => {
      const [h, m] = time.split(":").map(Number);
      return { ...show, time, remaining: h * 60 + m - minutes };
    })
  ).filter((show) => show.remaining >= 0).sort((a, b) => a.remaining - b.remaining)[0] || null;
}
async function avatarData(file) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw new Error("\u8BF7\u9009\u62E9 PNG\u3001JPG \u6216 WebP \u56FE\u7247");
  if (file.size > 5 * 1024 * 1024) throw new Error("\u56FE\u7247\u4E0D\u80FD\u8D85\u8FC7 5MB");
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const side = Math.min(bitmap.width, bitmap.height);
  canvas.getContext("2d").drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    256,
    256
  );
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

// src/enhancements.jsx
function createEnhancements({
  React,
  useNavigate,
  useLocation,
  useSearchParams,
  Frame,
  StatusBar,
  ProfileModal,
  Modal,
  useApp,
  venues,
  stories,
  shows
}) {
  const { useState, useEffect } = React;
  const paths = {
    home: "M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10",
    map: "m9 3-6 3v15l6-3 6 3 6-3V3l-6 3-6-3Zm0 0v15m6-12v15",
    chat: "M21 11a9 9 0 0 1-9 9H4l-2 2V11a9 9 0 0 1 19 0ZM7 10h10M7 14h6",
    user: "M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    bag: "M5 7h14v14H5V7Zm3 0V5a4 4 0 0 1 8 0v2M8 12h8M8 17h8",
    book: "M12 5v16M3 3h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v16h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3V3Z",
    heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
    shield: "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4Zm-4 10 3 3 5-6",
    edit: "m16 3 5 5-12 12-6 1 1-6L16 3ZM13 6l5 5",
    arrow: "m9 5 7 7-7 7",
    back: "m15 5-7 7 7 7",
    plus: "M12 5v14M5 12h14",
    clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2",
    help: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9 8a3 3 0 0 1 6 0c0 2-3 2-3 5M12 16v1",
    exit: "M9 3H3v18h6M8 12h13m-5-5 5 5-5 5"
  };
  function Icon({ name, size = 22 }) {
    return /* @__PURE__ */ React.createElement(
      "svg",
      {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.7",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true"
      },
      /* @__PURE__ */ React.createElement("path", { d: paths[name] || paths.map })
    );
  }
  function BottomNav({ active }) {
    const navigate = useNavigate();
    const location = useLocation();
    return /* @__PURE__ */ React.createElement("nav", { className: "jb-bottom-nav", "aria-label": "\u4E3B\u5BFC\u822A" }, [
      ["home", "\u9996\u9875", "/main"],
      ["map", "\u5730\u56FE", "/map"],
      ["chat", "\u5C0F\u767D", "/chat"],
      ["user", "\u6211\u7684", "/profile"]
    ].map(([key, label, path]) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key,
        "aria-current": key === active ? "page" : void 0,
        onClick: () => {
          if (location.pathname !== path) navigate(path);
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: key }),
      /* @__PURE__ */ React.createElement("span", null, label)
    )));
  }
  function Header({ title, fallback = "/main", back = true }) {
    const navigate = useNavigate();
    return /* @__PURE__ */ React.createElement("header", { className: "jb-header" }, /* @__PURE__ */ React.createElement(StatusBar, { dark: true }), /* @__PURE__ */ React.createElement("div", { className: "jb-titlebar" }, back ? /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "jb-icon-button",
        "aria-label": "\u8FD4\u56DE",
        onClick: () => safeBack(navigate, fallback)
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "back" })
    ) : /* @__PURE__ */ React.createElement("span", { className: "jb-icon-space" }), /* @__PURE__ */ React.createElement("h1", null, title), /* @__PURE__ */ React.createElement("span", { className: "jb-wordmark" }, back ? "" : "\u9CB8\u4F34\u540C\u884C")));
  }
  function Page({ title, children, active, fallback }) {
    return /* @__PURE__ */ React.createElement(Frame, { variant: "gray", className: "jb-page" }, /* @__PURE__ */ React.createElement(Header, { title, fallback }), /* @__PURE__ */ React.createElement("main", { className: "jb-scroll" }, children), active && /* @__PURE__ */ React.createElement(BottomNav, { active }));
  }
  function Row({ icon, title, subtitle, onClick, meta }) {
    return /* @__PURE__ */ React.createElement("button", { className: "jb-row", onClick }, /* @__PURE__ */ React.createElement("span", { className: `jb-row-icon icon-${icon}` }, /* @__PURE__ */ React.createElement(Icon, { name: icon })), /* @__PURE__ */ React.createElement("span", { className: "jb-row-copy" }, /* @__PURE__ */ React.createElement("span", { className: "jb-row-title" }, title), subtitle && /* @__PURE__ */ React.createElement("span", { className: "jb-row-sub" }, subtitle)), meta && /* @__PURE__ */ React.createElement("span", { className: "jb-row-meta" }, meta), /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 16 }));
  }
  function Profile() {
    const navigate = useNavigate();
    const { message, modal } = useApp();
    const [profile, setProfile] = useState(getProfile);
    const [editing, setEditing] = useState(false);
    const [bindings, setBindings] = useState(() => getList("bindings"));
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState({ name: "", phone: "", relation: "" });
    const role = localStorage.getItem("userRole") || "xinqingnian";
    const phone = localStorage.getItem("userPhone") || "";
    const isParent = role === "parent";
    const booking = readJSON("backpackBooking", null);
    const hasBooking = bookingValid(booking);
    const favorites = getList("favorites");
    const fields = [
      "name",
      "gender",
      "birthday",
      "region",
      "emergencyPhone",
      "avatar",
      "sensory",
      "interests",
      "advice"
    ];
    const completion = Math.round(
      fields.filter(
        (key) => Array.isArray(profile[key]) ? profile[key].length : profile[key]
      ).length / fields.length * 100
    );
    const addBinding = () => {
      const error = bindingError(draft, bindings, phone);
      if (error) return message.warning(error);
      const next = [
        ...bindings,
        {
          ...draft,
          name: draft.name.trim(),
          id: crypto.randomUUID(),
          time: localDate()
        }
      ];
      try {
        localStorage.setItem("bindings", JSON.stringify(next));
        setBindings(next);
        setAdding(false);
        message.success("\u5DF2\u6DFB\u52A0\u6F14\u793A\u7ED1\u5B9A");
      } catch {
        message.error("\u672C\u5730\u5B58\u50A8\u7A7A\u95F4\u4E0D\u8DB3\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5");
      }
    };
    const removeBinding = (item) => modal.confirm({
      title: "\u89E3\u9664\u8FD9\u6761\u7ED1\u5B9A\uFF1F",
      content: `\u5C06\u79FB\u9664\u4E0E\u300C${item.name}\u300D\u7684\u6F14\u793A\u7ED1\u5B9A\uFF0C\u4E2A\u4EBA\u6863\u6848\u4F1A\u4FDD\u7559\u3002`,
      okText: "\u89E3\u9664\u7ED1\u5B9A",
      cancelText: "\u4FDD\u7559\u7ED1\u5B9A",
      onOk: () => {
        const next = bindings.filter((b) => b.id !== item.id);
        localStorage.setItem("bindings", JSON.stringify(next));
        setBindings(next);
      }
    });
    const logout = () => modal.confirm({
      title: "\u9000\u51FA\u5F53\u524D\u8D26\u53F7\uFF1F",
      content: "\u5DF2\u4FDD\u5B58\u7684\u6863\u6848\u548C\u9884\u7EA6\u4F1A\u4FDD\u7559\u5728\u672C\u673A\uFF0C\u518D\u6B21\u767B\u5F55\u540C\u4E00\u8D26\u53F7\u53EF\u7EE7\u7EED\u67E5\u770B\u3002",
      okText: "\u9000\u51FA\u767B\u5F55",
      cancelText: "\u7EE7\u7EED\u6E38\u56ED",
      onOk: () => {
        signOut();
        navigate("/", { replace: true });
      }
    });
    return /* @__PURE__ */ React.createElement(Frame, { variant: "gray", className: "jb-page jb-profile" }, /* @__PURE__ */ React.createElement(Header, { title: "\u6211\u7684", back: false }), /* @__PURE__ */ React.createElement("main", { className: "jb-scroll profile-scroll", "aria-label": "\u6211\u7684\u8D44\u6599\u4E0E\u670D\u52A1" }, /* @__PURE__ */ React.createElement("section", { className: "jb-profile-card" }, /* @__PURE__ */ React.createElement("div", { className: "jb-profile-top" }, /* @__PURE__ */ React.createElement("div", { className: "jb-avatar" }, profile.avatar ? /* @__PURE__ */ React.createElement("img", { src: profile.avatar, alt: "\u6211\u7684\u5934\u50CF" }) : /* @__PURE__ */ React.createElement("img", { src: "assets/xiaobai.png", alt: "\u5C0F\u767D" })), /* @__PURE__ */ React.createElement("div", { className: "jb-profile-heading" }, /* @__PURE__ */ React.createElement("span", { className: "jb-role" }, isParent ? "\u5BB6\u957F \xB7 \u7167\u62A4\u6863\u6848" : "\u5FC3\u9752\u5E74"), /* @__PURE__ */ React.createElement("h2", null, profile.name || "\u4F60\u597D\uFF0C\u5C0F\u4F19\u4F34"), /* @__PURE__ */ React.createElement("p", null, phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") : "\u8BA9\u6BCF\u4E00\u6B21\u6E38\u56ED\uFF0C\u90FD\u66F4\u5B89\u5FC3")), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "jb-edit",
        onClick: () => setEditing(true),
        "aria-label": "\u7F16\u8F91\u4E2A\u4EBA\u6863\u6848"
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 18 }),
      /* @__PURE__ */ React.createElement("span", null, "\u7F16\u8F91")
    )), /* @__PURE__ */ React.createElement("div", { className: "jb-completion" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, isParent ? "\u5FC3\u9752\u5E74\u6863\u6848" : "\u4E2A\u4EBA\u6863\u6848"), /* @__PURE__ */ React.createElement("b", null, completion, "%")), /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "jb-progress",
        role: "progressbar",
        "aria-label": "\u6863\u6848\u5B8C\u5584\u5EA6",
        "aria-valuenow": completion,
        "aria-valuemin": 0,
        "aria-valuemax": 100
      },
      /* @__PURE__ */ React.createElement("span", { style: { width: `${completion}%` } })
    ), /* @__PURE__ */ React.createElement("button", { onClick: () => setEditing(true) }, completion === 100 ? "\u67E5\u770B\u6863\u6848" : "\u7EE7\u7EED\u5B8C\u5584", /* @__PURE__ */ React.createElement(Icon, { name: "arrow", size: 13 }))), profile.sensory.length > 0 ? /* @__PURE__ */ React.createElement("div", { className: "jb-sensory" }, profile.sensory.map((s) => /* @__PURE__ */ React.createElement("span", { key: s }, s))) : /* @__PURE__ */ React.createElement("p", { className: "jb-card-note" }, /* @__PURE__ */ React.createElement(Icon, { name: "shield", size: 14 }), isParent ? "\u586B\u5199\u5B69\u5B50\u7684\u611F\u5B98\u504F\u597D\uFF0C\u8BB0\u5F55\u9700\u8981\u7684\u652F\u6301" : "\u586B\u5199\u611F\u5B98\u504F\u597D\uFF0C\u8BB0\u5F55\u4F60\u9700\u8981\u7684\u652F\u6301")), /* @__PURE__ */ React.createElement("section", { className: "jb-section" }, /* @__PURE__ */ React.createElement("div", { className: "jb-section-heading" }, /* @__PURE__ */ React.createElement("h2", null, "\u6211\u7684\u6E38\u56ED"), /* @__PURE__ */ React.createElement("span", null, "\u51C6\u5907\u597D\uFF0C\u6162\u6162\u51FA\u53D1")), /* @__PURE__ */ React.createElement("div", { className: "jb-quick-grid" }, /* @__PURE__ */ React.createElement("button", { onClick: () => navigate("/backpack") }, /* @__PURE__ */ React.createElement("span", { className: "jb-quick-icon" }, /* @__PURE__ */ React.createElement(Icon, { name: "bag", size: 26 })), /* @__PURE__ */ React.createElement("b", null, "\u4E66\u5305\u9884\u7EA6"), /* @__PURE__ */ React.createElement("span", null, hasBooking ? "\u67E5\u770B\u9884\u7EA6\u7801" : "\u4E3A\u6E38\u56ED\u591A\u4E00\u4EFD\u5B89\u5FC3"), hasBooking && /* @__PURE__ */ React.createElement("i", { className: "jb-dot" })), /* @__PURE__ */ React.createElement("button", { onClick: () => navigate("/favorites") }, /* @__PURE__ */ React.createElement("span", { className: "jb-quick-icon coral" }, /* @__PURE__ */ React.createElement(Icon, { name: "heart", size: 26 })), /* @__PURE__ */ React.createElement("b", null, "\u6211\u7684\u6536\u85CF"), /* @__PURE__ */ React.createElement("span", null, favorites.length ? `${favorites.length} \u4E2A\u559C\u6B22\u7684\u5185\u5BB9` : "\u628A\u559C\u6B22\u7684\u7559\u5728\u8FD9\u91CC")))), /* @__PURE__ */ React.createElement("section", { className: "jb-section" }, /* @__PURE__ */ React.createElement("div", { className: "jb-section-heading" }, /* @__PURE__ */ React.createElement("h2", null, isParent ? "\u6211\u5B88\u62A4\u7684\u5FC3\u9752\u5E74" : "\u5BB6\u4EBA\u7684\u966A\u4F34"), /* @__PURE__ */ React.createElement("span", null, "\u4E00\u8D77\u5B89\u5FC3\u6E38\u56ED")), /* @__PURE__ */ React.createElement("div", { className: "jb-panel jb-family" }, bindings.length ? bindings.map((item) => /* @__PURE__ */ React.createElement("div", { className: "jb-binding", key: item.id }, /* @__PURE__ */ React.createElement("span", { className: "jb-binding-avatar" }, item.name?.slice(0, 1)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, item.name, /* @__PURE__ */ React.createElement("span", null, item.relation)), /* @__PURE__ */ React.createElement("p", null, item.phone?.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"))), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => removeBinding(item),
        "aria-label": `\u89E3\u9664\u4E0E${item.name}\u7684\u7ED1\u5B9A`
      },
      "\u89E3\u7ED1"
    ))) : /* @__PURE__ */ React.createElement("div", { className: "jb-family-empty" }, /* @__PURE__ */ React.createElement("span", { className: "jb-family-icon" }, /* @__PURE__ */ React.createElement(Icon, { name: "user", size: 24 })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, isParent ? "\u6DFB\u52A0\u4F60\u5B88\u62A4\u7684\u5FC3\u9752\u5E74" : "\u8BA9\u5BB6\u4EBA\u966A\u4F60\u4E00\u8D77"), /* @__PURE__ */ React.createElement("p", null, isParent ? "\u628A\u540C\u884C\u5173\u7CFB\u8BB0\u5F55\u5728\u8FD9\u91CC" : "\u6DFB\u52A0\u5BB6\u957F\uFF0C\u7559\u4E0B\u4E00\u4EFD\u5B89\u5FC3\u7684\u966A\u4F34"))), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "jb-family-add",
        onClick: () => {
          setDraft({ name: "", phone: "", relation: "" });
          setAdding(true);
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 17 }),
      isParent ? "\u7ED1\u5B9A\u5FC3\u9752\u5E74" : "\u7ED1\u5B9A\u5BB6\u957F"
    ))), /* @__PURE__ */ React.createElement("section", { className: "jb-section" }, /* @__PURE__ */ React.createElement("div", { className: "jb-section-heading" }, /* @__PURE__ */ React.createElement("h2", null, "\u6E38\u56ED\u5C0F\u5E2E\u624B")), /* @__PURE__ */ React.createElement("div", { className: "jb-panel" }, /* @__PURE__ */ React.createElement(
      Row,
      {
        icon: "book",
        title: "\u793E\u4EA4\u6545\u4E8B",
        subtitle: "\u63D0\u524D\u770B\u770B\uFF0C\u6E38\u56ED\u65F6\u66F4\u4ECE\u5BB9",
        onClick: () => navigate("/stories")
      }
    ), /* @__PURE__ */ React.createElement(
      Row,
      {
        icon: "map",
        title: "\u573A\u9986\u4FE1\u606F",
        subtitle: "\u611F\u5B98\u523A\u6FC0\u4E0E\u5B89\u9759\u4F11\u606F\u533A",
        onClick: () => navigate("/venues")
      }
    ), /* @__PURE__ */ React.createElement(
      Row,
      {
        icon: "help",
        title: "\u5E2E\u52A9\u4E2D\u5FC3",
        onClick: () => navigate("/help")
      }
    ), /* @__PURE__ */ React.createElement(
      Row,
      {
        icon: "shield",
        title: "\u4F7F\u7528\u4E0E\u9690\u79C1\u8BF4\u660E",
        onClick: () => navigate("/policy")
      }
    ))), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "jb-logout",
        onClick: phone ? logout : () => navigate("/")
      },
      /* @__PURE__ */ React.createElement(Icon, { name: phone ? "exit" : "user", size: 18 }),
      phone ? "\u9000\u51FA\u767B\u5F55" : "\u767B\u5F55 / \u6CE8\u518C"
    ), /* @__PURE__ */ React.createElement("p", { className: "jb-signature" }, "\u9CB8\u4F34\u540C\u884C \xB7 \u966A\u4F60\u6162\u6162\u63A2\u7D22\u4E16\u754C")), /* @__PURE__ */ React.createElement(BottomNav, { active: "user" }), /* @__PURE__ */ React.createElement(
      ProfileModal,
      {
        open: editing,
        role,
        onDone: () => {
          setEditing(false);
          setProfile(getProfile());
        }
      }
    ), /* @__PURE__ */ React.createElement(
      Modal,
      {
        open: adding,
        onCancel: () => setAdding(false),
        footer: null,
        title: isParent ? "\u7ED1\u5B9A\u5FC3\u9752\u5E74" : "\u7ED1\u5B9A\u5BB6\u957F",
        width: 360,
        centered: true,
        className: "jb-dialog"
      },
      /* @__PURE__ */ React.createElement("p", { className: "jb-modal-description" }, "\u6B64\u5904\u8BB0\u5F55\u672C\u673A\u6F14\u793A\u7ED1\u5B9A\uFF0C\u4E0D\u4F1A\u53D1\u9001\u9080\u8BF7\u6216\u540C\u6B65\u5BF9\u65B9\u6863\u6848\u3002"),
      /* @__PURE__ */ React.createElement("label", { className: "jb-field" }, "\u5BF9\u65B9\u59D3\u540D", /* @__PURE__ */ React.createElement(
        "input",
        {
          maxLength: 30,
          placeholder: "\u8BF7\u8F93\u5165\u5BF9\u65B9\u59D3\u540D",
          value: draft.name,
          onChange: (e) => setDraft({ ...draft, name: e.target.value })
        }
      )),
      /* @__PURE__ */ React.createElement("label", { className: "jb-field" }, "\u5BF9\u65B9\u624B\u673A\u53F7", /* @__PURE__ */ React.createElement(
        "input",
        {
          inputMode: "tel",
          maxLength: 11,
          placeholder: "\u8BF7\u8F93\u5165 11 \u4F4D\u624B\u673A\u53F7",
          value: draft.phone,
          onChange: (e) => setDraft({ ...draft, phone: e.target.value.replace(/\D/g, "") })
        }
      )),
      /* @__PURE__ */ React.createElement("label", { className: "jb-field" }, "TA \u4E0E\u6211\u7684\u5173\u7CFB", /* @__PURE__ */ React.createElement(
        "select",
        {
          value: draft.relation,
          onChange: (e) => setDraft({ ...draft, relation: e.target.value })
        },
        /* @__PURE__ */ React.createElement("option", { value: "" }, "\u8BF7\u9009\u62E9\u5173\u7CFB"),
        (isParent ? ["\u6211\u7684\u5B69\u5B50", "\u5176\u4ED6\u76D1\u62A4\u5BF9\u8C61"] : ["\u7238\u7238", "\u5988\u5988", "\u5176\u4ED6\u76D1\u62A4\u4EBA"]).map((r) => /* @__PURE__ */ React.createElement("option", { key: r }, r))
      )),
      /* @__PURE__ */ React.createElement("button", { className: "jb-primary", onClick: addBinding }, "\u786E\u8BA4\u6DFB\u52A0")
    ));
  }
  function Favorites() {
    const navigate = useNavigate();
    const [saved] = useState(() => getList("favorites"));
    const items = [
      ...stories.map((s) => ({
        ...s,
        label: s.title,
        type: "story",
        route: "/stories/"
      })),
      ...venues.map((s) => ({
        ...s,
        label: s.name,
        type: "venue",
        route: "/venues/"
      }))
    ].filter((item) => saved.includes(`${item.type}:${item.id}`));
    return /* @__PURE__ */ React.createElement(Page, { title: "\u6211\u7684\u6536\u85CF", fallback: "/profile" }, /* @__PURE__ */ React.createElement("p", { className: "jb-intro" }, "\u559C\u6B22\u7684\u573A\u9986\u4E0E\u6545\u4E8B\uFF0C\u968F\u65F6\u56DE\u6765\u770B\u770B\u3002"), items.length ? /* @__PURE__ */ React.createElement("div", { className: "jb-panel" }, items.map((item) => /* @__PURE__ */ React.createElement(
      Row,
      {
        key: item.type + item.id,
        icon: item.type === "story" ? "book" : "map",
        title: item.label,
        subtitle: item.category,
        onClick: () => navigate(item.route + item.id)
      }
    ))) : /* @__PURE__ */ React.createElement("div", { className: "jb-empty" }, /* @__PURE__ */ React.createElement(Icon, { name: "heart", size: 42 }), /* @__PURE__ */ React.createElement("h2", null, "\u8FD8\u6CA1\u6709\u6536\u85CF"), /* @__PURE__ */ React.createElement("p", null, "\u70B9\u51FB\u573A\u9986\u6216\u6545\u4E8B\u4E0A\u7684\u7231\u5FC3\uFF0C", /* @__PURE__ */ React.createElement("br", null), "\u5C31\u80FD\u5728\u8FD9\u91CC\u627E\u5230\u5B83\u3002"), /* @__PURE__ */ React.createElement("button", { className: "jb-primary", onClick: () => navigate("/venues") }, "\u53BB\u770B\u770B\u573A\u9986")));
  }
  function Guide() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const selected = venues.find((v) => v.id === params.get("venue"));
    return /* @__PURE__ */ React.createElement(Page, { title: "\u56ED\u533A\u5730\u56FE", active: "map" }, /* @__PURE__ */ React.createElement("p", { className: "jb-intro" }, "\u5148\u4E86\u89E3\u573A\u9986\u4F4D\u7F6E\uFF0C\u518D\u6309\u81EA\u5DF1\u7684\u8282\u594F\u51FA\u53D1\u3002"), /* @__PURE__ */ React.createElement("div", { className: "jb-guide-map", "aria-label": "\u56ED\u533A\u5206\u533A\u793A\u610F" }, /* @__PURE__ */ React.createElement("span", { className: "jb-map-north" }, "\u5317\u533A \xB7 \u6781\u5730\u9986"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "\u4E2D\u592E\u533A", /* @__PURE__ */ React.createElement("br", null), "\u767D\u9CB8 / \u6D77\u8C5A\u5267\u573A"), /* @__PURE__ */ React.createElement("span", null, "\u4E1C\u533A", /* @__PURE__ */ React.createElement("br", null), "\u6C34\u6BCD\u5BAB / \u6D77\u5E95\u96A7\u9053")), /* @__PURE__ */ React.createElement("span", { className: "jb-map-south" }, "\u5357\u533A \xB7 \u6D77\u72EE\u5E7F\u573A")), /* @__PURE__ */ React.createElement("p", { className: "jb-map-note" }, "\u5206\u533A\u793A\u610F\uFF0C\u4EE5\u73B0\u573A\u6807\u8BC6\u4E3A\u51C6\uFF1B\u6682\u4E0D\u63D0\u4F9B\u5B9E\u65F6\u5B9A\u4F4D\u3002"), selected && /* @__PURE__ */ React.createElement("section", { className: "jb-panel jb-destination" }, /* @__PURE__ */ React.createElement("span", { className: "jb-role" }, "\u76EE\u7684\u5730"), /* @__PURE__ */ React.createElement("h2", null, selected.name), /* @__PURE__ */ React.createElement("p", null, selected.location), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("b", null, "\u9644\u8FD1\u4F11\u606F\u70B9\uFF1A"), selected.restSpot), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "jb-primary",
        onClick: () => navigate(`/venues/${selected.id}`)
      },
      "\u67E5\u770B\u573A\u9986\u8BE6\u60C5"
    )), /* @__PURE__ */ React.createElement("div", { className: "jb-section-heading" }, /* @__PURE__ */ React.createElement("h2", null, "\u573A\u9986\u4F4D\u7F6E")), /* @__PURE__ */ React.createElement("div", { className: "jb-panel" }, venues.map((v) => /* @__PURE__ */ React.createElement(
      Row,
      {
        key: v.id,
        icon: "map",
        title: v.name,
        subtitle: v.location,
        onClick: () => navigate(`/venues/${v.id}`)
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "jb-section-heading" }, /* @__PURE__ */ React.createElement("h2", null, "\u670D\u52A1\u70B9")), /* @__PURE__ */ React.createElement("div", { className: "jb-panel" }, /* @__PURE__ */ React.createElement(
      Row,
      {
        icon: "bag",
        title: "\u4E1C\u95E8\u6E38\u5BA2\u4E2D\u5FC3 \xB7 \u6781\u5730\u9986\u670D\u52A1\u53F0",
        subtitle: "\u611F\u5B98\u53CB\u597D\u4E66\u5305\u9886\u53D6\u4E0E\u5F52\u8FD8",
        onClick: () => navigate("/backpack")
      }
    )));
  }
  function Shows() {
    const navigate = useNavigate();
    return /* @__PURE__ */ React.createElement(Page, { title: "\u4ECA\u65E5\u6F14\u51FA" }, /* @__PURE__ */ React.createElement("p", { className: "jb-intro" }, "\u63D0\u524D\u5B89\u6392\uFF0C\u7ED9\u81EA\u5DF1\u7559\u4E00\u70B9\u4ECE\u5BB9\u7684\u65F6\u95F4\u3002"), /* @__PURE__ */ React.createElement("div", { className: "jb-panel" }, shows.map((show) => /* @__PURE__ */ React.createElement(
      Row,
      {
        key: show.name,
        icon: "clock",
        title: show.name,
        subtitle: `${show.time} \xB7 ${show.place}`,
        onClick: () => navigate(
          `/venues/${venues.find((v) => v.name === show.place)?.id || "beluga"}`
        )
      }
    ))), /* @__PURE__ */ React.createElement("p", { className: "jb-map-note" }, "\u65F6\u95F4\u4E3A\u6F14\u793A\u573A\u6B21\uFF0C\u5B9E\u9645\u5B89\u6392\u4EE5\u56ED\u533A\u5F53\u5929\u516C\u544A\u4E3A\u51C6\u3002"));
  }
  function Help() {
    const navigate = useNavigate();
    return /* @__PURE__ */ React.createElement(Page, { title: "\u5E2E\u52A9\u4E2D\u5FC3", fallback: "/profile" }, /* @__PURE__ */ React.createElement("div", { className: "jb-helper-hero" }, /* @__PURE__ */ React.createElement("img", { src: "assets/xiaobai.png", alt: "\u5C0F\u767D" }), /* @__PURE__ */ React.createElement("h2", null, "\u6709\u9700\u8981\uFF0C\u5C31\u627E\u5C0F\u767D"), /* @__PURE__ */ React.createElement("p", null, "\u4E00\u8D77\u628A\u6E38\u56ED\u7684\u5C0F\u95EE\u9898\u7406\u6E05\u695A\u3002")), /* @__PURE__ */ React.createElement("div", { className: "jb-panel" }, /* @__PURE__ */ React.createElement(
      Row,
      {
        icon: "chat",
        title: "\u548C\u5C0F\u767D\u804A\u4E00\u804A",
        subtitle: "\u95E8\u7968\u3001\u6F14\u51FA\u4E0E\u6E38\u56ED\u670D\u52A1\u95EE\u7B54",
        onClick: () => navigate("/chat")
      }
    ), /* @__PURE__ */ React.createElement(
      Row,
      {
        icon: "bag",
        title: "\u4E66\u5305\u600E\u4E48\u9886\u53D6\u4E0E\u5F52\u8FD8\uFF1F",
        onClick: () => navigate("/backpack")
      }
    ), /* @__PURE__ */ React.createElement(
      Row,
      {
        icon: "map",
        title: "\u5728\u54EA\u91CC\u53EF\u4EE5\u5B89\u9759\u4F11\u606F\uFF1F",
        onClick: () => navigate("/map")
      }
    ), /* @__PURE__ */ React.createElement(
      Row,
      {
        icon: "book",
        title: "\u7B2C\u4E00\u6B21\u6E38\u56ED\u600E\u4E48\u51C6\u5907\uFF1F",
        onClick: () => navigate("/stories")
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "jb-info" }, /* @__PURE__ */ React.createElement("h2", null, "\u9700\u8981\u73B0\u573A\u5E2E\u52A9"), /* @__PURE__ */ React.createElement("p", null, "\u8BF7\u524D\u5F80\u6E38\u5BA2\u4E2D\u5FC3\uFF0C\u6216\u8054\u7CFB\u4F69\u6234\u5DE5\u724C\u7684\u5DE5\u4F5C\u4EBA\u5458\u3002\u9875\u9762\u91CC\u7684\u5C0F\u767D\u4E0D\u80FD\u4EE3\u66FF\u73B0\u573A\u6C42\u52A9\u3002")));
  }
  function Policy() {
    return /* @__PURE__ */ React.createElement(Page, { title: "\u4F7F\u7528\u4E0E\u9690\u79C1\u8BF4\u660E", fallback: "/profile" }, /* @__PURE__ */ React.createElement("article", { className: "jb-info" }, /* @__PURE__ */ React.createElement("h2", null, "\u5173\u4E8E\u8FD9\u4E2A\u6F14\u793A\u7248\u672C"), /* @__PURE__ */ React.createElement("p", null, "\u9CB8\u4F34\u540C\u884C\u5E2E\u52A9\u4F60\u4E86\u89E3\u573A\u9986\u3001\u51C6\u5907\u6E38\u56ED\u3002\u9875\u9762\u4E2D\u7684\u573A\u6B21\u3001\u9884\u7EA6\u548C\u7ED1\u5B9A\u7528\u4E8E\u529F\u80FD\u6F14\u793A\uFF0C\u4E0D\u4EE3\u8868\u771F\u5B9E\u8BA2\u5355\u3001\u9080\u8BF7\u6216\u73B0\u573A\u670D\u52A1\u627F\u8BFA\u3002"), /* @__PURE__ */ React.createElement("h2", null, "\u8D44\u6599\u4FDD\u5B58\u5728\u672C\u673A"), /* @__PURE__ */ React.createElement("p", null, "\u4F60\u586B\u5199\u7684\u6863\u6848\u3001\u6F14\u793A\u7ED1\u5B9A\u3001\u9884\u7EA6\u548C\u6536\u85CF\u4FDD\u5B58\u5728\u5F53\u524D\u6D4F\u89C8\u5668\u3002\u9000\u51FA\u540E\uFF0C\u518D\u6B21\u767B\u5F55\u540C\u4E00\u6F14\u793A\u8D26\u53F7\u53EF\u4EE5\u6062\u590D\uFF1B\u6E05\u9664\u6D4F\u89C8\u5668\u7F51\u7AD9\u6570\u636E\u4F1A\u79FB\u9664\u8FD9\u4E9B\u8BB0\u5F55\u3002\u8BF7\u4F7F\u7528\u793A\u4F8B\u8D44\u6599\u4F53\u9A8C\u3002"), /* @__PURE__ */ React.createElement("h2", null, "\u5C0F\u767D\u4E0E\u8BED\u97F3"), /* @__PURE__ */ React.createElement("p", null, "\u5C0F\u767D\u4F7F\u7528\u5185\u7F6E\u95EE\u7B54\u5185\u5BB9\u3002\u8BED\u97F3\u8BC6\u522B\u7531\u6D4F\u89C8\u5668\u63D0\u4F9B\uFF0C\u53EF\u80FD\u4F7F\u7528\u6D4F\u89C8\u5668\u5382\u5546\u7684\u5728\u7EBF\u670D\u52A1\uFF1B\u9700\u8981\u4F60\u4E3B\u52A8\u64CD\u4F5C\u5E76\u6388\u6743\u9EA6\u514B\u98CE\uFF0C\u4E5F\u53EF\u4EE5\u968F\u65F6\u4F7F\u7528\u6587\u5B57\u8F93\u5165\u3002"), /* @__PURE__ */ React.createElement("h2", null, "\u5916\u90E8\u8D44\u6E90"), /* @__PURE__ */ React.createElement("p", null, "\u9875\u9762\u5B57\u4F53\u53EF\u80FD\u4ECE Google Fonts \u52A0\u8F7D\u3002\u5F53\u524D\u7248\u672C\u4E0D\u63D0\u4F9B\u771F\u5B9E\u652F\u4ED8\u3001\u8DE8\u8BBE\u5907\u6863\u6848\u540C\u6B65\u6216\u7B2C\u4E09\u65B9\u95EE\u5377\u63D0\u4EA4\u3002")));
  }
  function NotFound({ type }) {
    const navigate = useNavigate();
    const title = type === "story" ? "\u6545\u4E8B\u4E0D\u5B58\u5728" : type === "venue" ? "\u573A\u9986\u4E0D\u5B58\u5728" : "\u9875\u9762\u4E0D\u5B58\u5728";
    return /* @__PURE__ */ React.createElement(Page, { title }, /* @__PURE__ */ React.createElement("div", { className: "jb-empty" }, /* @__PURE__ */ React.createElement("img", { src: "assets/xiaobai.png", alt: "\u5C0F\u767D" }), /* @__PURE__ */ React.createElement("h2", null, "\u8FD9\u4E2A\u9875\u9762\u6682\u65F6\u627E\u4E0D\u5230\u4E86"), /* @__PURE__ */ React.createElement("p", null, "\u6211\u4EEC\u56DE\u5230\u719F\u6089\u7684\u5730\u65B9\uFF0C\u7EE7\u7EED\u63A2\u7D22\u5427\u3002"), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "jb-primary",
        onClick: () => navigate(
          type === "story" ? "/stories" : type === "venue" ? "/venues" : "/main",
          { replace: true }
        )
      },
      type === "story" ? "\u8FD4\u56DE\u6545\u4E8B\u5217\u8868" : type === "venue" ? "\u8FD4\u56DE\u573A\u9986\u5217\u8868" : "\u8FD4\u56DE\u9996\u9875"
    )));
  }
  function FavoriteButton({ itemId, className = "", size = 18 }) {
    const [saved, setSaved] = useState(() => getList("favorites"));
    const { message } = useApp();
    useEffect(() => {
      const update = () => setSaved(getList("favorites"));
      window.addEventListener("jb-favorites", update);
      return () => window.removeEventListener("jb-favorites", update);
    }, []);
    const active = saved.includes(itemId);
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        className: `fav-btn ${active ? "faved" : ""} ${className}`,
        "aria-label": active ? "\u53D6\u6D88\u6536\u85CF" : "\u6536\u85CF",
        "aria-pressed": active,
        onClick: (e) => {
          e.stopPropagation();
          const current = getList("favorites");
          const next = current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId];
          try {
            localStorage.setItem("favorites", JSON.stringify(next));
            setSaved(next);
            window.dispatchEvent(new Event("jb-favorites"));
          } catch {
            message.error("\u6536\u85CF\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5");
          }
        }
      },
      /* @__PURE__ */ React.createElement(
        "svg",
        {
          width: size,
          height: size,
          viewBox: "0 0 24 24",
          fill: active ? "currentColor" : "none",
          stroke: "currentColor",
          strokeWidth: "1.8",
          "aria-hidden": "true"
        },
        /* @__PURE__ */ React.createElement("path", { d: paths.heart })
      )
    );
  }
  return {
    ...state_exports,
    Profile,
    Guide,
    Shows,
    Help,
    Policy,
    Favorites,
    NotFound,
    FavoriteButton,
    Header
  };
}
export {
  createEnhancements
};
