function bH() {
  const e = ["日", "一", "二", "三", "四", "五", "六"];
  return Array.from({ length: 7 }, (t, r) => {
    const a = new Date(Date.now() + r * 864e5),
      l = r === 0 ? "今天" : r === 1 ? "明天" : `周${e[a.getDay()]}`;
    return {
      value: WhaleUI.localDate(a),
      label: l,
      sub: `${a.getMonth() + 1}/${a.getDate()}`,
    };
  });
}
