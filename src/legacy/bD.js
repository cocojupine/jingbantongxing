function bD() {
  try {
    return JSON.parse(localStorage.getItem("bindings") ?? "[]");
  } catch {
    return [];
  }
}
