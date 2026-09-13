import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getProfile,
  emptyProfile,
  getList,
  localDate,
  ageAt,
  profileError,
  bindingError,
  signIn,
  signOut,
  bookingValid,
  nextShow,
  safeBack,
} from "../src/state.js";

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}
test("bad saved profile types do not crash the editable form", () => {
  const storage = memoryStorage({
    userProfile: JSON.stringify({ name: 4, sensory: null, interests: "whale" }),
  });
  assert.deepEqual(getProfile(storage), emptyProfile);
  storage.setItem("userProfile", "{broken");
  assert.deepEqual(getProfile(storage), emptyProfile);
  storage.setItem("favorites", "{}");
  assert.deepEqual(getList("favorites", storage), []);
});
test("calendar dates use the local calendar, including early morning", () => {
  assert.equal(localDate(new Date(2026, 8, 13, 0, 15)), "2026-09-13");
  assert.equal(localDate(new Date(2026, 0, 1, 0, 0)), "2026-01-01");
});
test("age handles the birthday boundary and invalid dates", () => {
  assert.equal(ageAt("2016-09-14", new Date(2026, 8, 13)), 9);
  assert.equal(ageAt("2016-09-13", new Date(2026, 8, 13)), 10);
  assert.equal(ageAt("2027-01-01", new Date(2026, 8, 13)), null);
  assert.equal(ageAt("2026-02-31", new Date(2026, 8, 13)), null);
});
test("profile rejects blank names, future dates and bad emergency contacts", () => {
  assert.match(profileError({ ...emptyProfile, name: " " }), /姓名/);
  assert.match(
    profileError({ ...emptyProfile, name: "小鲸", birthday: "2099-01-01" }),
    /出生日期/,
  );
  assert.match(
    profileError({ ...emptyProfile, name: "小鲸", emergencyPhone: "123" }),
    /联系电话/,
  );
  assert.equal(
    profileError({
      ...emptyProfile,
      name: "小鲸",
      emergencyPhone: "13000000001",
    }),
    "",
  );
});
test("bindings reject self and duplicate accounts", () => {
  const input = { name: "家人", phone: "13000000001", relation: "妈妈" };
  assert.match(bindingError(input, [], input.phone), /自己/);
  assert.match(bindingError(input, [input], "13000000002"), /重复/);
  assert.equal(bindingError(input, [], "13000000002"), "");
});
test("switching demo accounts isolates all active data and restores the original", () => {
  const storage = memoryStorage();
  signIn("13000000001", "parent", storage);
  storage.setItem("userProfile", JSON.stringify({ name: "账号 A" }));
  storage.setItem("favorites", '["venue:beluga"]');
  storage.setItem("backpackBooking", '{"code":"BP123456"}');
  signIn("13000000002", "xinqingnian", storage);
  assert.equal(storage.getItem("userProfile"), null);
  assert.equal(storage.getItem("favorites"), null);
  assert.equal(storage.getItem("backpackBooking"), null);
  signIn("13000000001", "parent", storage);
  assert.equal(getProfile(storage).name, "账号 A");
  assert.deepEqual(getList("favorites", storage), ["venue:beluga"]);
});
test("role selection does not move a signed-in profile to a different role", () => {
  const storage = memoryStorage();
  signIn("13000000001", "parent", storage);
  storage.setItem("userProfile", JSON.stringify({ name: "家长档案" }));
  storage.setItem("userRole", "xinqingnian");
  signIn("13000000001", "xinqingnian", storage);
  assert.equal(storage.getItem("userProfile"), null);
  signIn("13000000001", "parent", storage);
  assert.equal(getProfile(storage).name, "家长档案");
});
test("logout clears active identity without deleting saved account data", () => {
  const storage = memoryStorage();
  signIn("13000000001", "parent", storage);
  storage.setItem("userProfile", JSON.stringify({ name: "已保存档案" }));
  signOut(storage);
  assert.equal(storage.getItem("userPhone"), null);
  assert.equal(storage.getItem("userRole"), null);
  assert.equal(storage.getItem("userProfile"), null);
  signIn("13000000001", "parent", storage);
  assert.equal(getProfile(storage).name, "已保存档案");
});
test("booking validation rejects corrupt or impossible quantities", () => {
  const valid = {
    code: "BP123456",
    point: "东门游客中心",
    date: "2026-09-13",
    count: 1,
  };
  assert.equal(bookingValid(valid), true);
  assert.equal(Boolean(bookingValid(null)), false);
  assert.equal(bookingValid({ ...valid, count: 4 }), false);
  assert.equal(bookingValid({ ...valid, code: 42 }), false);
});
test("upcoming performance is the nearest time across all venues", () => {
  const shows = [
    { name: "白鲸", time: "10:30 / 14:00" },
    { name: "海豚", time: "11:30 / 15:30" },
  ];
  assert.equal(nextShow(shows, new Date(2026, 8, 13, 11, 0)).name, "海豚");
  assert.equal(nextShow(shows, new Date(2026, 8, 13, 11, 0)).remaining, 30);
  assert.equal(nextShow(shows, new Date(2026, 8, 13, 14, 0)).remaining, 0);
  assert.equal(nextShow(shows, new Date(2026, 8, 13, 18, 0)), null);
});
test("direct entry back button stays in the app instead of leaving the tab", () => {
  let result;
  globalThis.window = { history: { state: { idx: 0 } } };
  safeBack((...args) => (result = args), "/stories");
  assert.deepEqual(result, ["/stories", { replace: true }]);
  window.history.state.idx = 2;
  safeBack((...args) => (result = args));
  assert.deepEqual(result, [-1]);
  delete globalThis.window;
});
