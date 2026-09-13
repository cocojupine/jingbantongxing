function aR({ open: e, role: t, onDone: r }) {
  const { message: a } = zl.useApp(),
    l = d.useRef(null),
    [i, u] = d.useState($c),
    f = t === "parent",
    p = d.useMemo(() => {
      if (!i.birthday) return "";
      const S = WhaleUI.ageAt(i.birthday);
      return S === null ? "" : `${S} 岁`;
    }, [i.birthday]),
    m = (S, $) => u((C) => ({ ...C, [S]: $ })),
    g = (S, $) =>
      m(S, i[S].includes($) ? i[S].filter((C) => C !== $) : [...i[S], $]),
    x = async (S) => {
      if (!S) return;
      try {
        m("avatar", await WhaleUI.avatarData(S));
      } catch (error) {
        a.warning(error.message || "图片读取失败，请换一张试试");
      }
    },
    b = () => {
      const error = WhaleUI.profileError(i);
      if (error) return a.warning(error);
      try {
        localStorage.setItem(
          "userProfile",
          JSON.stringify({ ...i, name: i.name.trim() }),
        );
        localStorage.setItem("profileCompleted", "1");
        a.success("个人档案已保存");
        r();
      } catch {
        a.error("本地存储空间不足，档案尚未保存");
      }
    };
  d.useEffect(() => {
    if (e) u($c());
  }, [e]);
  return v.jsxs(Tr, {
    "code-path": "src\\components\\ProfileModal.tsx:75:5",
    open: e,
    className: "jb-profile-editor",
    onCancel: r,
    footer: null,
    closable: !1,
    centered: !0,
    width: 330,
    styles: {
      body: { maxHeight: "70vh", overflowY: "auto", padding: "4px 2px" },
      mask: { background: "rgba(8, 58, 112, .45)" },
    },
    style: { borderRadius: 24 },
    children: [
      v.jsxs("div", {
        "code-path": "src\\components\\ProfileModal.tsx:84:7",
        className: "setup-head",
        children: [
          v.jsx("img", {
            "code-path": "src\\components\\ProfileModal.tsx:85:9",
            src: "assets/asset_1.png",
            alt: "小白",
            className: "setup-mascot",
          }),
          v.jsx("div", {
            "code-path": "src\\components\\ProfileModal.tsx:86:9",
            className: "setup-title",
            children: f ? "完善心青年档案" : "完善个人档案",
          }),
          v.jsx("div", {
            "code-path": "src\\components\\ProfileModal.tsx:87:9",
            className: "setup-sub",
            children: f
              ? "填写孩子的信息，小白会给出更贴心的游园建议"
              : "只需 1 分钟，小白会按你的特点提供游园建议",
          }),
        ],
      }),
      v.jsxs("div", {
        "code-path": "src\\components\\ProfileModal.tsx:94:7",
        className: "avatar-section",
        style: { justifyContent: "center" },
        children: [
          v.jsx("div", {
            "code-path": "src\\components\\ProfileModal.tsx:95:9",
            className: "avatar-uploader",
            onClick: () => l.current?.click(),
            children: i.avatar
              ? v.jsx("img", {
                  "code-path": "src\\components\\ProfileModal.tsx:96:26",
                  src: i.avatar,
                  alt: "头像",
                })
              : v.jsxs(v.Fragment, {
                  children: [
                    v.jsx("span", {
                      "code-path": "src\\components\\ProfileModal.tsx:96:66",
                      style: { fontSize: 20 },
                      children: "👤",
                    }),
                    v.jsx("span", {
                      "code-path": "src\\components\\ProfileModal.tsx:96:106",
                      children: "点击上传",
                    }),
                  ],
                }),
          }),
          v.jsx("input", {
            "code-path": "src\\components\\ProfileModal.tsx:98:9",
            ref: l,
            type: "file",
            accept: "image/jpeg,image/png",
            hidden: !0,
            onChange: (S) => x(S.target.files?.[0]),
          }),
        ],
      }),
      v.jsxs("div", {
        "code-path": "src\\components\\ProfileModal.tsx:101:7",
        className: "form-row",
        children: [
          v.jsxs("label", {
            "code-path": "src\\components\\ProfileModal.tsx:102:9",
            className: "form-label",
            children: [f ? "心青年姓名" : "姓名", " *"],
          }),
          v.jsx("input", {
            "code-path": "src\\components\\ProfileModal.tsx:103:9",
            className: "input-field",
            placeholder: f ? "请填写心青年的真实姓名" : "请填写真实姓名",
            value: i.name,
            onChange: (S) => m("name", S.target.value),
          }),
        ],
      }),
      f &&
        v.jsxs("div", {
          "code-path": "src\\components\\ProfileModal.tsx:112:9",
          className: "form-row",
          children: [
            v.jsx("label", {
              "code-path": "src\\components\\ProfileModal.tsx:113:11",
              className: "form-label",
              children: "您是 TA 的",
            }),
            v.jsx("div", {
              "code-path": "src\\components\\ProfileModal.tsx:114:11",
              className: "gender-options",
              children: yD.map((S) =>
                v.jsx(
                  "div",
                  {
                    "code-path": "src\\components\\ProfileModal.tsx:116:15",
                    className: `gender-option ${i.relation === S ? "active" : ""}`,
                    onClick: () => m("relation", S),
                    children: S,
                  },
                  S,
                ),
              ),
            }),
          ],
        }),
      v.jsxs("div", {
        "code-path": "src\\components\\ProfileModal.tsx:122:7",
        className: "form-row",
        children: [
          v.jsx("label", {
            "code-path": "src\\components\\ProfileModal.tsx:123:9",
            className: "form-label",
            children: "性别",
          }),
          v.jsx("div", {
            "code-path": "src\\components\\ProfileModal.tsx:124:9",
            className: "gender-options",
            children: ["男", "女"].map((S) =>
              v.jsx(
                "div",
                {
                  "code-path": "src\\components\\ProfileModal.tsx:126:13",
                  className: `gender-option ${i.gender === S ? "active" : ""}`,
                  onClick: () => m("gender", S),
                  children: S,
                },
                S,
              ),
            ),
          }),
        ],
      }),
      v.jsxs("div", {
        "code-path": "src\\components\\ProfileModal.tsx:131:7",
        className: "form-row",
        children: [
          v.jsx("label", {
            "code-path": "src\\components\\ProfileModal.tsx:132:9",
            className: "form-label",
            children: "出生日期",
          }),
          v.jsx("input", {
            "code-path": "src\\components\\ProfileModal.tsx:133:9",
            className: "input-field",
            type: "date",
            max: WhaleUI.localDate(),
            value: i.birthday,
            onChange: (S) => m("birthday", S.target.value),
          }),
          p &&
            v.jsxs("div", {
              "code-path": "src\\components\\ProfileModal.tsx:134:17",
              className: "age-readonly",
              children: ["年龄：", p],
            }),
        ],
      }),
      v.jsxs("div", {
        "code-path": "src\\components\\ProfileModal.tsx:137:7",
        className: "form-row",
        children: [
          v.jsx("label", {
            "code-path": "src\\components\\ProfileModal.tsx:138:9",
            className: "form-label",
            children: "所在地区",
          }),
          v.jsx("input", {
            "code-path": "src\\components\\ProfileModal.tsx:139:9",
            className: "input-field",
            placeholder: "如：浙江省杭州市",
            value: i.region,
            onChange: (S) => m("region", S.target.value),
          }),
        ],
      }),
      v.jsxs("div", {
        "code-path": "src\\components\\ProfileModal.tsx:142:7",
        className: "form-row",
        children: [
          v.jsx("label", {
            "code-path": "src\\components\\ProfileModal.tsx:143:9",
            className: "form-label",
            children: "感官敏感度（可多选）",
          }),
          v.jsx("div", {
            "code-path": "src\\components\\ProfileModal.tsx:144:9",
            className: "tag-options",
            children: hD.map((S) =>
              v.jsx(
                "span",
                {
                  "code-path": "src\\components\\ProfileModal.tsx:146:13",
                  className: `tag-option ${i.sensory.includes(S) ? "active" : ""}`,
                  onClick: () => g("sensory", S),
                  children: S,
                },
                S,
              ),
            ),
          }),
        ],
      }),
      v.jsxs("div", {
        "code-path": "src\\components\\ProfileModal.tsx:151:7",
        className: "form-row",
        children: [
          v.jsx("label", {
            "code-path": "src\\components\\ProfileModal.tsx:152:9",
            className: "form-label",
            children: "喜欢的海洋动物（可多选）",
          }),
          v.jsx("div", {
            "code-path": "src\\components\\ProfileModal.tsx:153:9",
            className: "tag-options",
            children: gD.map((S) =>
              v.jsx(
                "span",
                {
                  "code-path": "src\\components\\ProfileModal.tsx:155:13",
                  className: `tag-option ${i.interests.includes(S) ? "active" : ""}`,
                  onClick: () => g("interests", S),
                  children: S,
                },
                S,
              ),
            ),
          }),
        ],
      }),
      v.jsxs("div", {
        "code-path": "src\\components\\ProfileModal.tsx:160:7",
        className: "form-row",
        children: [
          v.jsx("label", {
            "code-path": "src\\components\\ProfileModal.tsx:161:9",
            className: "form-label",
            children: "紧急联系电话",
          }),
          v.jsx("input", {
            "code-path": "src\\components\\ProfileModal.tsx:162:9",
            className: "input-field",
            placeholder: "用于紧急情况联系",
            maxLength: 11,
            value: i.emergencyPhone,
            onChange: (S) =>
              m("emergencyPhone", S.target.value.replace(/\D/g, "")),
          }),
        ],
      }),
      v.jsxs("div", {
        "code-path": "src\\components\\ProfileModal.tsx:169:7",
        className: "form-row",
        style: { marginBottom: 20 },
        children: [
          v.jsx("label", {
            "code-path": "src\\components\\ProfileModal.tsx:170:9",
            className: "form-label",
            children: "出行必备物品",
          }),
          v.jsx("textarea", {
            "code-path": "src\\components\\ProfileModal.tsx:171:9",
            className: "textarea-field",
            placeholder: "如：降噪耳机、安抚玩具、常用药品……",
            value: i.advice,
            onChange: (S) => m("advice", S.target.value),
          }),
        ],
      }),
      v.jsx("button", {
        "code-path": "src\\components\\ProfileModal.tsx:179:7",
        className: "btn-primary",
        onClick: b,
        children: "保存档案",
      }),
      v.jsx("div", {
        "code-path": "src\\components\\ProfileModal.tsx:180:7",
        className: "setup-skip",
        onClick: r,
        children: "取消",
      }),
    ],
  });
}
