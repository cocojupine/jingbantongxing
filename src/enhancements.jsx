import * as state from "./state.js";

export function createEnhancements({
  React,
  useNavigate,
  useLocation,
  useSearchParams,
  Frame,
  StatusBar,
  ProfileModal,
  Modal,
  useApp,
  venues,
  stories,
  shows,
}) {
  const { useState, useEffect } = React;
  const paths = {
    home: "M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10",
    map: "m9 3-6 3v15l6-3 6 3 6-3V3l-6 3-6-3Zm0 0v15m6-12v15",
    chat: "M21 11a9 9 0 0 1-9 9H4l-2 2V11a9 9 0 0 1 19 0ZM7 10h10M7 14h6",
    user: "M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    bag: "M5 7h14v14H5V7Zm3 0V5a4 4 0 0 1 8 0v2M8 12h8M8 17h8",
    book: "M12 5v16M3 3h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v16h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3V3Z",
    heart:
      "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
    shield: "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4Zm-4 10 3 3 5-6",
    edit: "m16 3 5 5-12 12-6 1 1-6L16 3ZM13 6l5 5",
    arrow: "m9 5 7 7-7 7",
    back: "m15 5-7 7 7 7",
    plus: "M12 5v14M5 12h14",
    clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2",
    help: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9 8a3 3 0 0 1 6 0c0 2-3 2-3 5M12 16v1",
    exit: "M9 3H3v18h6M8 12h13m-5-5 5 5-5 5",
  };
  function Icon({ name, size = 22 }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={paths[name] || paths.map} />
      </svg>
    );
  }
  function BottomNav({ active }) {
    const navigate = useNavigate();
    const location = useLocation();
    return (
      <nav className="jb-bottom-nav" aria-label="主导航">
        {[
          ["home", "首页", "/main"],
          ["map", "地图", "/map"],
          ["chat", "小白", "/chat"],
          ["user", "我的", "/profile"],
        ].map(([key, label, path]) => (
          <button
            key={key}
            aria-current={key === active ? "page" : undefined}
            onClick={() => {
              if (location.pathname !== path) navigate(path);
            }}
          >
            <Icon name={key} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    );
  }
  function Header({ title, fallback = "/main", back = true }) {
    const navigate = useNavigate();
    return (
      <header className="jb-header">
        <StatusBar dark />
        <div className="jb-titlebar">
          {back ? (
            <button
              className="jb-icon-button"
              aria-label="返回"
              onClick={() => state.safeBack(navigate, fallback)}
            >
              <Icon name="back" />
            </button>
          ) : (
            <span className="jb-icon-space" />
          )}
          <h1>{title}</h1>
          <span className="jb-wordmark">{back ? "" : "鲸伴同行"}</span>
        </div>
      </header>
    );
  }
  function Page({ title, children, active, fallback }) {
    return (
      <Frame variant="gray" className="jb-page">
        <Header title={title} fallback={fallback} />
        <main className="jb-scroll">{children}</main>
        {active && <BottomNav active={active} />}
      </Frame>
    );
  }
  function Row({ icon, title, subtitle, onClick, meta }) {
    return (
      <button className="jb-row" onClick={onClick}>
        <span className={`jb-row-icon icon-${icon}`}>
          <Icon name={icon} />
        </span>
        <span className="jb-row-copy">
          <span className="jb-row-title">{title}</span>
          {subtitle && <span className="jb-row-sub">{subtitle}</span>}
        </span>
        {meta && <span className="jb-row-meta">{meta}</span>}
        <Icon name="arrow" size={16} />
      </button>
    );
  }
  function Profile() {
    const navigate = useNavigate();
    const { message, modal } = useApp();
    const [profile, setProfile] = useState(state.getProfile);
    const [editing, setEditing] = useState(false);
    const [bindings, setBindings] = useState(() => state.getList("bindings"));
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState({ name: "", phone: "", relation: "" });
    const role = localStorage.getItem("userRole") || "xinqingnian";
    const phone = localStorage.getItem("userPhone") || "";
    const isParent = role === "parent";
    const booking = state.readJSON("backpackBooking", null);
    const hasBooking = state.bookingValid(booking);
    const favorites = state.getList("favorites");
    const fields = [
      "name",
      "gender",
      "birthday",
      "region",
      "emergencyPhone",
      "avatar",
      "sensory",
      "interests",
      "advice",
    ];
    const completion = Math.round(
      (fields.filter((key) =>
        Array.isArray(profile[key]) ? profile[key].length : profile[key],
      ).length /
        fields.length) *
        100,
    );
    const addBinding = () => {
      const error = state.bindingError(draft, bindings, phone);
      if (error) return message.warning(error);
      const next = [
        ...bindings,
        {
          ...draft,
          name: draft.name.trim(),
          id: crypto.randomUUID(),
          time: state.localDate(),
        },
      ];
      try {
        localStorage.setItem("bindings", JSON.stringify(next));
        setBindings(next);
        setAdding(false);
        message.success("已添加演示绑定");
      } catch {
        message.error("本地存储空间不足，请稍后再试");
      }
    };
    const removeBinding = (item) =>
      modal.confirm({
        title: "解除这条绑定？",
        content: `将移除与「${item.name}」的演示绑定，个人档案会保留。`,
        okText: "解除绑定",
        cancelText: "保留绑定",
        onOk: () => {
          const next = bindings.filter((b) => b.id !== item.id);
          localStorage.setItem("bindings", JSON.stringify(next));
          setBindings(next);
        },
      });
    const logout = () =>
      modal.confirm({
        title: "退出当前账号？",
        content: "已保存的档案和预约会保留在本机，再次登录同一账号可继续查看。",
        okText: "退出登录",
        cancelText: "继续游园",
        onOk: () => {
          state.signOut();
          navigate("/", { replace: true });
        },
      });
    return (
      <Frame variant="gray" className="jb-page jb-profile">
        <Header title="我的" back={false} />
        <main className="jb-scroll profile-scroll" aria-label="我的资料与服务">
          <section className="jb-profile-card">
            <div className="jb-profile-top">
              <div className="jb-avatar">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="我的头像" />
                ) : (
                  <img src="assets/xiaobai.png" alt="小白" />
                )}
              </div>
              <div className="jb-profile-heading">
                <span className="jb-role">
                  {isParent ? "家长 · 照护档案" : "心青年"}
                </span>
                <h2>{profile.name || "你好，小伙伴"}</h2>
                <p>
                  {phone
                    ? phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
                    : "让每一次游园，都更安心"}
                </p>
              </div>
              <button
                className="jb-edit"
                onClick={() => setEditing(true)}
                aria-label="编辑个人档案"
              >
                <Icon name="edit" size={18} />
                <span>编辑</span>
              </button>
            </div>
            <div className="jb-completion">
              <div>
                <span>{isParent ? "心青年档案" : "个人档案"}</span>
                <b>{completion}%</b>
              </div>
              <div
                className="jb-progress"
                role="progressbar"
                aria-label="档案完善度"
                aria-valuenow={completion}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span style={{ width: `${completion}%` }} />
              </div>
              <button onClick={() => setEditing(true)}>
                {completion === 100 ? "查看档案" : "继续完善"}
                <Icon name="arrow" size={13} />
              </button>
            </div>
            {profile.sensory.length > 0 ? (
              <div className="jb-sensory">
                {profile.sensory.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            ) : (
              <p className="jb-card-note">
                <Icon name="shield" size={14} />
                {isParent
                  ? "填写孩子的感官偏好，记录需要的支持"
                  : "填写感官偏好，记录你需要的支持"}
              </p>
            )}
          </section>
          <section className="jb-section">
            <div className="jb-section-heading">
              <h2>我的游园</h2>
              <span>准备好，慢慢出发</span>
            </div>
            <div className="jb-quick-grid">
              <button onClick={() => navigate("/backpack")}>
                <span className="jb-quick-icon">
                  <Icon name="bag" size={26} />
                </span>
                <b>书包预约</b>
                <span>{hasBooking ? "查看预约码" : "为游园多一份安心"}</span>
                {hasBooking && <i className="jb-dot" />}
              </button>
              <button onClick={() => navigate("/favorites")}>
                <span className="jb-quick-icon coral">
                  <Icon name="heart" size={26} />
                </span>
                <b>我的收藏</b>
                <span>
                  {favorites.length
                    ? `${favorites.length} 个喜欢的内容`
                    : "把喜欢的留在这里"}
                </span>
              </button>
            </div>
          </section>
          <section className="jb-section">
            <div className="jb-section-heading">
              <h2>{isParent ? "我守护的心青年" : "家人的陪伴"}</h2>
              <span>一起安心游园</span>
            </div>
            <div className="jb-panel jb-family">
              {bindings.length ? (
                bindings.map((item) => (
                  <div className="jb-binding" key={item.id}>
                    <span className="jb-binding-avatar">
                      {item.name?.slice(0, 1)}
                    </span>
                    <div>
                      <b>
                        {item.name}
                        <span>{item.relation}</span>
                      </b>
                      <p>
                        {item.phone?.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
                      </p>
                    </div>
                    <button
                      onClick={() => removeBinding(item)}
                      aria-label={`解除与${item.name}的绑定`}
                    >
                      解绑
                    </button>
                  </div>
                ))
              ) : (
                <div className="jb-family-empty">
                  <span className="jb-family-icon">
                    <Icon name="user" size={24} />
                  </span>
                  <div>
                    <b>{isParent ? "添加你守护的心青年" : "让家人陪你一起"}</b>
                    <p>
                      {isParent
                        ? "把同行关系记录在这里"
                        : "添加家长，留下一份安心的陪伴"}
                    </p>
                  </div>
                </div>
              )}
              <button
                className="jb-family-add"
                onClick={() => {
                  setDraft({ name: "", phone: "", relation: "" });
                  setAdding(true);
                }}
              >
                <Icon name="plus" size={17} />
                {isParent ? "绑定心青年" : "绑定家长"}
              </button>
            </div>
          </section>
          <section className="jb-section">
            <div className="jb-section-heading">
              <h2>游园小帮手</h2>
            </div>
            <div className="jb-panel">
              <Row
                icon="book"
                title="社交故事"
                subtitle="提前看看，游园时更从容"
                onClick={() => navigate("/stories")}
              />
              <Row
                icon="map"
                title="场馆信息"
                subtitle="感官刺激与安静休息区"
                onClick={() => navigate("/venues")}
              />
              <Row
                icon="help"
                title="帮助中心"
                onClick={() => navigate("/help")}
              />
              <Row
                icon="shield"
                title="使用与隐私说明"
                onClick={() => navigate("/policy")}
              />
            </div>
          </section>
          <button
            className="jb-logout"
            onClick={phone ? logout : () => navigate("/")}
          >
            <Icon name={phone ? "exit" : "user"} size={18} />
            {phone ? "退出登录" : "登录 / 注册"}
          </button>
          <p className="jb-signature">鲸伴同行 · 陪你慢慢探索世界</p>
        </main>
        <BottomNav active="user" />
        <ProfileModal
          open={editing}
          role={role}
          onDone={() => {
            setEditing(false);
            setProfile(state.getProfile());
          }}
        />
        <Modal
          open={adding}
          onCancel={() => setAdding(false)}
          footer={null}
          title={isParent ? "绑定心青年" : "绑定家长"}
          width={360}
          centered
          className="jb-dialog"
        >
          <p className="jb-modal-description">
            此处记录本机演示绑定，不会发送邀请或同步对方档案。
          </p>
          <label className="jb-field">
            对方姓名
            <input
              maxLength={30}
              placeholder="请输入对方姓名"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <label className="jb-field">
            对方手机号
            <input
              inputMode="tel"
              maxLength={11}
              placeholder="请输入 11 位手机号"
              value={draft.phone}
              onChange={(e) =>
                setDraft({ ...draft, phone: e.target.value.replace(/\D/g, "") })
              }
            />
          </label>
          <label className="jb-field">
            TA 与我的关系
            <select
              value={draft.relation}
              onChange={(e) => setDraft({ ...draft, relation: e.target.value })}
            >
              <option value="">请选择关系</option>
              {(isParent
                ? ["我的孩子", "其他监护对象"]
                : ["爸爸", "妈妈", "其他监护人"]
              ).map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <button className="jb-primary" onClick={addBinding}>
            确认添加
          </button>
        </Modal>
      </Frame>
    );
  }
  function Favorites() {
    const navigate = useNavigate();
    const [saved] = useState(() => state.getList("favorites"));
    const items = [
      ...stories.map((s) => ({
        ...s,
        label: s.title,
        type: "story",
        route: "/stories/",
      })),
      ...venues.map((s) => ({
        ...s,
        label: s.name,
        type: "venue",
        route: "/venues/",
      })),
    ].filter((item) => saved.includes(`${item.type}:${item.id}`));
    return (
      <Page title="我的收藏" fallback="/profile">
        <p className="jb-intro">喜欢的场馆与故事，随时回来看看。</p>
        {items.length ? (
          <div className="jb-panel">
            {items.map((item) => (
              <Row
                key={item.type + item.id}
                icon={item.type === "story" ? "book" : "map"}
                title={item.label}
                subtitle={item.category}
                onClick={() => navigate(item.route + item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="jb-empty">
            <Icon name="heart" size={42} />
            <h2>还没有收藏</h2>
            <p>
              点击场馆或故事上的爱心，
              <br />
              就能在这里找到它。
            </p>
            <button className="jb-primary" onClick={() => navigate("/venues")}>
              去看看场馆
            </button>
          </div>
        )}
      </Page>
    );
  }
  function Guide() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const selected = venues.find((v) => v.id === params.get("venue"));
    return (
      <Page title="园区地图" active="map">
        <p className="jb-intro">先了解场馆位置，再按自己的节奏出发。</p>
        <div className="jb-guide-map" aria-label="园区分区示意">
          <span className="jb-map-north">北区 · 极地馆</span>
          <div>
            <span>
              中央区
              <br />
              白鲸 / 海豚剧场
            </span>
            <span>
              东区
              <br />
              水母宫 / 海底隧道
            </span>
          </div>
          <span className="jb-map-south">南区 · 海狮广场</span>
        </div>
        <p className="jb-map-note">
          分区示意，以现场标识为准；暂不提供实时定位。
        </p>
        {selected && (
          <section className="jb-panel jb-destination">
            <span className="jb-role">目的地</span>
            <h2>{selected.name}</h2>
            <p>{selected.location}</p>
            <p>
              <b>附近休息点：</b>
              {selected.restSpot}
            </p>
            <button
              className="jb-primary"
              onClick={() => navigate(`/venues/${selected.id}`)}
            >
              查看场馆详情
            </button>
          </section>
        )}
        <div className="jb-section-heading">
          <h2>场馆位置</h2>
        </div>
        <div className="jb-panel">
          {venues.map((v) => (
            <Row
              key={v.id}
              icon="map"
              title={v.name}
              subtitle={v.location}
              onClick={() => navigate(`/venues/${v.id}`)}
            />
          ))}
        </div>
        <div className="jb-section-heading">
          <h2>服务点</h2>
        </div>
        <div className="jb-panel">
          <Row
            icon="bag"
            title="东门游客中心 · 极地馆服务台"
            subtitle="感官友好书包领取与归还"
            onClick={() => navigate("/backpack")}
          />
        </div>
      </Page>
    );
  }
  function Shows() {
    const navigate = useNavigate();
    return (
      <Page title="今日演出">
        <p className="jb-intro">提前安排，给自己留一点从容的时间。</p>
        <div className="jb-panel">
          {shows.map((show) => (
            <Row
              key={show.name}
              icon="clock"
              title={show.name}
              subtitle={`${show.time} · ${show.place}`}
              onClick={() =>
                navigate(
                  `/venues/${venues.find((v) => v.name === show.place)?.id || "beluga"}`,
                )
              }
            />
          ))}
        </div>
        <p className="jb-map-note">
          时间为演示场次，实际安排以园区当天公告为准。
        </p>
      </Page>
    );
  }
  function Help() {
    const navigate = useNavigate();
    return (
      <Page title="帮助中心" fallback="/profile">
        <div className="jb-helper-hero">
          <img src="assets/xiaobai.png" alt="小白" />
          <h2>有需要，就找小白</h2>
          <p>一起把游园的小问题理清楚。</p>
        </div>
        <div className="jb-panel">
          <Row
            icon="chat"
            title="和小白聊一聊"
            subtitle="门票、演出与游园服务问答"
            onClick={() => navigate("/chat")}
          />
          <Row
            icon="bag"
            title="书包怎么领取与归还？"
            onClick={() => navigate("/backpack")}
          />
          <Row
            icon="map"
            title="在哪里可以安静休息？"
            onClick={() => navigate("/map")}
          />
          <Row
            icon="book"
            title="第一次游园怎么准备？"
            onClick={() => navigate("/stories")}
          />
        </div>
        <div className="jb-info">
          <h2>需要现场帮助</h2>
          <p>
            请前往游客中心，或联系佩戴工牌的工作人员。页面里的小白不能代替现场求助。
          </p>
        </div>
      </Page>
    );
  }
  function Policy() {
    return (
      <Page title="使用与隐私说明" fallback="/profile">
        <article className="jb-info">
          <h2>关于这个演示版本</h2>
          <p>
            鲸伴同行帮助你了解场馆、准备游园。页面中的场次、预约和绑定用于功能演示，不代表真实订单、邀请或现场服务承诺。
          </p>
          <h2>资料保存在本机</h2>
          <p>
            你填写的档案、演示绑定、预约和收藏保存在当前浏览器。退出后，再次登录同一演示账号可以恢复；清除浏览器网站数据会移除这些记录。请使用示例资料体验。
          </p>
          <h2>小白与语音</h2>
          <p>
            小白使用内置问答内容。语音识别由浏览器提供，可能使用浏览器厂商的在线服务；需要你主动操作并授权麦克风，也可以随时使用文字输入。
          </p>
          <h2>外部资源</h2>
          <p>
            页面字体可能从 Google Fonts
            加载。当前版本不提供真实支付、跨设备档案同步或第三方问卷提交。
          </p>
        </article>
      </Page>
    );
  }
  function NotFound({ type }) {
    const navigate = useNavigate();
    const title =
      type === "story"
        ? "故事不存在"
        : type === "venue"
          ? "场馆不存在"
          : "页面不存在";
    return (
      <Page title={title}>
        <div className="jb-empty">
          <img src="assets/xiaobai.png" alt="小白" />
          <h2>这个页面暂时找不到了</h2>
          <p>我们回到熟悉的地方，继续探索吧。</p>
          <button
            className="jb-primary"
            onClick={() =>
              navigate(
                type === "story"
                  ? "/stories"
                  : type === "venue"
                    ? "/venues"
                    : "/main",
                { replace: true },
              )
            }
          >
            {type === "story"
              ? "返回故事列表"
              : type === "venue"
                ? "返回场馆列表"
                : "返回首页"}
          </button>
        </div>
      </Page>
    );
  }
  function FavoriteButton({ itemId, className = "", size = 18 }) {
    const [saved, setSaved] = useState(() => state.getList("favorites"));
    const { message } = useApp();
    useEffect(() => {
      const update = () => setSaved(state.getList("favorites"));
      window.addEventListener("jb-favorites", update);
      return () => window.removeEventListener("jb-favorites", update);
    }, []);
    const active = saved.includes(itemId);
    return (
      <button
        className={`fav-btn ${active ? "faved" : ""} ${className}`}
        aria-label={active ? "取消收藏" : "收藏"}
        aria-pressed={active}
        onClick={(e) => {
          e.stopPropagation();
          const current = state.getList("favorites");
          const next = current.includes(itemId)
            ? current.filter((id) => id !== itemId)
            : [...current, itemId];
          try {
            localStorage.setItem("favorites", JSON.stringify(next));
            setSaved(next);
            window.dispatchEvent(new Event("jb-favorites"));
          } catch {
            message.error("收藏保存失败，请稍后再试");
          }
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d={paths.heart} />
        </svg>
      </button>
    );
  }
  return {
    ...state,
    Profile,
    Guide,
    Shows,
    Help,
    Policy,
    Favorites,
    NotFound,
    FavoriteButton,
    Header,
  };
}
