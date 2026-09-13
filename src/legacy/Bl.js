function Bl({ title: e, dark: t, onBack: r, hideBack: a, hideCapsule: l }) {
  const i = Mr();
  return v.jsxs("div", {
    "code-path": "src\\components\\PhoneFrame.tsx:34:5",
    className: `nav-bar ${t ? "dark" : "light"}`,
    children: [
      a
        ? v.jsx("div", {
            "code-path": "src\\components\\PhoneFrame.tsx:35:19",
            style: { width: 32 },
          })
        : v.jsx("div", {
            "code-path": "src\\components\\PhoneFrame.tsx:36:9",
            className: "back",
            onClick: r ?? (() => WhaleUI.safeBack(i)),
            role: "button",
            tabIndex: 0,
            "aria-label": "返回",
            onKeyDown: (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                (r ?? (() => WhaleUI.safeBack(i)))();
              }
            },
            children: v.jsx("svg", {
              "code-path": "src\\components\\PhoneFrame.tsx:37:11",
              width: "24",
              height: "24",
              viewBox: "0 0 24 24",
              fill: "none",
              children: v.jsx("path", {
                "code-path": "src\\components\\PhoneFrame.tsx:38:13",
                d: "M15 18l-6-6 6-6",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
            }),
          }),
      v.jsx("div", {
        "code-path": "src\\components\\PhoneFrame.tsx:42:7",
        className: "title",
        children: e,
      }),
      l
        ? v.jsx("div", {
            "code-path": "src\\components\\PhoneFrame.tsx:43:22",
            style: { width: 32 },
          })
        : v.jsxs("div", {
            "code-path": "src\\components\\PhoneFrame.tsx:44:9",
            className: "capsule",
            children: [
              v.jsxs("div", {
                "code-path": "src\\components\\PhoneFrame.tsx:45:11",
                className: "dots",
                children: [
                  v.jsx("div", {
                    "code-path": "src\\components\\PhoneFrame.tsx:45:33",
                    className: "dot",
                  }),
                  v.jsx("div", {
                    "code-path": "src\\components\\PhoneFrame.tsx:45:56",
                    className: "dot",
                  }),
                  v.jsx("div", {
                    "code-path": "src\\components\\PhoneFrame.tsx:45:79",
                    className: "dot",
                  }),
                ],
              }),
              v.jsx("div", {
                "code-path": "src\\components\\PhoneFrame.tsx:46:11",
                className: "divider",
              }),
              v.jsx("div", {
                "code-path": "src\\components\\PhoneFrame.tsx:47:11",
                className: "circle",
              }),
            ],
          }),
    ],
  });
}
