function wH() {
  const { id: e } = e$(),
    t = Mr(),
    r = H0.find((u) => u.id === e),
    [a, l] = d.useState(1);
  if (!r) return v.jsx(WhaleUI.NotFound, { type: "story" });
  const i = (u) => {
    const f = u.currentTarget,
      p = f.scrollTop / Math.max(1, f.scrollHeight - f.clientHeight);
    l(
      Math.min(
        r.steps.length,
        Math.max(1, Math.round(p * (r.steps.length - 1)) + 1),
      ),
    );
  };
  return v.jsxs(Rr, {
    "code-path": "src\\pages\\StoryDetail.tsx:29:5",
    variant: "gray",
    className: "list-page",
    children: [
      v.jsx(oo, { "code-path": "src\\pages\\StoryDetail.tsx:30:7", dark: !0 }),
      v.jsxs("div", {
        "code-path": "src\\pages\\StoryDetail.tsx:32:7",
        className: "story-progress",
        children: [
          "场景 ",
          v.jsx("b", {
            "code-path": "src\\pages\\StoryDetail.tsx:32:42",
            children: a,
          }),
          " / ",
          r.steps.length,
        ],
      }),
      v.jsxs("div", {
        "code-path": "src\\pages\\StoryDetail.tsx:33:7",
        className: "list-body",
        onScroll: i,
        children: [
          v.jsxs("div", {
            "code-path": "src\\pages\\StoryDetail.tsx:35:9",
            className: "d-hero",
            children: [
              v.jsx("img", {
                "code-path": "src\\pages\\StoryDetail.tsx:36:11",
                src: r.img,
                alt: "",
              }),
              v.jsx("div", {
                "code-path": "src\\pages\\StoryDetail.tsx:37:11",
                className: "d-hero-shade",
              }),
              v.jsx("button", {
                "code-path": "src\\pages\\StoryDetail.tsx:38:11",
                className: "d-back",
                onClick: () => WhaleUI.safeBack(t, "/stories"),
                "aria-label": "返回故事列表",
                children: v.jsx("svg", {
                  "code-path": "src\\pages\\StoryDetail.tsx:39:13",
                  width: "22",
                  height: "22",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  children: v.jsx("path", {
                    "code-path": "src\\pages\\StoryDetail.tsx:40:15",
                    d: "M15 18l-6-6 6-6",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                  }),
                }),
              }),
              v.jsx(Hf, {
                itemId: `story:${r.id}`,
                "code-path": "src\\pages\\StoryDetail.tsx:43:11",
                className: "d-fav",
                size: 20,
              }),
              v.jsxs("div", {
                "code-path": "src\\pages\\StoryDetail.tsx:44:11",
                className: "d-hero-cap",
                children: [
                  v.jsx("div", {
                    "code-path": "src\\pages\\StoryDetail.tsx:45:13",
                    className: "d-hero-title",
                    children: r.title,
                  }),
                  v.jsxs("div", {
                    "code-path": "src\\pages\\StoryDetail.tsx:46:13",
                    className: "d-hero-meta",
                    children: [
                      v.jsx("span", {
                        "code-path": "src\\pages\\StoryDetail.tsx:47:15",
                        className: "feat-pill",
                        children: r.category,
                      }),
                      r.duration,
                      " · ",
                      r.steps.length,
                      " 个场景",
                    ],
                  }),
                ],
              }),
            ],
          }),
          v.jsx("div", {
            "code-path": "src\\pages\\StoryDetail.tsx:54:9",
            className: "sec-title",
            children: "故事简介",
          }),
          v.jsx("p", {
            "code-path": "src\\pages\\StoryDetail.tsx:55:9",
            className: "d-overview",
            children: r.intro,
          }),
          r.steps.map((u, f) =>
            v.jsxs(
              "div",
              {
                "code-path": "src\\pages\\StoryDetail.tsx:58:11",
                className: "story-step-card",
                children: [
                  v.jsx("img", {
                    "code-path": "src\\pages\\StoryDetail.tsx:59:13",
                    className: "step-thumb",
                    src: r.stepImgs?.[f] ?? r.img,
                    alt: "",
                  }),
                  v.jsxs("div", {
                    "code-path": "src\\pages\\StoryDetail.tsx:60:13",
                    className: "story-step-body",
                    children: [
                      v.jsxs("div", {
                        "code-path": "src\\pages\\StoryDetail.tsx:61:15",
                        className: "story-step-no",
                        children: ["场景 ", f + 1],
                      }),
                      v.jsx("div", {
                        "code-path": "src\\pages\\StoryDetail.tsx:62:15",
                        className: "story-step-text",
                        children: u.text,
                      }),
                    ],
                  }),
                ],
              },
              f,
            ),
          ),
          v.jsx("div", {
            "code-path": "src\\pages\\StoryDetail.tsx:67:9",
            className: "story-end",
            children: "读完啦！下次来公园，我就知道每一步该怎么做。",
          }),
          v.jsx("div", {
            "code-path": "src\\pages\\StoryDetail.tsx:70:9",
            style: { height: 16 },
          }),
        ],
      }),
    ],
  });
}
