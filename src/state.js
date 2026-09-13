// Demo data stays on this browser. Active keys are kept compatible with the legacy UI.
export const activeKeys = [
  "userProfile",
  "profileCompleted",
  "bindings",
  "backpackBooking",
  "favorites",
];
export const emptyProfile = {
  avatar: "",
  name: "",
  gender: "",
  birthday: "",
  region: "",
  relation: "",
  emergencyPhone: "",
  sensory: [],
  interests: [],
  advice: "",
};

export function readJSON(key, fallback, storage = localStorage) {
  try {
    const value = JSON.parse(storage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}
export function getProfile(storage = localStorage) {
  const value = readJSON("userProfile", {}, storage);
  const result = { ...emptyProfile };
  for (const key of Object.keys(result)) {
    if (Array.isArray(result[key]))
      result[key] = Array.isArray(value[key])
        ? value[key].filter((x) => typeof x === "string")
        : [];
    else result[key] = typeof value[key] === "string" ? value[key] : "";
  }
  return result;
}
export function getList(key, storage = localStorage) {
  const value = readJSON(key, [], storage);
  return Array.isArray(value) ? value : [];
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function ageAt(birthday, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday) || birthday > localDate(today))
    return null;
  const [year, month, day] = birthday.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  if (parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return null;
  let age = today.getFullYear() - year;
  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  )
    age--;
  return age >= 0 && age < 130 ? age : null;
}
export function profileError(profile, today = new Date()) {
  if (!profile.name.trim()) return "请填写姓名";
  if (profile.name.trim().length > 30) return "姓名请控制在 30 个字以内";
  if (profile.birthday && ageAt(profile.birthday, today) === null)
    return "请填写有效的出生日期，不能晚于今天";
  if (profile.emergencyPhone && !/^1\d{10}$/.test(profile.emergencyPhone))
    return "请填写正确的 11 位紧急联系电话";
  return "";
}
export function bindingError({ name, phone, relation }, bindings, ownPhone) {
  if (!name.trim()) return "请填写对方姓名";
  if (!/^1\d{10}$/.test(phone)) return "请填写正确的 11 位手机号";
  if (phone === ownPhone) return "不能绑定自己的账号";
  if (bindings.some((item) => item.phone === phone))
    return "该账号已添加，请勿重复绑定";
  if (!relation) return "请选择关系";
  return "";
}
function saveActive(storage) {
  const phone = storage.getItem("userPhone");
  if (!phone) return;
  const snapshot = Object.fromEntries(
    activeKeys.map((key) => [key, storage.getItem(key)]),
  );
  // accountRole is stable while the landing page changes userRole during role selection.
  const role =
    storage.getItem("accountRole") ||
    storage.getItem("userRole") ||
    "xinqingnian";
  storage.setItem(`jb-account:${phone}:${role}`, JSON.stringify(snapshot));
}
export function signIn(phone, role, storage = localStorage) {
  const previousRole =
    storage.getItem("accountRole") || storage.getItem("userRole");
  const identityChanged =
    storage.getItem("userPhone") !== phone || previousRole !== role;
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
export function signOut(storage = localStorage) {
  saveActive(storage);
  for (const key of [...activeKeys, "userPhone", "userRole", "accountRole"])
    storage.removeItem(key);
  // Conversations are transient and should not appear under a different account.
  globalThis.sessionStorage?.removeItem("jb-chat");
  globalThis.sessionStorage?.removeItem("jb-call-summary");
}
export function bookingValid(booking) {
  return (
    booking &&
    typeof booking.code === "string" &&
    /^BP\d+$/.test(booking.code) &&
    typeof booking.point === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(booking.date) &&
    Number.isInteger(booking.count) &&
    booking.count >= 1 &&
    booking.count <= 3
  );
}
export function safeBack(navigate, fallback = "/main") {
  if (window.history.state?.idx > 0) navigate(-1);
  else navigate(fallback, { replace: true });
}
export function nextShow(shows, now = new Date()) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return (
    shows
      .flatMap((show) =>
        show.time.split(" / ").map((time) => {
          const [h, m] = time.split(":").map(Number);
          return { ...show, time, remaining: h * 60 + m - minutes };
        }),
      )
      .filter((show) => show.remaining >= 0)
      .sort((a, b) => a.remaining - b.remaining)[0] || null
  );
}
export async function avatarData(file) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw new Error("请选择 PNG、JPG 或 WebP 图片");
  if (file.size > 5 * 1024 * 1024) throw new Error("图片不能超过 5MB");
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const side = Math.min(bitmap.width, bitmap.height);
  canvas
    .getContext("2d")
    .drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      256,
      256,
    );
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
