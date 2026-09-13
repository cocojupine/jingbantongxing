function jH() {
  const { id: e } = e$(),
    t = Mr(),
    r = I0.find((a) => a.id === e);
  return r
    ? v.jsxs(Rr, {
        "code-path": "src\\pages\\VenueDetail.tsx:38:5",
        variant: "gray",
        className: "list-page",
        children: [
          v.jsx(oo, {
            "code-path": "src\\pages\\VenueDetail.tsx:39:7",
            dark: !0,
          }),
          v.jsxs("div", {
            "code-path": "src\\pages\\VenueDetail.tsx:40:7",
            className: "list-body",
            children: [
              v.jsxs("div", {
                "code-path": "src\\pages\\VenueDetail.tsx:42:9",
                className: "d-hero tall",
                children: [
                  v.jsx("img", {
                    "code-path": "src\\pages\\VenueDetail.tsx:43:11",
                    src: r.img,
                    alt: "",
                  }),
                  v.jsx("div", {
                    "code-path": "src\\pages\\VenueDetail.tsx:44:11",
                    className: "d-hero-shade",
                  }),
                  v.jsx("button", {
                    "code-path": "src\\pages\\VenueDetail.tsx:45:11",
                    className: "d-back",
                    onClick: () => WhaleUI.safeBack(t, "/venues"),
                    "aria-label": "返回场馆列表",
                    children: v.jsx("svg", {
                      "code-path": "src\\pages\\VenueDetail.tsx:46:13",
                      width: "22",
                      height: "22",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      children: v.jsx("path", {
                        "code-path": "src\\pages\\VenueDetail.tsx:47:15",
                        d: "M15 18l-6-6 6-6",
                        stroke: "currentColor",
                        strokeWidth: "2",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                      }),
                    }),
                  }),
                  v.jsx(Hf, {
                    itemId: `venue:${r.id}`,
                    "code-path": "src\\pages\\VenueDetail.tsx:50:11",
                    className: "d-fav",
                    size: 20,
                  }),
                  v.jsxs("div", {
                    "code-path": "src\\pages\\VenueDetail.tsx:51:11",
                    className: "d-hero-cap",
                    children: [
                      v.jsx("div", {
                        "code-path": "src\\pages\\VenueDetail.tsx:52:13",
                        className: "d-hero-title",
                        children: r.name,
                      }),
                      v.jsxs("div", {
                        "code-path": "src\\pages\\VenueDetail.tsx:53:13",
                        className: "d-hero-meta",
                        children: [
                          v.jsxs("span", {
                            "code-path": "src\\pages\\VenueDetail.tsx:54:15",
                            className: "d-hero-meta-item",
                            children: [
                              v.jsx(Iy, {
                                "code-path":
                                  "src\\pages\\VenueDetail.tsx:54:50",
                                size: 13,
                                strokeWidth: 1.8,
                              }),
                              " ",
                              r.location,
                            ],
                          }),
                          v.jsxs("span", {
                            "code-path": "src\\pages\\VenueDetail.tsx:55:15",
                            className: "d-hero-meta-item",
                            children: [
                              v.jsx(A0, {
                                "code-path":
                                  "src\\pages\\VenueDetail.tsx:55:50",
                                size: 13,
                                strokeWidth: 1.8,
                                fill: "currentColor",
                              }),
                              " ",
                              r.rating.toFixed(1),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              v.jsx("div", {
                "code-path": "src\\pages\\VenueDetail.tsx:61:9",
                className: "sec-title",
                children: "简介",
              }),
              v.jsx("p", {
                "code-path": "src\\pages\\VenueDetail.tsx:62:9",
                className: "d-overview",
                children: r.intro,
              }),
              r.gallery &&
                v.jsxs(v.Fragment, {
                  children: [
                    v.jsx("div", {
                      "code-path": "src\\pages\\VenueDetail.tsx:67:13",
                      className: "sec-title",
                      children: "图集",
                    }),
                    v.jsx("div", {
                      "code-path": "src\\pages\\VenueDetail.tsx:68:13",
                      className: "gallery-row",
                      children: r.gallery.map((a, l) => {
                        const i = false;
                        return v.jsxs(
                          "div",
                          {
                            "code-path": "src\\pages\\VenueDetail.tsx:72:19",
                            className: "gallery-thumb",
                            children: [
                              v.jsx("img", {
                                "code-path":
                                  "src\\pages\\VenueDetail.tsx:73:21",
                                src: a,
                                alt: "",
                              }),
                              i &&
                                v.jsx("span", {
                                  "code-path":
                                    "src\\pages\\VenueDetail.tsx:74:32",
                                  className: "gallery-more",
                                  children: "6+",
                                }),
                            ],
                          },
                          l,
                        );
                      }),
                    }),
                  ],
                }),
              v.jsxs("div", {
                "code-path": "src\\pages\\VenueDetail.tsx:82:9",
                className: "card",
                children: [
                  v.jsx("div", {
                    "code-path": "src\\pages\\VenueDetail.tsx:83:11",
                    className: "card-title",
                    children: "感官刺激指数",
                  }),
                  v.jsx(qh, {
                    "code-path": "src\\pages\\VenueDetail.tsx:84:11",
                    label: "声音",
                    icon: v.jsx(rR, {
                      "code-path": "src\\pages\\VenueDetail.tsx:84:37",
                      size: 16,
                      strokeWidth: 1.8,
                    }),
                    value: r.sound,
                  }),
                  v.jsx(qh, {
                    "code-path": "src\\pages\\VenueDetail.tsx:85:11",
                    label: "灯光",
                    icon: v.jsx(j_, {
                      "code-path": "src\\pages\\VenueDetail.tsx:85:37",
                      size: 16,
                      strokeWidth: 1.8,
                    }),
                    value: r.light,
                  }),
                  v.jsx(qh, {
                    "code-path": "src\\pages\\VenueDetail.tsx:86:11",
                    label: "拥挤",
                    icon: v.jsx(Vy, {
                      "code-path": "src\\pages\\VenueDetail.tsx:86:37",
                      size: 16,
                      strokeWidth: 1.8,
                    }),
                    value: r.crowd,
                  }),
                  v.jsx("div", {
                    "code-path": "src\\pages\\VenueDetail.tsx:87:11",
                    className: "stim-tip",
                    children:
                      r.sound >= 4
                        ? "⚠️ 声音较响，建议佩戴降噪耳机"
                        : r.sound <= 2
                          ? "🌿 环境安静舒缓，适合慢慢参观"
                          : "🙂 声音适中，大部分孩子可轻松适应",
                  }),
                ],
              }),
              r.shows &&
                v.jsxs("div", {
                  "code-path": "src\\pages\\VenueDetail.tsx:97:11",
                  className: "card",
                  children: [
                    v.jsx("div", {
                      "code-path": "src\\pages\\VenueDetail.tsx:98:13",
                      className: "card-title",
                      children: "演出时间",
                    }),
                    v.jsxs("div", {
                      "code-path": "src\\pages\\VenueDetail.tsx:99:13",
                      className: "venue-shows",
                      children: [
                        v.jsx(KN, {
                          "code-path": "src\\pages\\VenueDetail.tsx:99:42",
                          size: 15,
                          strokeWidth: 1.8,
                        }),
                        " ",
                        r.shows,
                        v.jsx("span", {
                          "code-path": "src\\pages\\VenueDetail.tsx:99:93",
                          className: "venue-shows-hint",
                          children: "开场前 30 分钟入场",
                        }),
                      ],
                    }),
                  ],
                }),
              v.jsxs("div", {
                "code-path": "src\\pages\\VenueDetail.tsx:103:9",
                className: "card",
                children: [
                  v.jsx("div", {
                    "code-path": "src\\pages\\VenueDetail.tsx:104:11",
                    className: "card-title",
                    children: "贴心设施",
                  }),
                  v.jsx("div", {
                    "code-path": "src\\pages\\VenueDetail.tsx:105:11",
                    className: "tag-options",
                    style: { marginBottom: 14 },
                    children: r.facilities.map((a) =>
                      v.jsx(
                        "span",
                        {
                          "code-path": "src\\pages\\VenueDetail.tsx:106:42",
                          className: "tag-option active",
                          style: { cursor: "default" },
                          children: a,
                        },
                        a,
                      ),
                    ),
                  }),
                  v.jsxs("div", {
                    "code-path": "src\\pages\\VenueDetail.tsx:108:11",
                    className: "venue-rest",
                    children: [
                      v.jsx("span", {
                        "code-path": "src\\pages\\VenueDetail.tsx:109:13",
                        className: "tips-icon",
                        children: v.jsx(ky, {
                          "code-path": "src\\pages\\VenueDetail.tsx:109:41",
                          size: 16,
                          strokeWidth: 1.8,
                        }),
                      }),
                      v.jsxs("div", {
                        "code-path": "src\\pages\\VenueDetail.tsx:110:13",
                        children: [
                          v.jsx("div", {
                            "code-path": "src\\pages\\VenueDetail.tsx:111:15",
                            style: {
                              fontWeight: 600,
                              color: "var(--ink-900)",
                              fontSize: 13,
                            },
                            children: "最近的安静休息室",
                          }),
                          v.jsx("div", {
                            "code-path": "src\\pages\\VenueDetail.tsx:112:15",
                            style: {
                              fontSize: 12,
                              color: "var(--ink-400)",
                              marginTop: 3,
                            },
                            children: r.restSpot,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              v.jsx("div", {
                "code-path": "src\\pages\\VenueDetail.tsx:116:9",
                style: { height: 12 },
              }),
            ],
          }),
          v.jsx("div", {
            "code-path": "src\\pages\\VenueDetail.tsx:120:7",
            className: "d-cta-bar",
            children: v.jsxs("button", {
              "code-path": "src\\pages\\VenueDetail.tsx:121:9",
              className: "d-cta",
              onClick: () => t(`/map?venue=${r.id}`),
              children: [
                v.jsx(F_, {
                  "code-path": "src\\pages\\VenueDetail.tsx:122:11",
                  size: 18,
                  strokeWidth: 1.8,
                }),
                " 查看位置指引",
              ],
            }),
          }),
        ],
      })
    : v.jsx(WhaleUI.NotFound, { type: "venue" });
}
