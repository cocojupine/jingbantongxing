function pD() {
  const { message: e } = zl.useApp(),
    t = Mr(),
    [r] = Y0(),
    a = r.get("mode") === "register" ? "register" : "login",
    [l, i] = d.useState("code"),
    [u, f] = d.useState(""),
    [p, m] = d.useState(""),
    [g, x] = d.useState(""),
    [b, S] = d.useState(0),
    $ = d.useRef(""),
    codePhone = d.useRef(""),
    codeSentAt = d.useRef(0);
  d.useEffect(() => {
    if (b <= 0) return;
    const N = setTimeout(() => S((M) => M - 1), 1e3);
    return () => clearTimeout(N);
  }, [b]);
  const C = () => {
      if (!/^1\d{10}$/.test(u)) {
        e.warning("请输入正确的 11 位手机号");
        return;
      }
      const N = String(Math.floor(1e5 + Math.random() * 9e5));
      (($.current = N),
        (codePhone.current = u),
        (codeSentAt.current = Date.now()),
        S(60),
        e.success(`演示验证码：${N}（5 分钟内有效）`, 12));
    },
    E = () => {
      if (!/^1\d{10}$/.test(u)) {
        e.warning("请输入正确的 11 位手机号");
        return;
      }
      if (l === "code") {
        if (
          !p ||
          p !== $.current ||
          u !== codePhone.current ||
          Date.now() - codeSentAt.current > 300000
        ) {
          e.warning("验证码不正确或已失效，请为当前手机号重新获取");
          return;
        }
      } else if (!g) {
        e.warning("请输入密码");
        return;
      }
      try {
        WhaleUI.signIn(
          u,
          r.get("role") === "parent" ? "parent" : "xinqingnian",
        );
        e.success(a === "register" ? "演示账号已创建" : "已进入演示账号");
        t(a === "register" ? "/main?setup=1" : "/main", { replace: true });
      } catch {
        e.error("无法保存本地账号，请检查浏览器存储设置");
      }
    };
  return v.jsxs(Rr, {
    "code-path": "src\\pages\\Login.tsx:63:5",
    variant: "white",
    children: [
      v.jsx(oo, { "code-path": "src\\pages\\Login.tsx:64:7", dark: !0 }),
      v.jsx(Bl, {
        "code-path": "src\\pages\\Login.tsx:65:7",
        title: a === "register" ? "注册" : "登录",
        dark: !0,
        onBack: () => t("/"),
      }),
      v.jsxs("div", {
        "code-path": "src\\pages\\Login.tsx:66:7",
        className: "login-content",
        children: [
          v.jsx("div", {
            "code-path": "src\\pages\\Login.tsx:67:9",
            style: {
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            },
            children: v.jsxs("span", {
              "code-path": "src\\pages\\Login.tsx:68:11",
              className: "role-badge",
              children: [
                r.get("role") === "parent"
                  ? v.jsx(Vy, {
                      "code-path": "src\\pages\\Login.tsx:69:48",
                      size: 14,
                      strokeWidth: 1.8,
                    })
                  : v.jsx(Fy, {
                      "code-path": "src\\pages\\Login.tsx:69:88",
                      size: 14,
                      strokeWidth: 1.8,
                    }),
                r.get("role") === "parent" ? "家长" : "心青年",
              ],
            }),
          }),
          v.jsxs("div", {
            "code-path": "src\\pages\\Login.tsx:73:9",
            className: "page-title",
            children: [
              "手机号",
              v.jsx("span", {
                "code-path": "src\\pages\\Login.tsx:73:40",
                className: "accent-serif",
                children: a === "register" ? "注册" : "登录",
              }),
            ],
          }),
          v.jsx("div", {
            "code-path": "src\\pages\\Login.tsx:74:9",
            className: "page-subtitle",
            children:
              l === "code" ? "请输入手机号获取验证码" : "请输入手机号和密码",
          }),
          v.jsxs("div", {
            "code-path": "src\\pages\\Login.tsx:78:9",
            className: "input-group",
            children: [
              v.jsx("label", {
                "code-path": "src\\pages\\Login.tsx:79:11",
                className: "input-label",
                children: "手机号",
              }),
              v.jsxs("div", {
                "code-path": "src\\pages\\Login.tsx:80:11",
                className: "input-wrapper",
                children: [
                  v.jsx("span", {
                    "code-path": "src\\pages\\Login.tsx:81:13",
                    className: "phone-prefix",
                    children: "+86",
                  }),
                  v.jsx("input", {
                    "code-path": "src\\pages\\Login.tsx:82:13",
                    className: "input-field",
                    style: { paddingLeft: 64 },
                    placeholder: "请输入手机号",
                    maxLength: 11,
                    value: u,
                    onChange: (N) => f(N.target.value.replace(/\D/g, "")),
                  }),
                ],
              }),
            ],
          }),
          l === "code"
            ? v.jsxs("div", {
                "code-path": "src\\pages\\Login.tsx:94:11",
                className: "input-group",
                children: [
                  v.jsx("label", {
                    "code-path": "src\\pages\\Login.tsx:95:13",
                    className: "input-label",
                    children: "验证码",
                  }),
                  v.jsxs("div", {
                    "code-path": "src\\pages\\Login.tsx:96:13",
                    className: "input-wrapper",
                    children: [
                      v.jsx("input", {
                        "code-path": "src\\pages\\Login.tsx:97:15",
                        className: "input-field",
                        placeholder: "请输入验证码",
                        maxLength: 6,
                        value: p,
                        onChange: (N) => m(N.target.value.replace(/\D/g, "")),
                      }),
                      v.jsx("button", {
                        "code-path": "src\\pages\\Login.tsx:104:15",
                        className: "code-btn",
                        disabled: b > 0,
                        onClick: C,
                        children: b > 0 ? `${b}s 后重发` : "获取验证码",
                      }),
                    ],
                  }),
                ],
              })
            : v.jsxs("div", {
                "code-path": "src\\pages\\Login.tsx:110:11",
                className: "input-group",
                children: [
                  v.jsx("label", {
                    "code-path": "src\\pages\\Login.tsx:111:13",
                    className: "input-label",
                    children: "密码",
                  }),
                  v.jsx("input", {
                    "code-path": "src\\pages\\Login.tsx:112:13",
                    className: "input-field",
                    type: "password",
                    placeholder: "请输入密码",
                    value: g,
                    onChange: (N) => x(N.target.value),
                  }),
                ],
              }),
          v.jsx("button", {
            "code-path": "src\\pages\\Login.tsx:122:9",
            className: "btn-primary",
            style: { marginTop: 8 },
            onClick: E,
            children: a === "register" ? "注册" : "登录",
          }),
          v.jsxs("div", {
            "code-path": "src\\pages\\Login.tsx:126:9",
            className: "login-links",
            children: [
              v.jsx("span", {
                "code-path": "src\\pages\\Login.tsx:127:11",
                className: "link",
                onClick: () => i(l === "code" ? "password" : "code"),
                children: l === "code" ? "密码登录" : "验证码登录",
              }),
              a === "login"
                ? v.jsxs("span", {
                    "code-path": "src\\pages\\Login.tsx:131:13",
                    className: "muted",
                    children: [
                      "还没有账号？ ",
                      v.jsx("span", {
                        "code-path": "src\\pages\\Login.tsx:132:22",
                        className: "link",
                        onClick: () =>
                          t(
                            "/login?mode=register&role=" +
                              (r.get("role") ?? ""),
                          ),
                        children: "立即注册",
                      }),
                    ],
                  })
                : v.jsxs("span", {
                    "code-path": "src\\pages\\Login.tsx:135:13",
                    className: "muted",
                    children: [
                      "已有账号？ ",
                      v.jsx("span", {
                        "code-path": "src\\pages\\Login.tsx:136:21",
                        className: "link",
                        onClick: () =>
                          t("/login?mode=login&role=" + (r.get("role") ?? "")),
                        children: "去登录",
                      }),
                    ],
                  }),
            ],
          }),
        ],
      }),
      v.jsxs("div", {
        "code-path": "src\\pages\\Login.tsx:141:7",
        className: "login-footer",
        children: [
          "体验前请阅读 ",
          v.jsx("span", {
            "code-path": "src\\pages\\Login.tsx:142:18",
            className: "link",
            role: "link",
            tabIndex: 0,
            onClick: () => t("/policy"),
            onKeyDown: (event) => {
              if (event.key === "Enter") t("/policy");
            },
            children: "《使用说明》",
          }),
          " 和 ",
          v.jsx("span", {
            "code-path": "src\\pages\\Login.tsx:142:57",
            className: "link",
            role: "link",
            tabIndex: 0,
            onClick: () => t("/policy"),
            onKeyDown: (event) => {
              if (event.key === "Enter") t("/policy");
            },
            children: "《隐私说明》",
          }),
        ],
      }),
    ],
  });
}
