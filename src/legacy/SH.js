function SH() {
  const { message: e, modal } = zl.useApp(),
    navigate = Mr(),
    [t, r] = d.useState("east"),
    [a, l] = d.useState(""),
    [i, u] = d.useState(1),
    [f, p] = d.useState(""),
    [m, g] = d.useState(null),
    x = d.useMemo(bH, []);
  d.useEffect(() => {
    (l(x[0].value), p(localStorage.getItem("userPhone") ?? ""));
    try {
      const $ = localStorage.getItem("backpackBooking");
      if ($) {
        const value = JSON.parse($);
        if (WhaleUI.bookingValid(value)) g(value);
      }
    } catch {}
  }, []);
  const b = () => {
      if (!/^1\d{10}$/.test(f)) {
        e.warning("请填写正确的 11 位手机号");
        return;
      }
      if (!x.some((day) => day.value === a) || a < WhaleUI.localDate())
        return e.warning("请选择有效的领取日期");
      const C = {
        code: "BP" + String(Math.floor(1e5 + Math.random() * 9e5)),
        point: M2.find((E) => E.id === t).name,
        date: a,
        count: i,
        phone: f,
      };
      try {
        localStorage.setItem("backpackBooking", JSON.stringify(C));
        g(C);
        e.success("演示预约已保存");
      } catch {
        e.error("本地存储空间不足，预约尚未保存");
      }
    },
    S = () => {
      modal.confirm({
        title: "取消这次演示预约？",
        content: "取消后可以重新选择领取点和日期。",
        okText: "取消预约",
        cancelText: "保留预约",
        onOk: () => {
          localStorage.removeItem("backpackBooking");
          g(null);
          e.success("已取消预约");
        },
      });
    };
  return v.jsxs(Rr, {
    "code-path": "src\\pages\\Backpack.tsx:82:5",
    variant: "gray",
    className: "bp-page",
    children: [
      v.jsx(oo, { "code-path": "src\\pages\\Backpack.tsx:83:7", dark: !0 }),
      v.jsx(Bl, {
        "code-path": "src\\pages\\Backpack.tsx:84:7",
        title: "感官友好书包",
        dark: !0,
      }),
      v.jsxs("div", {
        "code-path": "src\\pages\\Backpack.tsx:86:7",
        className: "bp-body",
        children: [
          v.jsxs("div", {
            "code-path": "src\\pages\\Backpack.tsx:88:9",
            className: "bp-hero",
            children: [
              v.jsx("div", {
                "code-path": "src\\pages\\Backpack.tsx:89:11",
                className: "bp-hero-emoji",
                children: v.jsx(Ic, {
                  "code-path": "src\\pages\\Backpack.tsx:89:42",
                  size: 48,
                  strokeWidth: 1.5,
                }),
              }),
              v.jsxs("div", {
                "code-path": "src\\pages\\Backpack.tsx:90:11",
                className: "bp-hero-text",
                children: [
                  v.jsx("div", {
                    "code-path": "src\\pages\\Backpack.tsx:91:13",
                    className: "bp-hero-title",
                    children: "感官友好书包",
                  }),
                  v.jsxs("div", {
                    "code-path": "src\\pages\\Backpack.tsx:92:13",
                    className: "bp-hero-sub",
                    children: [
                      "为感官敏感的孩子免费准备",
                      v.jsx("br", {
                        "code-path": "src\\pages\\Backpack.tsx:92:54",
                      }),
                      "入园即可借用，让游园更安心",
                    ],
                  }),
                  v.jsx("span", {
                    "code-path": "src\\pages\\Backpack.tsx:93:13",
                    className: "feature-tag",
                    children: "免费借用 · 押金 100 元",
                  }),
                ],
              }),
            ],
          }),
          v.jsxs("div", {
            "code-path": "src\\pages\\Backpack.tsx:97:9",
            className: "card",
            children: [
              v.jsx("div", {
                "code-path": "src\\pages\\Backpack.tsx:98:11",
                className: "card-title",
                children: "书包里有什么",
              }),
              v.jsx("div", {
                "code-path": "src\\pages\\Backpack.tsx:99:11",
                className: "bp-contents",
                children: yH.map(($) =>
                  v.jsxs(
                    "div",
                    {
                      "code-path": "src\\pages\\Backpack.tsx:101:15",
                      className: "bp-content-item",
                      children: [
                        v.jsx("span", {
                          "code-path": "src\\pages\\Backpack.tsx:102:17",
                          className: "bp-content-emoji",
                          children: $.icon,
                        }),
                        v.jsxs("div", {
                          "code-path": "src\\pages\\Backpack.tsx:103:17",
                          children: [
                            v.jsx("div", {
                              "code-path": "src\\pages\\Backpack.tsx:104:19",
                              className: "bp-content-name",
                              children: $.name,
                            }),
                            v.jsx("div", {
                              "code-path": "src\\pages\\Backpack.tsx:105:19",
                              className: "bp-content-desc",
                              children: $.desc,
                            }),
                          ],
                        }),
                      ],
                    },
                    $.name,
                  ),
                ),
              }),
            ],
          }),
          v.jsxs("div", {
            "code-path": "src\\pages\\Backpack.tsx:113:9",
            className: "card bp-map-card",
            children: [
              v.jsx("div", {
                "code-path": "src\\pages\\Backpack.tsx:114:11",
                className: "card-title",
                children: "领取点位置",
              }),
              v.jsx("div", {
                "code-path": "src\\pages\\Backpack.tsx:115:11",
                className: "bp-map",
                children: v.jsxs("svg", {
                  "code-path": "src\\pages\\Backpack.tsx:116:13",
                  viewBox: "0 0 320 150",
                  width: "100%",
                  height: "100%",
                  children: [
                    v.jsx("rect", {
                      "code-path": "src\\pages\\Backpack.tsx:117:15",
                      width: "320",
                      height: "150",
                      fill: "#F0F7FF",
                    }),
                    v.jsx("path", {
                      "code-path": "src\\pages\\Backpack.tsx:118:15",
                      d: "M0 110 Q60 90 110 108 T220 105 T320 95 L320 150 L0 150 Z",
                      fill: "#BBDFFF",
                    }),
                    v.jsx("path", {
                      "code-path": "src\\pages\\Backpack.tsx:119:15",
                      d: "M0 118 Q60 98 110 116 T220 113 T320 103",
                      fill: "none",
                      stroke: "#8CCAFF",
                      strokeWidth: "3",
                    }),
                    v.jsx("rect", {
                      "code-path": "src\\pages\\Backpack.tsx:120:15",
                      x: "30",
                      y: "30",
                      width: "60",
                      height: "40",
                      rx: "8",
                      fill: "#fff",
                      opacity: ".85",
                    }),
                    v.jsx("rect", {
                      "code-path": "src\\pages\\Backpack.tsx:121:15",
                      x: "120",
                      y: "18",
                      width: "70",
                      height: "42",
                      rx: "8",
                      fill: "#fff",
                      opacity: ".85",
                    }),
                    v.jsx("rect", {
                      "code-path": "src\\pages\\Backpack.tsx:122:15",
                      x: "230",
                      y: "35",
                      width: "60",
                      height: "38",
                      rx: "8",
                      fill: "#fff",
                      opacity: ".85",
                    }),
                    v.jsx("text", {
                      "code-path": "src\\pages\\Backpack.tsx:123:15",
                      x: "60",
                      y: "55",
                      fontSize: "10",
                      fill: "#8496AC",
                      textAnchor: "middle",
                      paintOrder: "stroke",
                      stroke: "#fff",
                      strokeWidth: "3",
                      strokeLinejoin: "round",
                      children: "海豚剧场",
                    }),
                    v.jsx("text", {
                      "code-path": "src\\pages\\Backpack.tsx:124:15",
                      x: "155",
                      y: "43",
                      fontSize: "10",
                      fill: "#8496AC",
                      textAnchor: "middle",
                      paintOrder: "stroke",
                      stroke: "#fff",
                      strokeWidth: "3",
                      strokeLinejoin: "round",
                      children: "极地馆",
                    }),
                    v.jsx("text", {
                      "code-path": "src\\pages\\Backpack.tsx:125:15",
                      x: "260",
                      y: "58",
                      fontSize: "10",
                      fill: "#8496AC",
                      textAnchor: "middle",
                      paintOrder: "stroke",
                      stroke: "#fff",
                      strokeWidth: "3",
                      strokeLinejoin: "round",
                      children: "白鲸剧场",
                    }),
                    v.jsx("path", {
                      "code-path": "src\\pages\\Backpack.tsx:126:15",
                      d: "M0 90 Q80 70 160 84 T320 78",
                      fill: "none",
                      stroke: "#FFD25E",
                      strokeWidth: "5",
                      strokeLinecap: "round",
                      strokeDasharray: "1 10",
                    }),
                    v.jsxs("g", {
                      "code-path": "src\\pages\\Backpack.tsx:128:15",
                      transform: "translate(28 78)",
                      children: [
                        v.jsx("circle", {
                          "code-path": "src\\pages\\Backpack.tsx:129:17",
                          r: "11",
                          fill: "#FF7A52",
                        }),
                        v.jsx("text", {
                          "code-path": "src\\pages\\Backpack.tsx:130:17",
                          y: "4",
                          fontSize: "11",
                          textAnchor: "middle",
                          children: "🎒",
                        }),
                      ],
                    }),
                    v.jsx("text", {
                      "code-path": "src\\pages\\Backpack.tsx:132:15",
                      x: "28",
                      y: "106",
                      fontSize: "9",
                      fill: "#FF7A52",
                      textAnchor: "middle",
                      fontWeight: "700",
                      paintOrder: "stroke",
                      stroke: "#fff",
                      strokeWidth: "3",
                      strokeLinejoin: "round",
                      children: "东门游客中心",
                    }),
                    v.jsxs("g", {
                      "code-path": "src\\pages\\Backpack.tsx:134:15",
                      transform: "translate(150 66)",
                      children: [
                        v.jsx("circle", {
                          "code-path": "src\\pages\\Backpack.tsx:135:17",
                          r: "11",
                          fill: "#FF7A52",
                        }),
                        v.jsx("text", {
                          "code-path": "src\\pages\\Backpack.tsx:136:17",
                          y: "4",
                          fontSize: "11",
                          textAnchor: "middle",
                          children: "🎒",
                        }),
                      ],
                    }),
                    v.jsx("text", {
                      "code-path": "src\\pages\\Backpack.tsx:138:15",
                      x: "150",
                      y: "88",
                      fontSize: "9",
                      fill: "#FF7A52",
                      textAnchor: "middle",
                      fontWeight: "700",
                      paintOrder: "stroke",
                      stroke: "#fff",
                      strokeWidth: "3",
                      strokeLinejoin: "round",
                      children: "极地馆服务台",
                    }),
                    v.jsxs("g", {
                      "code-path": "src\\pages\\Backpack.tsx:139:15",
                      transform: "translate(300 20)",
                      children: [
                        v.jsx("circle", {
                          "code-path": "src\\pages\\Backpack.tsx:140:17",
                          r: "10",
                          fill: "#1E93F7",
                        }),
                        v.jsx("text", {
                          "code-path": "src\\pages\\Backpack.tsx:141:17",
                          y: "4",
                          fontSize: "10",
                          textAnchor: "middle",
                          fill: "#fff",
                          children: "🚪",
                        }),
                      ],
                    }),
                    v.jsx("text", {
                      "code-path": "src\\pages\\Backpack.tsx:143:15",
                      x: "298",
                      y: "42",
                      fontSize: "9",
                      fill: "#1E93F7",
                      textAnchor: "middle",
                      fontWeight: "700",
                      paintOrder: "stroke",
                      stroke: "#fff",
                      strokeWidth: "3",
                      strokeLinejoin: "round",
                      children: "东门",
                    }),
                  ],
                }),
              }),
              v.jsx("button", {
                "code-path": "src\\pages\\Backpack.tsx:146:11",
                className: "bp-map-btn",
                onClick: () => navigate("/map"),
                children: "打开园区地图 ›",
              }),
            ],
          }),
          v.jsxs("div", {
            "code-path": "src\\pages\\Backpack.tsx:152:9",
            className: "card",
            children: [
              v.jsx("div", {
                "code-path": "src\\pages\\Backpack.tsx:153:11",
                className: "card-title",
                children: "预约借用",
              }),
              m
                ? v.jsxs("div", {
                    "code-path": "src\\pages\\Backpack.tsx:155:13",
                    className: "bp-booking-done",
                    children: [
                      v.jsx("div", {
                        "code-path": "src\\pages\\Backpack.tsx:156:15",
                        className: "bp-booking-code",
                        children: m.code,
                      }),
                      v.jsxs("div", {
                        "code-path": "src\\pages\\Backpack.tsx:157:15",
                        className: "bp-booking-info",
                        children: [
                          m.point,
                          " · ",
                          m.date,
                          " · ",
                          m.count,
                          " 套",
                        ],
                      }),
                      v.jsx("div", {
                        "code-path": "src\\pages\\Backpack.tsx:160:15",
                        className: "bp-booking-hint",
                        children:
                          "演示预约码，不代表真实预约；实际领取请联系现场服务点",
                      }),
                      v.jsx("button", {
                        "code-path": "src\\pages\\Backpack.tsx:161:15",
                        className: "btn-outline",
                        style: { height: 44, fontSize: 15, marginTop: 6 },
                        onClick: S,
                        children: "取消预约",
                      }),
                    ],
                  })
                : v.jsxs(v.Fragment, {
                    children: [
                      v.jsx("label", {
                        "code-path": "src\\pages\\Backpack.tsx:165:15",
                        className: "form-label",
                        children: "领取点",
                      }),
                      v.jsx("div", {
                        "code-path": "src\\pages\\Backpack.tsx:166:15",
                        className: "bp-points",
                        children: M2.map(($) =>
                          v.jsxs(
                            "div",
                            {
                              "code-path": "src\\pages\\Backpack.tsx:168:19",
                              className: `bp-point ${t === $.id ? "active" : ""}`,
                              onClick: () => r($.id),
                              children: [
                                v.jsx("div", {
                                  "code-path":
                                    "src\\pages\\Backpack.tsx:169:21",
                                  className: "bp-point-name",
                                  children: $.name,
                                }),
                                v.jsx("div", {
                                  "code-path":
                                    "src\\pages\\Backpack.tsx:170:21",
                                  className: "bp-point-hint",
                                  children: $.hint,
                                }),
                              ],
                            },
                            $.id,
                          ),
                        ),
                      }),
                      v.jsx("label", {
                        "code-path": "src\\pages\\Backpack.tsx:174:15",
                        className: "form-label",
                        children: "领取日期",
                      }),
                      v.jsx("div", {
                        "code-path": "src\\pages\\Backpack.tsx:175:15",
                        className: "bp-dates",
                        children: x.map(($) =>
                          v.jsxs(
                            "div",
                            {
                              "code-path": "src\\pages\\Backpack.tsx:177:19",
                              className: `bp-date ${a === $.value ? "active" : ""}`,
                              onClick: () => l($.value),
                              children: [
                                v.jsx("div", {
                                  "code-path":
                                    "src\\pages\\Backpack.tsx:178:21",
                                  className: "bp-date-label",
                                  children: $.label,
                                }),
                                v.jsx("div", {
                                  "code-path":
                                    "src\\pages\\Backpack.tsx:179:21",
                                  className: "bp-date-sub",
                                  children: $.sub,
                                }),
                              ],
                            },
                            $.value,
                          ),
                        ),
                      }),
                      v.jsx("label", {
                        "code-path": "src\\pages\\Backpack.tsx:183:15",
                        className: "form-label",
                        children: "借用数量",
                      }),
                      v.jsxs("div", {
                        "code-path": "src\\pages\\Backpack.tsx:184:15",
                        className: "bp-count",
                        children: [
                          v.jsx("button", {
                            "code-path": "src\\pages\\Backpack.tsx:185:17",
                            className: "bp-count-btn",
                            onClick: () => u(Math.max(1, i - 1)),
                            disabled: i <= 1,
                            "aria-label": "减少借用数量",
                            children: "−",
                          }),
                          v.jsxs("span", {
                            "code-path": "src\\pages\\Backpack.tsx:186:17",
                            className: "bp-count-num",
                            children: [i, " 套"],
                          }),
                          v.jsx("button", {
                            "code-path": "src\\pages\\Backpack.tsx:187:17",
                            className: "bp-count-btn",
                            onClick: () => u(Math.min(3, i + 1)),
                            disabled: i >= 3,
                            "aria-label": "增加借用数量",
                            children: "＋",
                          }),
                          v.jsx("span", {
                            "code-path": "src\\pages\\Backpack.tsx:188:17",
                            className: "bp-count-hint",
                            children: "每位心青年限借 1 套，最多 3 套",
                          }),
                        ],
                      }),
                      v.jsx("label", {
                        "code-path": "src\\pages\\Backpack.tsx:190:15",
                        className: "form-label",
                        children: "联系手机号",
                      }),
                      v.jsx("input", {
                        "code-path": "src\\pages\\Backpack.tsx:191:15",
                        className: "input-field",
                        placeholder: "用于领取时核对",
                        maxLength: 11,
                        value: f,
                        onChange: ($) => p($.target.value.replace(/\D/g, "")),
                      }),
                      v.jsx("button", {
                        "code-path": "src\\pages\\Backpack.tsx:195:15",
                        className: "btn-primary",
                        style: { marginTop: 18, marginBottom: 0 },
                        onClick: b,
                        children: "确认预约",
                      }),
                    ],
                  }),
            ],
          }),
          v.jsxs("div", {
            "code-path": "src\\pages\\Backpack.tsx:201:9",
            className: "card",
            children: [
              v.jsx("div", {
                "code-path": "src\\pages\\Backpack.tsx:202:11",
                className: "card-title",
                children: "领取 / 归还指引",
              }),
              v.jsxs("div", {
                "code-path": "src\\pages\\Backpack.tsx:203:11",
                className: "bp-steps",
                children: [
                  v.jsxs("div", {
                    "code-path": "src\\pages\\Backpack.tsx:204:13",
                    className: "bp-steps-col",
                    children: [
                      v.jsx("div", {
                        "code-path": "src\\pages\\Backpack.tsx:205:15",
                        className: "bp-steps-title pickup",
                        children: "领取",
                      }),
                      xH.map(($, C) =>
                        v.jsxs(
                          "div",
                          {
                            "code-path": "src\\pages\\Backpack.tsx:207:17",
                            className: "bp-step",
                            children: [
                              v.jsx("span", {
                                "code-path": "src\\pages\\Backpack.tsx:208:19",
                                className: "bp-step-num",
                                children: C + 1,
                              }),
                              v.jsx("span", {
                                "code-path": "src\\pages\\Backpack.tsx:209:19",
                                className: "bp-step-text",
                                children: $,
                              }),
                            ],
                          },
                          $,
                        ),
                      ),
                    ],
                  }),
                  v.jsxs("div", {
                    "code-path": "src\\pages\\Backpack.tsx:213:13",
                    className: "bp-steps-col",
                    children: [
                      v.jsx("div", {
                        "code-path": "src\\pages\\Backpack.tsx:214:15",
                        className: "bp-steps-title return",
                        children: "归还",
                      }),
                      vH.map(($, C) =>
                        v.jsxs(
                          "div",
                          {
                            "code-path": "src\\pages\\Backpack.tsx:216:17",
                            className: "bp-step",
                            children: [
                              v.jsx("span", {
                                "code-path": "src\\pages\\Backpack.tsx:217:19",
                                className: "bp-step-num return",
                                children: C + 1,
                              }),
                              v.jsx("span", {
                                "code-path": "src\\pages\\Backpack.tsx:218:19",
                                className: "bp-step-text",
                                children: $,
                              }),
                            ],
                          },
                          $,
                        ),
                      ),
                    ],
                  }),
                ],
              }),
            ],
          }),
          v.jsxs("div", {
            "code-path": "src\\pages\\Backpack.tsx:226:9",
            className: "card bp-deposit",
            children: [
              v.jsx("div", {
                "code-path": "src\\pages\\Backpack.tsx:227:11",
                className: "card-title",
                children: "押金机制说明",
              }),
              v.jsxs("div", {
                "code-path": "src\\pages\\Backpack.tsx:228:11",
                className: "bp-deposit-amount",
                children: [
                  "¥100",
                  v.jsx("span", {
                    "code-path": "src\\pages\\Backpack.tsx:228:50",
                    children: "/ 套",
                  }),
                ],
              }),
              v.jsxs("div", {
                "code-path": "src\\pages\\Backpack.tsx:229:11",
                className: "tips-item",
                children: [
                  v.jsx("span", {
                    "code-path": "src\\pages\\Backpack.tsx:229:38",
                    className: "tips-icon",
                    children: v.jsx(g_, {
                      "code-path": "src\\pages\\Backpack.tsx:229:66",
                      size: 16,
                      strokeWidth: 1.8,
                    }),
                  }),
                  "书包本身免费借用，押金仅为物品保障，归还时全额原路退回",
                ],
              }),
              v.jsxs("div", {
                "code-path": "src\\pages\\Backpack.tsx:230:11",
                className: "tips-item",
                children: [
                  v.jsx("span", {
                    "code-path": "src\\pages\\Backpack.tsx:230:38",
                    className: "tips-icon",
                    children: v.jsx($_, {
                      "code-path": "src\\pages\\Backpack.tsx:230:66",
                      size: 16,
                      strokeWidth: 1.8,
                    }),
                  }),
                  "支持微信 / 支付宝支付押金，退回一般在 24 小时内到账",
                ],
              }),
              v.jsxs("div", {
                "code-path": "src\\pages\\Backpack.tsx:231:11",
                className: "tips-item",
                children: [
                  v.jsx("span", {
                    "code-path": "src\\pages\\Backpack.tsx:231:38",
                    className: "tips-icon",
                    children: v.jsx(tR, {
                      "code-path": "src\\pages\\Backpack.tsx:231:66",
                      size: 16,
                      strokeWidth: 1.8,
                    }),
                  }),
                  "物品损坏或遗失将按价扣除相应费用（如降噪耳机 60 元）",
                ],
              }),
              v.jsxs("div", {
                "code-path": "src\\pages\\Backpack.tsx:232:11",
                className: "tips-item",
                children: [
                  v.jsx("span", {
                    "code-path": "src\\pages\\Backpack.tsx:232:38",
                    className: "tips-icon",
                    children: v.jsx(Fy, {
                      "code-path": "src\\pages\\Backpack.tsx:232:66",
                      size: 16,
                      strokeWidth: 1.8,
                    }),
                  }),
                  "低保家庭凭相关证明可申请免押金，详询游客服务中心",
                ],
              }),
            ],
          }),
          v.jsx("div", {
            "code-path": "src\\pages\\Backpack.tsx:234:9",
            style: { height: 12 },
          }),
        ],
      }),
    ],
  });
}
