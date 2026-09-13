function EH() {
  const e = Mr(),
    [params, setParams] = Y0(),
    t = params.get("q") || "",
    a = CH.includes(params.get("category")) ? params.get("category") : "全部",
    r = (value) =>
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          value ? next.set("q", value) : next.delete("q");
          return next;
        },
        { replace: true },
      ),
    l = (value) =>
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          value === "全部"
            ? next.delete("category")
            : next.set("category", value);
          return next;
        },
        { replace: true },
      ),
    i = d.useMemo(
      () =>
        H0.filter(
          (f) =>
            (a === "全部" || f.category === a) &&
            (!t.trim() ||
              f.title.includes(t.trim()) ||
              f.scene.includes(t.trim())),
        ),
      [t, a],
    ),
    u = !t.trim() && a === "全部" ? H0.filter((f) => $H.includes(f.id)) : [];
  return v.jsxs(Rr, {
    "code-path": "src\\pages\\Stories.tsx:24:5",
    variant: "gray",
    className: "list-page",
    children: [
      v.jsx(oo, { "code-path": "src\\pages\\Stories.tsx:25:7", dark: !0 }),
      v.jsx(Bl, {
        "code-path": "src\\pages\\Stories.tsx:26:7",
        title: "社交故事",
        dark: !0,
      }),
      v.jsxs("div", {
        "code-path": "src\\pages\\Stories.tsx:27:7",
        className: "list-body",
        children: [
          v.jsxs("div", {
            "code-path": "src\\pages\\Stories.tsx:28:9",
            className: "list-search",
            children: [
              v.jsxs("svg", {
                "code-path": "src\\pages\\Stories.tsx:29:11",
                width: "16",
                height: "16",
                viewBox: "0 0 24 24",
                fill: "none",
                children: [
                  v.jsx("circle", {
                    "code-path": "src\\pages\\Stories.tsx:29:71",
                    cx: "11",
                    cy: "11",
                    r: "7",
                    stroke: "#AEBCCD",
                    strokeWidth: "2",
                  }),
                  v.jsx("path", {
                    "code-path": "src\\pages\\Stories.tsx:29:136",
                    d: "M20 20l-3.5-3.5",
                    stroke: "#AEBCCD",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                  }),
                ],
              }),
              v.jsx("input", {
                "code-path": "src\\pages\\Stories.tsx:30:11",
                placeholder: "搜索故事，如：洗手间、表演…",
                value: t,
                onChange: (f) => r(f.target.value),
              }),
            ],
          }),
          v.jsx("div", {
            "code-path": "src\\pages\\Stories.tsx:32:9",
            className: "list-chips",
            children: CH.map((f) =>
              v.jsx(
                "button",
                {
                  "code-path": "src\\pages\\Stories.tsx:34:13",
                  className: `list-chip ${a === f ? "active" : ""}`,
                  onClick: () => l(f),
                  children: f,
                },
                f,
              ),
            ),
          }),
          v.jsx("div", {
            "code-path": "src\\pages\\Stories.tsx:39:9",
            className: "sec-title",
            style: { display: u.length ? undefined : "none" },
            children: "推荐",
          }),
          v.jsx("div", {
            "code-path": "src\\pages\\Stories.tsx:40:9",
            className: "feat-row",
            style: { display: u.length ? undefined : "none" },
            children: u.map((f) =>
              v.jsxs(
                "div",
                {
                  "code-path": "src\\pages\\Stories.tsx:42:13",
                  className: "feat-card",
                  onClick: () => e(`/stories/${f.id}`),
                  role: "link",
                  tabIndex: 0,
                  onKeyDown: (event) => {
                    if (
                      event.key === "Enter" &&
                      event.target === event.currentTarget
                    )
                      e(`/stories/${f.id}`);
                  },
                  children: [
                    v.jsx("img", {
                      "code-path": "src\\pages\\Stories.tsx:43:15",
                      src: f.img,
                      alt: "",
                    }),
                    v.jsx("div", {
                      "code-path": "src\\pages\\Stories.tsx:44:15",
                      className: "feat-shade",
                    }),
                    v.jsx("span", {
                      "code-path": "src\\pages\\Stories.tsx:45:15",
                      className: "feat-pill",
                      children: f.category,
                    }),
                    v.jsx(Hf, {
                      itemId: `story:${f.id}`,
                      "code-path": "src\\pages\\Stories.tsx:46:15",
                      className: "feat-fav",
                    }),
                    v.jsxs("div", {
                      "code-path": "src\\pages\\Stories.tsx:47:15",
                      className: "feat-cap",
                      children: [
                        v.jsx("div", {
                          "code-path": "src\\pages\\Stories.tsx:48:17",
                          className: "feat-title",
                          children: f.title,
                        }),
                        v.jsxs("div", {
                          "code-path": "src\\pages\\Stories.tsx:49:17",
                          className: "feat-meta",
                          children: [f.scene, " · ", f.duration],
                        }),
                      ],
                    }),
                  ],
                },
                f.id,
              ),
            ),
          }),
          v.jsxs("div", {
            "code-path": "src\\pages\\Stories.tsx:55:9",
            className: "list-cards",
            children: [
              i.map((f) =>
                v.jsxs(
                  "div",
                  {
                    "code-path": "src\\pages\\Stories.tsx:57:13",
                    className: "list-card",
                    onClick: () => e(`/stories/${f.id}`),
                    role: "link",
                    tabIndex: 0,
                    onKeyDown: (event) => {
                      if (
                        event.key === "Enter" &&
                        event.target === event.currentTarget
                      )
                        e(`/stories/${f.id}`);
                    },
                    children: [
                      v.jsx("img", {
                        "code-path": "src\\pages\\Stories.tsx:58:15",
                        className: "list-photo",
                        src: f.img,
                        alt: "",
                      }),
                      v.jsxs("div", {
                        "code-path": "src\\pages\\Stories.tsx:59:15",
                        className: "list-info",
                        children: [
                          v.jsx("div", {
                            "code-path": "src\\pages\\Stories.tsx:60:17",
                            className: "list-title",
                            children: f.title,
                          }),
                          v.jsxs("div", {
                            "code-path": "src\\pages\\Stories.tsx:61:17",
                            className: "list-sub",
                            children: [
                              v.jsx(Hy, {
                                "code-path": "src\\pages\\Stories.tsx:61:43",
                                size: 13,
                                strokeWidth: 1.8,
                              }),
                              f.scene,
                            ],
                          }),
                          v.jsxs("div", {
                            "code-path": "src\\pages\\Stories.tsx:62:17",
                            className: "list-meta",
                            children: [
                              v.jsxs("span", {
                                "code-path": "src\\pages\\Stories.tsx:63:19",
                                className: "list-rate",
                                children: [
                                  v.jsx(KN, {
                                    "code-path":
                                      "src\\pages\\Stories.tsx:63:47",
                                    size: 13,
                                    strokeWidth: 1.8,
                                  }),
                                  f.duration,
                                ],
                              }),
                              v.jsxs("span", {
                                "code-path": "src\\pages\\Stories.tsx:64:19",
                                className: "list-tag",
                                children: [f.steps.length, " 个场景"],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  },
                  f.id,
                ),
              ),
              i.length === 0 &&
                v.jsxs("div", {
                  "code-path": "src\\pages\\Stories.tsx:70:13",
                  className: "list-empty",
                  children: [
                    v.jsx("img", {
                      "code-path": "src\\pages\\Stories.tsx:71:15",
                      src: "assets/xiaobai.png",
                      className: "list-empty-mascot",
                      alt: "",
                    }),
                    v.jsx("div", {
                      "code-path": "src\\pages\\Stories.tsx:72:15",
                      children: "没有找到相关故事，换个关键词试试～",
                    }),
                  ],
                }),
            ],
          }),
        ],
      }),
    ],
  });
}
