function gH() {
  const e = Mr(),
    location = ao(),
    [t, r] = d.useState(0),
    [a, l] = d.useState("speaking"),
    [i, u] = d.useState(!0),
    [f, p] = d.useState(""),
    m = d.useRef(null),
    g = d.useRef([]),
    x = d.useRef([]),
    b = d.useRef(0),
    S = d.useRef(0),
    $ = d.useRef(!0);
  $.current = i;
  const C = (O, A) => {
      g.current.push(window.setTimeout(O, A));
    },
    E = () => {
      (g.current.forEach((O) => window.clearTimeout(O)), (g.current = []));
    },
    N = () => {
      try {
        m.current?.abort();
      } catch {}
      m.current = null;
    };
  (d.useEffect(() => {
    const O = window.setInterval(() => {
      ((S.current += 1), r(S.current));
    }, 1e3);
    return () => window.clearInterval(O);
  }, []),
    d.useEffect(
      () => (
        R2(pH),
        C(() => l("idle"), 4200),
        () => {
          (E(), N(), Fh());
        }
      ),
      [],
    ));
  const M = (O) => {
      const A = CR(O);
      (x.current.push({ q: O, a: A }),
        p(O),
        l("speaking"),
        N(),
        $.current &&
          R2(
            `${
              A.split(`
`)[0]
            }。详细内容我已经发到聊天窗口啦。`,
          ),
        C(() => l("idle"), 5200));
    },
    w = () => {
      (E(), p(""), l("listening"), Fh());
      const O = bR();
      if (!O) {
        p("当前浏览器不支持语音识别，请返回文字聊天");
        l("idle");
        return;
      }
      ((O.continuous = !1),
        (m.current = O),
        (O.onresult = (A) => {
          let j = "";
          for (let D = 0; D < A.results.length; D++)
            j += A.results[D][0].transcript;
          (p(j),
            A.results[A.results.length - 1].isFinal && j.trim() && M(j.trim()));
        }),
        (O.onerror = () => {
          N();
          p("语音识别未成功，请重试或返回文字聊天");
          l("idle");
        }),
        (O.onend = () => {
          l((A) => (A === "listening" ? "idle" : A));
        }));
      try {
        O.start();
      } catch {
        N();
        p("语音识别暂不可用，请返回文字聊天");
        l("idle");
      }
    },
    z = () => {
      if (a === "listening") {
        (N(), l("idle"));
        return;
      }
      w();
    },
    T = () => {
      (N(), Fh(), E());
      const O = { duration: S.current, exchanges: x.current };
      sessionStorage.setItem("jb-call-summary", JSON.stringify(O));
      if (location.state?.fromChat && window.history.state?.idx > 0) e(-1);
      else e("/chat", { replace: true });
    };
  return v.jsxs(Rr, {
    "code-path": "src\\pages\\Call.tsx:137:5",
    variant: "gray",
    className: "call-page",
    children: [
      v.jsx("div", {
        "code-path": "src\\pages\\Call.tsx:139:7",
        className: "call-top",
        children: v.jsxs("div", {
          "code-path": "src\\pages\\Call.tsx:140:9",
          className: "call-pill",
          children: [
            v.jsx("span", {
              "code-path": "src\\pages\\Call.tsx:141:11",
              className: "call-dot",
              "aria-hidden": "true",
            }),
            "语音通话中 · ",
            SR(t),
          ],
        }),
      }),
      v.jsxs("div", {
        "code-path": "src\\pages\\Call.tsx:147:7",
        className: "call-center",
        children: [
          v.jsxs("button", {
            "code-path": "src\\pages\\Call.tsx:148:9",
            className: `call-avatar-wrap ${a}`,
            onClick: z,
            "aria-label": a === "listening" ? "停止说话" : "开始说话",
            children: [
              v.jsx("span", {
                "code-path": "src\\pages\\Call.tsx:153:11",
                className: "call-ripple",
                "aria-hidden": "true",
              }),
              v.jsx("span", {
                "code-path": "src\\pages\\Call.tsx:154:11",
                className: "call-ripple",
                "aria-hidden": "true",
              }),
              v.jsx("span", {
                "code-path": "src\\pages\\Call.tsx:155:11",
                className: "call-ripple",
                "aria-hidden": "true",
              }),
              v.jsx("span", {
                "code-path": "src\\pages\\Call.tsx:156:11",
                className: "call-avatar",
                children: v.jsx("img", {
                  "code-path": "src\\pages\\Call.tsx:157:13",
                  src: "assets/asset_1.png",
                  alt: "小白",
                }),
              }),
            ],
          }),
          v.jsx("div", {
            "code-path": "src\\pages\\Call.tsx:160:9",
            className: "call-state",
            role: "status",
            "aria-live": "polite",
            children: hH[a],
          }),
          f &&
            v.jsx("div", {
              "code-path": "src\\pages\\Call.tsx:161:22",
              className: "call-live",
              children: f,
            }),
        ],
      }),
      v.jsxs("div", {
        "code-path": "src\\pages\\Call.tsx:165:7",
        className: "call-actions",
        children: [
          v.jsxs("div", {
            "code-path": "src\\pages\\Call.tsx:166:9",
            className: "call-action",
            children: [
              v.jsx("button", {
                "code-path": "src\\pages\\Call.tsx:167:11",
                className: `call-btn ${a === "listening" ? "active" : ""}`,
                onClick: z,
                "aria-label":
                  a === "listening" ? "正在聆听，轻触停止" : "点我说话",
                children:
                  a === "listening"
                    ? v.jsx(JN, {
                        "code-path": "src\\pages\\Call.tsx:172:42",
                        size: 26,
                        strokeWidth: 1.8,
                      })
                    : v.jsx(L_, {
                        "code-path": "src\\pages\\Call.tsx:172:80",
                        size: 26,
                        strokeWidth: 1.8,
                      }),
              }),
              v.jsx("span", {
                "code-path": "src\\pages\\Call.tsx:174:11",
                className: "call-btn-label",
                children: a === "listening" ? "正在聆听" : "点我说话",
              }),
            ],
          }),
          v.jsxs("div", {
            "code-path": "src\\pages\\Call.tsx:176:9",
            className: "call-action",
            children: [
              v.jsx("button", {
                "code-path": "src\\pages\\Call.tsx:177:11",
                className: `call-btn ${i ? "active" : ""}`,
                onClick: () => {
                  if (i) Fh();
                  u((O) => !O);
                },
                "aria-label": i ? "关闭扬声器" : "打开扬声器",
                children: i
                  ? v.jsx(rR, {
                      "code-path": "src\\pages\\Call.tsx:182:26",
                      size: 26,
                      strokeWidth: 1.8,
                    })
                  : v.jsx(lD, {
                      "code-path": "src\\pages\\Call.tsx:182:68",
                      size: 26,
                      strokeWidth: 1.8,
                    }),
              }),
              v.jsx("span", {
                "code-path": "src\\pages\\Call.tsx:184:11",
                className: "call-btn-label",
                children: "扬声器",
              }),
            ],
          }),
          v.jsxs("div", {
            "code-path": "src\\pages\\Call.tsx:186:9",
            className: "call-action",
            children: [
              v.jsx("button", {
                "code-path": "src\\pages\\Call.tsx:187:11",
                className: "call-btn hangup",
                onClick: T,
                "aria-label": "挂断通话",
                children: v.jsx(W_, {
                  "code-path": "src\\pages\\Call.tsx:188:13",
                  size: 26,
                  strokeWidth: 1.8,
                }),
              }),
              v.jsx("span", {
                "code-path": "src\\pages\\Call.tsx:190:11",
                className: "call-btn-label",
                children: "挂断",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
