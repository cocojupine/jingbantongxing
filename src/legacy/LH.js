function LH() {
  const e = Mr(),
    [t, r] = Y0(),
    [a, l] = d.useState("小伙伴"),
    [i, u] = d.useState(""),
    [f, p] = d.useState(!1);
  const [clock, setClock] = d.useState(() => new Date());
  d.useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  const upcoming = WhaleUI.nextShow(j2, clock);
  d.useEffect(() => {
    const C = $c();
    (C.name && l(C.name),
      C.avatar && u(C.avatar),
      t.get("setup") === "1" && p(!0));
  }, [t]);
  const m = () => {
      (p(!1), r({}, { replace: !0 }));
      const C = $c();
      (C.name && l(C.name), C.avatar && u(C.avatar));
    },
    g = new Date().getHours(),
    x = g < 11 ? "早上好" : g < 14 ? "中午好" : g < 18 ? "下午好" : "晚上好",
    b = new Date().getHours() * 60 + new Date().getMinutes(),
    S = j2.findIndex((C) =>
      C.time.split(" / ").some((E) => {
        const [N, M] = E.split(":").map(Number);
        return N * 60 + M >= b;
      }),
    ),
    $ = (C) => {
      e(
        { ai: "/chat", me: "/profile", map: "/map", home: "/main" }[C] ||
          "/main",
      );
    };
  return v.jsxs(Rr, {
    "code-path": "src\\pages\\Main.tsx:67:5",
    variant: "gray",
    className: "main-page",
    children: [
      v.jsxs("div", {
        "code-path": "src\\pages\\Main.tsx:69:7",
        className: "main-hero",
        children: [
          v.jsx(oR, { "code-path": "src\\pages\\Main.tsx:70:9" }),
          v.jsx(oo, { "code-path": "src\\pages\\Main.tsx:71:9" }),
          v.jsxs("div", {
            "code-path": "src\\pages\\Main.tsx:72:9",
            className: "main-hero-row",
            children: [
              v.jsxs("div", {
                "code-path": "src\\pages\\Main.tsx:73:11",
                className: "main-greeting",
                children: [
                  v.jsx("div", {
                    "code-path": "src\\pages\\Main.tsx:74:13",
                    className: "hello-small",
                    children: "Hello~",
                  }),
                  v.jsxs("div", {
                    "code-path": "src\\pages\\Main.tsx:75:13",
                    className: "greet-text",
                    children: [
                      v.jsx("span", {
                        "code-path": "src\\pages\\Main.tsx:75:41",
                        className: "accent-serif",
                        children: x,
                      }),
                      "，",
                      a,
                    ],
                  }),
                  v.jsx("div", {
                    "code-path": "src\\pages\\Main.tsx:76:13",
                    className: "greet-sub",
                    children: "今天也来看海洋朋友吗？",
                  }),
                ],
              }),
              v.jsx("div", {
                "code-path": "src\\pages\\Main.tsx:78:11",
                className: "main-hero-right",
                children: v.jsx("button", {
                  "code-path": "src\\pages\\Main.tsx:79:13",
                  className: "me-avatar",
                  onClick: () => e("/profile"),
                  "aria-label": "我的资料",
                  children: i
                    ? v.jsx("img", {
                        "code-path": "src\\pages\\Main.tsx:80:25",
                        src: i,
                        alt: "头像",
                      })
                    : v.jsx(nR, {
                        "code-path": "src\\pages\\Main.tsx:80:57",
                        size: 20,
                        strokeWidth: 1.8,
                      }),
                }),
              }),
            ],
          }),
          v.jsxs("div", {
            "code-path": "src\\pages\\Main.tsx:86:9",
            className: "show-banner",
            role: "button",
            tabIndex: 0,
            onKeyDown: (event) => {
              if (event.key === "Enter") e("/shows");
            },
            onClick: () => e("/shows"),
            children: [
              v.jsx("img", {
                "code-path": "src\\pages\\Main.tsx:87:11",
                src: "assets/asset_1.png",
                alt: "小白",
                className: "banner-mascot",
              }),
              v.jsxs("div", {
                "code-path": "src\\pages\\Main.tsx:88:11",
                className: "banner-text",
                children: [
                  v.jsx("div", {
                    "code-path": "src\\pages\\Main.tsx:89:13",
                    className: "banner-title",
                    children: upcoming
                      ? `「${upcoming.name}」${upcoming.time} 开演 · ${upcoming.place}`
                      : "今日演出已结束",
                  }),
                  v.jsx("div", {
                    "code-path": "src\\pages\\Main.tsx:90:13",
                    className: "banner-sub",
                    children: upcoming
                      ? upcoming.remaining === 0
                        ? "即将开演，请按现场指引入场"
                        : `距开场 ${upcoming.remaining} 分钟`
                      : "查看场次，为下次游园做准备",
                  }),
                ],
              }),
              v.jsx("span", {
                "code-path": "src\\pages\\Main.tsx:92:11",
                className: "banner-cta",
                children: "看场次",
              }),
            ],
          }),
        ],
      }),
      v.jsxs("div", {
        "code-path": "src\\pages\\Main.tsx:96:7",
        className: "main-body",
        children: [
          v.jsxs("div", {
            "code-path": "src\\pages\\Main.tsx:98:9",
            className: "feature-large reveal",
            onClick: () => e("/backpack"),
            children: [
              v.jsxs("div", {
                "code-path": "src\\pages\\Main.tsx:99:11",
                className: "feature-large-text",
                children: [
                  v.jsx("div", {
                    "code-path": "src\\pages\\Main.tsx:100:13",
                    className: "feature-large-title",
                    children: "感官友好书包",
                  }),
                  v.jsxs("div", {
                    "code-path": "src\\pages\\Main.tsx:101:13",
                    className: "feature-large-sub",
                    children: [
                      "降噪耳机 · 墨镜 · 安抚玩具",
                      v.jsx("br", {
                        "code-path": "src\\pages\\Main.tsx:101:64",
                      }),
                      "入园即可免费借用",
                    ],
                  }),
                  v.jsx("span", {
                    "code-path": "src\\pages\\Main.tsx:102:13",
                    className: "feature-tag",
                    children: "免费借用",
                  }),
                ],
              }),
              v.jsx("span", {
                "code-path": "src\\pages\\Main.tsx:104:11",
                className: "feature-large-icon",
                children: v.jsx(Ic, {
                  "code-path": "src\\pages\\Main.tsx:104:48",
                  size: 44,
                  strokeWidth: 1.6,
                }),
              }),
            ],
          }),
          v.jsxs("div", {
            "code-path": "src\\pages\\Main.tsx:106:9",
            className: "feature-row",
            children: [
              v.jsxs("div", {
                "code-path": "src\\pages\\Main.tsx:107:11",
                className: "feature-small deep reveal",
                style: { animationDelay: "60ms" },
                onClick: () => e("/stories"),
                children: [
                  v.jsx("span", {
                    "code-path": "src\\pages\\Main.tsx:108:13",
                    className: "feature-small-icon",
                    children: v.jsx(Hy, {
                      "code-path": "src\\pages\\Main.tsx:108:50",
                      size: 22,
                      strokeWidth: 1.8,
                    }),
                  }),
                  v.jsx("div", {
                    "code-path": "src\\pages\\Main.tsx:109:13",
                    className: "feature-small-title",
                    children: "社交故事",
                  }),
                  v.jsxs("div", {
                    "code-path": "src\\pages\\Main.tsx:110:13",
                    className: "feature-small-sub",
                    children: [
                      "提前了解游园流程",
                      v.jsx("br", {
                        "code-path": "src\\pages\\Main.tsx:110:56",
                      }),
                      "缓解陌生环境焦虑",
                    ],
                  }),
                  v.jsx("span", {
                    "code-path": "src\\pages\\Main.tsx:111:13",
                    className: "feature-tag light",
                    children: "图文故事",
                  }),
                ],
              }),
              v.jsxs("div", {
                "code-path": "src\\pages\\Main.tsx:113:11",
                className: "feature-small reveal",
                style: { animationDelay: "120ms" },
                onClick: () => e("/venues"),
                children: [
                  v.jsx("span", {
                    "code-path": "src\\pages\\Main.tsx:114:13",
                    className: "feature-small-icon",
                    children: v.jsx(O2, {
                      "code-path": "src\\pages\\Main.tsx:114:50",
                      type: "dolphin",
                      size: 30,
                    }),
                  }),
                  v.jsx("div", {
                    "code-path": "src\\pages\\Main.tsx:115:13",
                    className: "feature-small-title",
                    children: "场馆详情",
                  }),
                  v.jsxs("div", {
                    "code-path": "src\\pages\\Main.tsx:116:13",
                    className: "feature-small-sub",
                    children: [
                      "各场馆刺激强度",
                      v.jsx("br", {
                        "code-path": "src\\pages\\Main.tsx:116:55",
                      }),
                      "与休息区一览",
                    ],
                  }),
                  v.jsx("span", {
                    "code-path": "src\\pages\\Main.tsx:117:13",
                    className: "feature-tag light",
                    children: "感官地图",
                  }),
                ],
              }),
            ],
          }),
          v.jsxs("div", {
            "code-path": "src\\pages\\Main.tsx:122:9",
            className: "section-head",
            children: [
              v.jsx("span", {
                "code-path": "src\\pages\\Main.tsx:123:11",
                className: "section-title",
                children: "今日演出",
              }),
              v.jsx("span", {
                "code-path": "src\\pages\\Main.tsx:124:11",
                className: "section-more",
                onClick: () => e("/shows"),
                children: "全部 ›",
              }),
            ],
          }),
          v.jsx("div", {
            "code-path": "src\\pages\\Main.tsx:126:9",
            className: "show-timeline",
            children: j2.map((C, E) => {
              const [N, M] = C.time.split(" / "),
                w = _H(C.emoji);
              return v.jsxs(
                "div",
                {
                  "code-path": "src\\pages\\Main.tsx:131:15",
                  className: `tl-item reveal ${upcoming?.name === C.name ? "now" : ""}`,
                  role: "link",
                  tabIndex: 0,
                  onClick: () =>
                    e(
                      `/venues/${{ 白鲸剧场: "beluga", 海豚剧场: "dolphin", 海狮广场: "sealion" }[C.place]}`,
                    ),
                  onKeyDown: (event) => {
                    if (event.key === "Enter")
                      e(
                        `/venues/${{ 白鲸剧场: "beluga", 海豚剧场: "dolphin", 海狮广场: "sealion" }[C.place]}`,
                      );
                  },
                  style: { animationDelay: `${180 + E * 60}ms` },
                  children: [
                    v.jsxs("div", {
                      "code-path": "src\\pages\\Main.tsx:132:17",
                      className: "tl-time",
                      children: [
                        v.jsx("span", {
                          "code-path": "src\\pages\\Main.tsx:133:19",
                          className: "tl-time-main",
                          children: N,
                        }),
                        v.jsx("span", {
                          "code-path": "src\\pages\\Main.tsx:134:19",
                          className: "tl-time-sub",
                          children: M,
                        }),
                      ],
                    }),
                    v.jsx("div", {
                      "code-path": "src\\pages\\Main.tsx:136:17",
                      className: "tl-track",
                      children: v.jsx("span", {
                        "code-path": "src\\pages\\Main.tsx:136:43",
                        className: "tl-node",
                      }),
                    }),
                    v.jsxs("div", {
                      "code-path": "src\\pages\\Main.tsx:137:17",
                      className: "tl-info",
                      children: [
                        v.jsxs("div", {
                          "code-path": "src\\pages\\Main.tsx:138:19",
                          className: "tl-name",
                          children: [
                            C.name,
                            v.jsx("span", {
                              "code-path": "src\\pages\\Main.tsx:140:21",
                              className: `show-tag ${C.tagClass}`.trim(),
                              children: C.tag,
                            }),
                          ],
                        }),
                        v.jsxs("div", {
                          "code-path": "src\\pages\\Main.tsx:142:19",
                          className: "tl-place",
                          children: [
                            v.jsx(Iy, {
                              "code-path": "src\\pages\\Main.tsx:142:45",
                              size: 13,
                              strokeWidth: 1.8,
                            }),
                            C.place,
                          ],
                        }),
                      ],
                    }),
                    w &&
                      v.jsx(O2, {
                        "code-path": "src\\pages\\Main.tsx:144:26",
                        type: w,
                        size: 30,
                      }),
                  ],
                },
                C.name,
              );
            }),
          }),
          v.jsx("div", {
            "code-path": "src\\pages\\Main.tsx:151:9",
            className: "section-head",
            children: v.jsx("span", {
              "code-path": "src\\pages\\Main.tsx:152:11",
              className: "section-title",
              children: "爱心贴士",
            }),
          }),
          v.jsxs("div", {
            "code-path": "src\\pages\\Main.tsx:154:9",
            className: "tips-panel",
            children: [
              v.jsxs("div", {
                "code-path": "src\\pages\\Main.tsx:155:11",
                className: "tips-item",
                children: [
                  v.jsx("span", {
                    "code-path": "src\\pages\\Main.tsx:155:38",
                    className: "tips-icon",
                    children: v.jsx(QN, {
                      "code-path": "src\\pages\\Main.tsx:155:66",
                      size: 16,
                      strokeWidth: 1.8,
                    }),
                  }),
                  "白鲸剧场音响较强，听觉敏感建议自备降噪耳机",
                ],
              }),
              v.jsxs("div", {
                "code-path": "src\\pages\\Main.tsx:156:11",
                className: "tips-item",
                children: [
                  v.jsx("span", {
                    "code-path": "src\\pages\\Main.tsx:156:38",
                    className: "tips-icon",
                    children: v.jsx(ky, {
                      "code-path": "src\\pages\\Main.tsx:156:66",
                      size: 16,
                      strokeWidth: 1.8,
                    }),
                  }),
                  "安静休息室位于极地馆旁 & 出口服务区，可随时前往",
                ],
              }),
              v.jsxs("div", {
                "code-path": "src\\pages\\Main.tsx:157:11",
                className: "tips-item",
                children: [
                  v.jsx("span", {
                    "code-path": "src\\pages\\Main.tsx:157:38",
                    className: "tips-icon",
                    children: v.jsx(u_, {
                      "code-path": "src\\pages\\Main.tsx:157:66",
                      size: 16,
                      strokeWidth: 1.8,
                    }),
                  }),
                  "入口游客中心可免费借用轮椅，全园畅通无障碍通道",
                ],
              }),
            ],
          }),
          v.jsx("div", {
            "code-path": "src\\pages\\Main.tsx:159:9",
            style: { height: 12 },
          }),
        ],
      }),
      v.jsx("div", {
        "code-path": "src\\pages\\Main.tsx:163:7",
        className: "tab-bar",
        children: DH.map((C) =>
          C.key === "map"
            ? v.jsxs(
                "button",
                {
                  "code-path": "src\\pages\\Main.tsx:165:11",
                  className: "tab-map",
                  onClick: () => $("map"),
                  "aria-label": "园区地图",
                  children: [
                    v.jsx("span", {
                      "code-path": "src\\pages\\Main.tsx:166:13",
                      className: "tab-map-btn",
                      children: v.jsx("svg", {
                        "code-path": "src\\pages\\Main.tsx:167:15",
                        width: "26",
                        height: "26",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        children: v.jsx("path", {
                          "code-path": "src\\pages\\Main.tsx:167:75",
                          d: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zm0 2.2l6 2V18l-6-2V6.2z",
                          fill: "#fff",
                        }),
                      }),
                    }),
                    v.jsx("span", {
                      "code-path": "src\\pages\\Main.tsx:169:13",
                      className: "tab-map-label",
                      children: "地图",
                    }),
                  ],
                },
                "map",
              )
            : v.jsxs(
                "button",
                {
                  "code-path": "src\\pages\\Main.tsx:172:11",
                  className: `tab-item ${C.key === "home" ? "active" : ""}`,
                  onClick: () => $(C.key),
                  children: [
                    C.icon(C.key === "home"),
                    v.jsx("span", {
                      "code-path": "src\\pages\\Main.tsx:174:13",
                      children: C.label,
                    }),
                  ],
                },
                C.key,
              ),
        ),
      }),
      v.jsxs("button", {
        "code-path": "src\\pages\\Main.tsx:178:7",
        className: "ai-mascot-fab",
        onClick: () => e("/chat"),
        "aria-label": "问小白",
        children: [
          v.jsx("img", {
            "code-path": "src\\pages\\Main.tsx:179:9",
            src: "assets/xiaobai.png",
            alt: "问小白",
          }),
          v.jsx("span", {
            "code-path": "src\\pages\\Main.tsx:180:9",
            className: "ai-mascot-label",
            children: "问小白",
          }),
        ],
      }),
      v.jsx(aR, {
        "code-path": "src\\pages\\Main.tsx:182:7",
        open: f,
        role: localStorage.getItem("userRole") ?? "xinqingnian",
        onDone: m,
      }),
    ],
  });
}
