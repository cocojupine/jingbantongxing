function OH() {
  const e = Mr(),
    [params, setParams] = Y0(),
    t = params.get("q") || "",
    a = AH.includes(params.get("category")) ? params.get("category") : "全部",
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
        I0.filter(
          (f) =>
            (a === "全部" || f.category === a) &&
            (!t.trim() ||
              f.name.includes(t.trim()) ||
              f.location.includes(t.trim())),
        ),
      [t, a],
    ),
    u = !t.trim() && a === "全部" ? I0.filter((f) => zH.includes(f.id)) : [];
  return v.jsxs(Rr, {
    "code-path": "src\\pages\\Venues.tsx:24:5",
    variant: "gray",
    className: "list-page",
    children: [
      v.jsx(oo, { "code-path": "src\\pages\\Venues.tsx:25:7", dark: !0 }),
      v.jsx(Bl, {
        "code-path": "src\\pages\\Venues.tsx:26:7",
        title: "场馆",
        dark: !0,
      }),
      v.jsxs("div", {
        "code-path": "src\\pages\\Venues.tsx:27:7",
        className: "list-body",
        children: [
          v.jsxs("div", {
            "code-path": "src\\pages\\Venues.tsx:28:9",
            className: "list-search",
            children: [
              v.jsxs("svg", {
                "code-path": "src\\pages\\Venues.tsx:29:11",
                width: "16",
                height: "16",
                viewBox: "0 0 24 24",
                fill: "none",
                children: [
                  v.jsx("circle", {
                    "code-path": "src\\pages\\Venues.tsx:29:71",
                    cx: "11",
                    cy: "11",
                    r: "7",
                    stroke: "#AEBCCD",
                    strokeWidth: "2",
                  }),
                  v.jsx("path", {
                    "code-path": "src\\pages\\Venues.tsx:29:136",
                    d: "M20 20l-3.5-3.5",
                    stroke: "#AEBCCD",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                  }),
                ],
              }),
              v.jsx("input", {
                "code-path": "src\\pages\\Venues.tsx:30:11",
                placeholder: "搜索场馆，如：白鲸、水母…",
                value: t,
                onChange: (f) => r(f.target.value),
              }),
            ],
          }),
          v.jsx("div", {
            "code-path": "src\\pages\\Venues.tsx:32:9",
            className: "list-chips",
            children: AH.map((f) =>
              v.jsx(
                "button",
                {
                  "code-path": "src\\pages\\Venues.tsx:34:13",
                  className: `list-chip ${a === f ? "active" : ""}`,
                  onClick: () => l(f),
                  children: f,
                },
                f,
              ),
            ),
          }),
          v.jsx("div", {
            "code-path": "src\\pages\\Venues.tsx:39:9",
            className: "sec-title",
            style: { display: u.length ? undefined : "none" },
            children: "热门场馆",
          }),
          v.jsx("div", {
            "code-path": "src\\pages\\Venues.tsx:40:9",
            className: "feat-row",
            style: { display: u.length ? undefined : "none" },
            children: u.map((f) =>
              v.jsxs(
                "div",
                {
                  "code-path": "src\\pages\\Venues.tsx:42:13",
                  className: "feat-card",
                  onClick: () => e(`/venues/${f.id}`),
                  role: "link",
                  tabIndex: 0,
                  onKeyDown: (event) => {
                    if (
                      event.key === "Enter" &&
                      event.target === event.currentTarget
                    )
                      e(`/venues/${f.id}`);
                  },
                  children: [
                    v.jsx("img", {
                      "code-path": "src\\pages\\Venues.tsx:43:15",
                      src: f.img,
                      alt: "",
                    }),
                    v.jsx("div", {
                      "code-path": "src\\pages\\Venues.tsx:44:15",
                      className: "feat-shade",
                    }),
                    v.jsx("span", {
                      "code-path": "src\\pages\\Venues.tsx:45:15",
                      className: "feat-pill",
                      children: f.category,
                    }),
                    v.jsx(Hf, {
                      itemId: `venue:${f.id}`,
                      "code-path": "src\\pages\\Venues.tsx:46:15",
                      className: "feat-fav",
                    }),
                    v.jsxs("div", {
                      "code-path": "src\\pages\\Venues.tsx:47:15",
                      className: "feat-cap",
                      children: [
                        v.jsx("div", {
                          "code-path": "src\\pages\\Venues.tsx:48:17",
                          className: "feat-title",
                          children: f.name,
                        }),
                        v.jsxs("div", {
                          "code-path": "src\\pages\\Venues.tsx:49:17",
                          className: "feat-meta",
                          children: [
                            v.jsx(A0, {
                              "code-path": "src\\pages\\Venues.tsx:50:19",
                              size: 12,
                              strokeWidth: 1.8,
                              fill: "currentColor",
                            }),
                            " ",
                            f.rating.toFixed(1),
                            " · ",
                            f.location,
                          ],
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
            "code-path": "src\\pages\\Venues.tsx:57:9",
            className: "list-cards",
            children: [
              i.map((f) =>
                v.jsxs(
                  "div",
                  {
                    "code-path": "src\\pages\\Venues.tsx:59:13",
                    className: "list-card",
                    onClick: () => e(`/venues/${f.id}`),
                    role: "link",
                    tabIndex: 0,
                    onKeyDown: (event) => {
                      if (
                        event.key === "Enter" &&
                        event.target === event.currentTarget
                      )
                        e(`/venues/${f.id}`);
                    },
                    children: [
                      v.jsx("img", {
                        "code-path": "src\\pages\\Venues.tsx:60:15",
                        className: "list-photo",
                        src: f.img,
                        alt: "",
                      }),
                      v.jsxs("div", {
                        "code-path": "src\\pages\\Venues.tsx:61:15",
                        className: "list-info",
                        children: [
                          v.jsx("div", {
                            "code-path": "src\\pages\\Venues.tsx:62:17",
                            className: "list-title",
                            children: f.name,
                          }),
                          v.jsxs("div", {
                            "code-path": "src\\pages\\Venues.tsx:63:17",
                            className: "list-sub",
                            children: [
                              v.jsx(Iy, {
                                "code-path": "src\\pages\\Venues.tsx:63:43",
                                size: 13,
                                strokeWidth: 1.8,
                              }),
                              f.location,
                            ],
                          }),
                          v.jsxs("div", {
                            "code-path": "src\\pages\\Venues.tsx:64:17",
                            className: "list-meta",
                            children: [
                              v.jsxs("span", {
                                "code-path": "src\\pages\\Venues.tsx:65:19",
                                className: "list-rate",
                                children: [
                                  v.jsx(A0, {
                                    "code-path": "src\\pages\\Venues.tsx:65:47",
                                    size: 13,
                                    strokeWidth: 1.8,
                                  }),
                                  f.rating.toFixed(1),
                                  "/5",
                                ],
                              }),
                              v.jsx("span", {
                                "code-path": "src\\pages\\Venues.tsx:66:19",
                                className: "list-tag",
                                children: f.category,
                              }),
                              f.sound <= 2 &&
                                v.jsx("span", {
                                  "code-path": "src\\pages\\Venues.tsx:67:36",
                                  className: "list-tag calm",
                                  children: "低刺激",
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
                  "code-path": "src\\pages\\Venues.tsx:73:13",
                  className: "list-empty",
                  children: [
                    v.jsx("img", {
                      "code-path": "src\\pages\\Venues.tsx:74:15",
                      src: "assets/xiaobai.png",
                      className: "list-empty-mascot",
                      alt: "",
                    }),
                    v.jsx("div", {
                      "code-path": "src\\pages\\Venues.tsx:75:15",
                      children: "没有找到相关场馆，换个关键词试试～",
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
