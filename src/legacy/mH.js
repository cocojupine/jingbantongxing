function mH() {
  const e = Mr(),
    t = ao(),
    [r] = Y0(),
    [a, l] = d.useState(() =>
      WhaleUI.getList("jb-chat", sessionStorage).filter(
        (item) => !item.loading,
      ),
    ),
    [i, u] = d.useState(""),
    [f, p] = d.useState(!1),
    m = d.useRef(null),
    [g, x] = d.useState(!1),
    [b, S] = d.useState(0),
    [$, C] = d.useState(""),
    E = d.useRef(null),
    N = d.useRef(void 0),
    M = d.useRef(void 0),
    w = d.useRef(""),
    z = d.useRef(0),
    T = d.useRef(!1),
    summarySeen = d.useRef(null),
    replyTimer = d.useRef(null),
    replyLock = d.useRef(false),
    [voiceHint, setVoiceHint] = d.useState(""),
    O = () => {
      (window.clearInterval(N.current), window.clearTimeout(M.current));
    },
    A = () => {
      try {
        E.current?.abort();
      } catch {}
      E.current = null;
    },
    j = (_) => {
      if (!T.current) {
        O();
        x(false);
        setVoiceHint("语音识别暂不可用，请使用文字输入");
        return;
      }
      M.current = window.setTimeout(() => {
        ((w.current = Uh),
          C(Uh),
          u(Uh),
          _ ||
            (M.current = window.setTimeout(() => {
              (O(), x(!1));
            }, 600)));
      }, 2600);
    },
    D = (_ = !1) => {
      if (g) return;
      setVoiceHint("");
      (C(""),
        S(0),
        (w.current = ""),
        x(!0),
        (N.current = window.setInterval(() => S((X) => X + 1), 1e3)));
      const V = _ ? null : bR();
      if (!V) {
        j(T.current);
        return;
      }
      ((E.current = V),
        (V.onresult = (X) => {
          let re = "";
          for (let P = X.resultIndex; P < X.results.length; P++) {
            const F = X.results[P];
            F.isFinal
              ? (w.current += F[0].transcript)
              : (re += F[0].transcript);
          }
          const ee = (w.current + re).trim();
          (C(ee), u(ee));
        }),
        (V.onerror = () => {
          (A(), w.current || j(T.current));
        }));
      try {
        V.start();
      } catch {
        (A(), j(T.current));
      }
    },
    H = (_) => {
      if (!g) return;
      (A(), O(), x(!1));
      const V = w.current || $;
      (_ === "send" ? V.trim() && Q(V) : u(""), C(""));
    },
    k = () => {
      ((z.current = Date.now()), D());
    },
    I = () => {
      g && Date.now() - z.current >= 400 && H("send");
    };
  (d.useEffect(() => {
    r.get("demo") === "recording" && ((T.current = !0), D(!0));
  }, []),
    d.useEffect(() => {
      const _ = t.state?.callSummary;
      if (!_ || summarySeen.current === _) return;
      summarySeen.current = _;
      const V = Math.floor(_.duration / 60),
        X = _.duration % 60,
        re = V > 0 ? `${V} 分 ${X} 秒` : `${X} 秒`,
        ee = _.exchanges.flatMap((F) => [
          `你问：${F.q}`,
          `小白答：${
            F.a.split(`
`)[0]
          }`,
        ]),
        P = {
          key: Vh(),
          role: "ai",
          content: [`语音通话小结 · 通话 ${re}`, ...ee].join(`
`),
        };
      (l((F) => [...F, P]), e(t.pathname, { replace: !0, state: null }));
    }, [t.state]),
    d.useEffect(
      () => () => {
        (A(), O(), window.clearTimeout(replyTimer.current));
      },
      [],
    ));
  d.useEffect(() => {
    try {
      sessionStorage.setItem("jb-chat", JSON.stringify(a));
    } catch {}
  }, [a]);
  d.useEffect(() => {
    const pending = WhaleUI.readJSON("jb-call-summary", null, sessionStorage);
    if (pending) {
      sessionStorage.removeItem("jb-call-summary");
      l((messages) => [
        ...messages,
        {
          key: Vh(),
          role: "ai",
          content:
            `语音通话小结 · ${pending.duration} 秒\n` +
            (pending.exchanges.length
              ? pending.exchanges
                  .map((item) => `你问：${item.q}\n小白答：${item.a}`)
                  .join("\n")
              : "本次通话没有识别到问题。"),
        },
      ]);
    }
  }, []);
  const W = () =>
      requestAnimationFrame(() => {
        m.current?.scrollTo({
          top: m.current.scrollHeight,
          behavior: "smooth",
        });
      }),
    Q = (_) => {
      const V = _.trim();
      if (!V || replyLock.current) return;
      replyLock.current = true;
      (u(""), p(!0));
      const X = { key: Vh(), role: "user", content: V },
        re = Vh();
      (l((P) => [...P, X, { key: re, role: "ai", content: "", loading: !0 }]),
        W());
      const ee = CR(V);
      replyTimer.current = window.setTimeout(
        () => {
          (l((P) =>
            P.map((F) =>
              F.key === re ? { ...F, content: ee, loading: !1 } : F,
            ),
          ),
            p(!1),
            (replyLock.current = false),
            W());
        },
        700 + Math.random() * 600,
      );
    },
    U = a.map((_) => ({
      key: _.key,
      role: _.role,
      content: _.content,
      loading: _.loading,
      typing:
        _.role === "ai" && !_.loading
          ? { effect: "typing", step: 3, interval: 40 }
          : void 0,
      avatar:
        _.role === "ai"
          ? v.jsx(d0, {
              "code-path": "src\\pages\\Chat.tsx:243:9",
              src: "assets/mascot.png",
              size: 36,
              style: { background: "#fff", border: "1px solid var(--sea-100)" },
            })
          : v.jsx(d0, {
              "code-path": "src\\pages\\Chat.tsx:245:9",
              size: 36,
              style: { background: "#1E93F7" },
              children: "我",
            }),
      placement: _.role === "ai" ? "start" : "end",
      styles:
        _.role === "user"
          ? {
              content: {
                background:
                  "linear-gradient(135deg, var(--sea-500), var(--sea-400))",
                color: "#fff",
                borderRadius: "16px 4px 16px 16px",
              },
            }
          : {
              content: {
                background: "#fff",
                boxShadow: "0 2px 10px rgba(14,75,133,.08)",
                borderRadius: "4px 16px 16px 16px",
              },
            },
      messageRender: (V) =>
        v.jsx("div", {
          "code-path": "src\\pages\\Chat.tsx:253:7",
          className: "chat-md",
          children: String(V)
            .split(
              `
`,
            )
            .map((X, re) =>
              v.jsx(
                "p",
                {
                  "code-path": "src\\pages\\Chat.tsx:255:11",
                  children: X || " ",
                },
                re,
              ),
            ),
        }),
    }));
  return v.jsxs(Rr, {
    "code-path": "src\\pages\\Chat.tsx:262:5",
    variant: "gray",
    className: "chat-page",
    children: [
      v.jsxs("div", {
        "code-path": "src\\pages\\Chat.tsx:263:7",
        className: "chat-header",
        children: [
          v.jsx("div", {
            "code-path": "src\\pages\\Chat.tsx:264:9",
            className: "back",
            onClick: () => WhaleUI.safeBack(e),
            children: v.jsx("svg", {
              "code-path": "src\\pages\\Chat.tsx:265:11",
              width: "24",
              height: "24",
              viewBox: "0 0 24 24",
              fill: "none",
              children: v.jsx("path", {
                "code-path": "src\\pages\\Chat.tsx:266:13",
                d: "M15 18l-6-6 6-6",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
            }),
          }),
          v.jsx("div", {
            "code-path": "src\\pages\\Chat.tsx:269:9",
            className: "chat-header-title",
            children: "小白 · AI 助手",
          }),
          v.jsxs("span", {
            "code-path": "src\\pages\\Chat.tsx:270:9",
            className: "chat-header-badge",
            children: [
              v.jsx(Fy, {
                "code-path": "src\\pages\\Chat.tsx:270:45",
                size: 12,
                strokeWidth: 1.8,
              }),
              " 智能体",
            ],
          }),
          v.jsx("button", {
            "code-path": "src\\pages\\Chat.tsx:271:9",
            className: "chat-call-btn",
            onClick: () => e("/chat/call", { state: { fromChat: true } }),
            "aria-label": "发起语音通话",
            children: v.jsx(G_, {
              "code-path": "src\\pages\\Chat.tsx:272:11",
              size: 17,
              strokeWidth: 1.8,
            }),
          }),
        ],
      }),
      v.jsx("div", {
        "code-path": "src\\pages\\Chat.tsx:276:7",
        className: "chat-body",
        ref: m,
        children:
          a.length === 0
            ? v.jsxs(v.Fragment, {
                children: [
                  v.jsxs("div", {
                    "code-path": "src\\pages\\Chat.tsx:280:13",
                    className: "chat-greet",
                    children: [
                      v.jsxs("div", {
                        "code-path": "src\\pages\\Chat.tsx:281:15",
                        className: "chat-greet-text",
                        children: [
                          v.jsx("div", {
                            "code-path": "src\\pages\\Chat.tsx:282:17",
                            className: "chat-greet-hi",
                            children: "你好",
                          }),
                          v.jsx("div", {
                            "code-path": "src\\pages\\Chat.tsx:283:17",
                            className: "chat-greet-title",
                            children: "我是小白，游园小助手",
                          }),
                          v.jsx("div", {
                            "code-path": "src\\pages\\Chat.tsx:284:17",
                            className: "chat-greet-sub",
                            children: "✦ 祝你今天玩得开心",
                          }),
                        ],
                      }),
                      v.jsx("img", {
                        "code-path": "src\\pages\\Chat.tsx:286:15",
                        src: "assets/asset_1.png",
                        alt: "小白",
                        className: "chat-greet-mascot",
                      }),
                    ],
                  }),
                  v.jsxs("div", {
                    "code-path": "src\\pages\\Chat.tsx:290:13",
                    className: "ask-card",
                    children: [
                      v.jsx("div", {
                        "code-path": "src\\pages\\Chat.tsx:291:15",
                        className: "ask-card-head",
                        children: v.jsx("div", {
                          "code-path": "src\\pages\\Chat.tsx:292:17",
                          className: "ask-card-title",
                          children: "你可以这样问",
                        }),
                      }),
                      dH.map((_) =>
                        v.jsxs(
                          "div",
                          {
                            "code-path": "src\\pages\\Chat.tsx:295:17",
                            className: "ask-row",
                            onClick: () => Q(_.text),
                            children: [
                              v.jsx("span", {
                                "code-path": "src\\pages\\Chat.tsx:296:19",
                                className: "ask-icon",
                                children: _.icon,
                              }),
                              v.jsx("span", {
                                "code-path": "src\\pages\\Chat.tsx:297:19",
                                className: "ask-text",
                                children: _.text,
                              }),
                              v.jsx("span", {
                                "code-path": "src\\pages\\Chat.tsx:298:19",
                                className: "ask-chevron",
                                children: "›",
                              }),
                            ],
                          },
                          _.text,
                        ),
                      ),
                    ],
                  }),
                  v.jsx("div", {
                    "code-path": "src\\pages\\Chat.tsx:303:13",
                    className: "chat-privacy",
                    children: "🔒 对话内容仅用于为你提供游园服务",
                  }),
                ],
              })
            : v.jsx(ps.List, {
                "code-path": "src\\pages\\Chat.tsx:306:11",
                items: U,
              }),
      }),
      v.jsxs("div", {
        "code-path": "src\\pages\\Chat.tsx:310:7",
        className: "chat-footer",
        children: [
          a.length === 0 &&
            !g &&
            v.jsx("div", {
              "code-path": "src\\pages\\Chat.tsx:312:11",
              className: "quick-chips",
              children: fH.map((_) =>
                v.jsxs(
                  "button",
                  {
                    "code-path": "src\\pages\\Chat.tsx:314:15",
                    className: "quick-chip",
                    onClick: () => Q(_.q),
                    children: [_.icon, " ", _.label],
                  },
                  _.label,
                ),
              ),
            }),
          g
            ? v.jsxs("div", {
                "code-path": "src\\pages\\Chat.tsx:321:11",
                className: "rec-bar",
                role: "status",
                "aria-live": "polite",
                "aria-label": "正在录音",
                children: [
                  v.jsx("button", {
                    "code-path": "src\\pages\\Chat.tsx:322:13",
                    className: "rec-btn rec-cancel",
                    onClick: () => H("cancel"),
                    "aria-label": "取消录音",
                    children: v.jsx(uD, {
                      "code-path": "src\\pages\\Chat.tsx:323:15",
                      size: 20,
                      strokeWidth: 2,
                    }),
                  }),
                  v.jsxs("div", {
                    "code-path": "src\\pages\\Chat.tsx:325:13",
                    className: "rec-mid",
                    children: [
                      v.jsx("div", {
                        "code-path": "src\\pages\\Chat.tsx:326:15",
                        className: "rec-wave",
                        "aria-hidden": "true",
                        children: Array.from({ length: 9 }, (_, V) =>
                          v.jsx(
                            "span",
                            {
                              "code-path": "src\\pages\\Chat.tsx:328:19",
                              style: { animationDelay: `${V * 0.09}s` },
                            },
                            V,
                          ),
                        ),
                      }),
                      v.jsxs("div", {
                        "code-path": "src\\pages\\Chat.tsx:331:15",
                        className: "rec-info",
                        children: [
                          v.jsx("span", {
                            "code-path": "src\\pages\\Chat.tsx:332:17",
                            className: "rec-time",
                            children: SR(b),
                          }),
                          v.jsx("span", {
                            "code-path": "src\\pages\\Chat.tsx:333:17",
                            className: "rec-hint",
                            children: $ || "正在聆听，说完后点击发送",
                          }),
                        ],
                      }),
                    ],
                  }),
                  v.jsx("button", {
                    "code-path": "src\\pages\\Chat.tsx:336:13",
                    className: "rec-btn rec-send",
                    onClick: () => H("send"),
                    "aria-label": "发送识别内容",
                    children: v.jsx(K_, {
                      "code-path": "src\\pages\\Chat.tsx:337:15",
                      size: 20,
                      strokeWidth: 2,
                    }),
                  }),
                ],
              })
            : v.jsxs("div", {
                "code-path": "src\\pages\\Chat.tsx:341:11",
                className: "chat-input-row",
                children: [
                  v.jsx("button", {
                    "code-path": "src\\pages\\Chat.tsx:342:13",
                    className: "mic-btn",
                    onClick: () => D(),
                    "aria-label": "点击开始语音输入",
                    children: v.jsx(JN, {
                      "code-path": "src\\pages\\Chat.tsx:349:15",
                      size: 20,
                      strokeWidth: 1.8,
                    }),
                  }),
                  v.jsx(Xy, {
                    "code-path": "src\\pages\\Chat.tsx:351:13",
                    value: i,
                    onChange: u,
                    onSubmit: Q,
                    onCancel: () => {
                      window.clearTimeout(replyTimer.current);
                      replyLock.current = false;
                      p(false);
                      l((messages) =>
                        messages.map((item) =>
                          item.loading
                            ? {
                                ...item,
                                loading: false,
                                content: "已停止回复，可以重新提问。",
                              }
                            : item,
                        ),
                      );
                    },
                    loading: f,
                    placeholder: "问点什么吧，比如：今天有哪些表演？",
                    submitType: "enter",
                    styles: { input: { borderRadius: 24 } },
                  }),
                ],
              }),
          v.jsx("div", {
            "code-path": "src\\pages\\Chat.tsx:362:9",
            className: "chat-tips",
            role: "status",
            children:
              voiceHint ||
              (T.current
                ? "录音效果演示，未使用麦克风"
                : "演示回复来自内置知识库"),
          }),
        ],
      }),
    ],
  });
}
