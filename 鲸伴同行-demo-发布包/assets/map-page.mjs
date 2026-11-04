import {
  buildRoutingGraph,
  optimizeVisitOrder,
  routeEdgePath,
} from "./map-routing.mjs";

const TAGS = {
  venue: { label: "场馆", short: "场" },
  dining: { label: "餐饮", short: "餐" },
  leisure: { label: "休闲", short: "休" },
  gift: { label: "礼品", short: "礼" },
  restroom: { label: "卫生间", short: "厕" },
  entrance: { label: "出入口", short: "门" },
};
const CATEGORIES = [
  { id: "all", label: "全部", short: "点" },
  ...Object.entries(TAGS).map(([id, value]) => ({ id, ...value })),
];
const elements = {
  back: document.querySelector("#backButton"),
  help: document.querySelector("#mapHelpButton"),
  helpDialog: document.querySelector("#mapHelpDialog"),
  closeHelp: document.querySelector("#closeHelpButton"),
  filters: document.querySelector("#categoryFilters"),
  search: document.querySelector("#placeSearch"),
  clearSearch: document.querySelector("#clearSearch"),
  searchResults: document.querySelector("#searchResults"),
  stage: document.querySelector("#mapStage"),
  base: document.querySelector("#baseMap"),
  overlay: document.querySelector("#mapOverlay"),
  markerLayer: document.querySelector("#markerLayer"),
  routeLayer: document.querySelector("#routeLayer"),
  panel: document.querySelector("#bottomPanel"),
  toast: document.querySelector("#mapToast"),
};

const response = await fetch("./assets/map-data.json");
if (!response.ok) throw new Error("Unable to load the park map data.");
const mapData = await response.json();
const placeById = new Map(mapData.places.map((place) => [place.id, place]));
const routingGraph = buildRoutingGraph(mapData.network, mapData.places);
const visitorCenter =
  mapData.places.find((place) => place.name === "游客中心") ?? mapData.places[0];
const state = {
  category: "all",
  search: "",
  selectedPlaceId: null,
  selectedIds: [],
  startId: visitorCenter.id,
  roundTrip: false,
  plan: null,
  view: { x: 0, y: 0, width: mapData.width, height: mapData.height },
  toastTimer: 0,
  didDrag: false,
};

if (window.parent !== window) {
  document.documentElement.classList.add("in-mockup");
}

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]
  );
const tagNames = (place) => place.tags.map((tag) => TAGS[tag]?.label).filter(Boolean);
const primaryTag = (place) => place.tags.find((tag) => TAGS[tag]) ?? "venue";
const pointLabel = (place) => TAGS[primaryTag(place)]?.short ?? "场";
const isCategoryMatch = (place) =>
  state.category === "all" || place.tags.includes(state.category);

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 1900);
}

function renderFilters() {
  elements.filters.innerHTML = CATEGORIES.map(
    (category) => `
      <button
        class="category-chip"
        type="button"
        data-category="${category.id}"
        aria-pressed="${state.category === category.id}"
      >${category.label}</button>
    `
  ).join("");
}

function planOrderById() {
  return new Map((state.plan?.order ?? []).map((id, index) => [id, index + 1]));
}

function renderMarkers() {
  const routeOrder = planOrderById();
  elements.markerLayer.innerHTML = mapData.places
    .map((place) => {
      const selected = place.id === state.selectedPlaceId;
      const isStop = state.selectedIds.includes(place.id);
      const step = routeOrder.get(place.id);
      const muted = !isCategoryMatch(place);
      const label = `${place.name}，${tagNames(place).join("、") || "地点"}`;
      return `
        <g
          class="place-marker${selected ? " is-selected" : ""}${isStop ? " is-route-stop" : ""}${muted ? " is-muted" : ""}"
          data-place-id="${escapeHtml(place.id)}"
          role="button"
          tabindex="${muted ? "-1" : "0"}"
          aria-label="${escapeHtml(label)}"
          aria-pressed="${selected}"
          ${muted ? 'aria-disabled="true"' : ""}
        >
          <circle class="marker-hit" cx="${place.x}" cy="${place.y}" r="126" />
          <circle class="marker-halo" cx="${place.x}" cy="${place.y}" r="91" />
          <circle class="marker-pin" cx="${place.x}" cy="${place.y}" r="57" />
          <text class="marker-glyph" x="${place.x}" y="${place.y + 2}">${step ?? pointLabel(place)}</text>
          ${selected || step ? `<text class="marker-label" x="${place.x}" y="${place.y - 91}">${escapeHtml(place.name)}</text>` : ""}
        </g>
      `;
    })
    .join("");
}

function renderRoute() {
  if (!state.plan) {
    elements.routeLayer.innerHTML = "";
    return;
  }
  const paths = state.plan.edges
    .map((edge) => {
      const path = routeEdgePath(edge);
      if (edge.type === "access") {
        return `<path class="route-access" d="${path}" />`;
      }
      return `<path class="route-casing" d="${path}" /><path class="route-line" d="${path}" />`;
    })
    .join("");
  const uniqueSteps = [];
  const seen = new Set();
  state.plan.order.forEach((id, index) => {
    if (seen.has(id)) return;
    seen.add(id);
    const place = placeById.get(id);
    if (place) uniqueSteps.push({ ...place, number: index + 1 });
  });
  const badges = uniqueSteps
    .map(
      (place) => `
        <g class="route-step" aria-hidden="true">
          <circle cx="${place.x}" cy="${place.y}" r="48" />
          <text x="${place.x}" y="${place.y + 2}">${place.number}</text>
        </g>
      `
    )
    .join("");
  elements.routeLayer.innerHTML = `<g>${paths}</g><g>${badges}</g>`;
}

function renderSearchResults() {
  const query = state.search.trim().toLocaleLowerCase("zh-CN");
  const results = query
    ? mapData.places
        .filter(
          (place) =>
            place.name.toLocaleLowerCase("zh-CN").includes(query) &&
            isCategoryMatch(place)
        )
        .slice(0, 8)
    : [];
  elements.clearSearch.hidden = !state.search;
  elements.search.setAttribute("aria-expanded", String(results.length > 0 || (query && !results.length)));
  elements.searchResults.hidden = !query;
  if (!query) {
    elements.searchResults.innerHTML = "";
    return;
  }
  elements.searchResults.innerHTML = results.length
    ? results
        .map(
          (place) => `
            <button class="search-result" type="button" role="option" data-search-place="${escapeHtml(place.id)}">
              <span class="result-symbol">${pointLabel(place)}</span>
              <span class="result-copy">
                <strong>${escapeHtml(place.name)}</strong>
                <span>${escapeHtml(tagNames(place).join(" · "))}</span>
              </span>
            </button>
          `
        )
        .join("")
    : `<p class="route-notice" style="padding: 8px 10px;">没有找到匹配地点，请调整关键词或分类。</p>`;
}

function renderSelectedChips() {
  return state.selectedIds
    .map((id) => placeById.get(id))
    .filter(Boolean)
    .map(
      (place) => `
        <span class="selected-chip">
          ${escapeHtml(place.name)}
          <button type="button" data-remove-stop="${escapeHtml(place.id)}" aria-label="从路线移除${escapeHtml(place.name)}">×</button>
        </span>
      `
    )
    .join("");
}

function renderRouteResult() {
  const stopCount = new Set(state.plan.order).size;
  const orderItems = state.plan.order
    .map((id, index) => {
      const place = placeById.get(id);
      return place
        ? `<span class="route-order-item"><b>${index + 1}</b>${escapeHtml(place.name)}</span>`
        : "";
    })
    .join("");
  const notice = state.plan.order.length > 1
    ? `访问顺序按现有路网优化，长度以地图坐标单位计。${state.roundTrip ? "路线返回起点。" : ""}`
    : "请选择至少两个地点后规划路线。";
  elements.panel.innerHTML = `
    <div class="route-result">
      <div class="panel-head">
        <div class="panel-title"><strong>路线已规划</strong><span>${stopCount} 个停靠点</span></div>
        <button class="text-button" type="button" data-action="edit-route">调整路线</button>
        <button class="text-button" type="button" data-action="clear-route">清除路线</button>
      </div>
      <div class="route-result-summary">
        <span>${escapeHtml(notice)}</span>
        <strong>${Math.round(state.plan.distance)} 坐标单位</strong>
      </div>
      <div class="route-order" aria-label="路线访问顺序">${orderItems}</div>
    </div>
  `;
}

function renderSelectedPlace() {
  const place = placeById.get(state.selectedPlaceId);
  if (!place) return false;
  const isAdded = state.selectedIds.includes(place.id);
  elements.panel.innerHTML = `
    <div class="place-detail">
      <div class="detail-copy">
        <strong>${escapeHtml(place.name)}</strong>
        <p>地点类型</p>
      </div>
      <div class="detail-actions">
        <button class="secondary-button" type="button" data-action="set-start" data-place-id="${escapeHtml(place.id)}">设为起点</button>
        <button class="primary-button" type="button" data-action="toggle-stop" data-place-id="${escapeHtml(place.id)}" aria-pressed="${isAdded}">
          ${isAdded ? "已加入路线" : "加入路线"}
        </button>
        <button class="text-button" type="button" data-action="dismiss-detail">完成</button>
      </div>
      <div class="detail-tags">${tagNames(place)
        .map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`)
        .join("")}</div>
    </div>
  `;
  return true;
}

function renderRouteEditor() {
  const canPlan = state.selectedIds.length >= 2 && state.selectedIds.length <= 8;
  const selected = state.selectedIds.length;
  const chips = renderSelectedChips();
  const options = mapData.places
    .map(
      (place) =>
        `<option value="${escapeHtml(place.id)}" ${place.id === state.startId ? "selected" : ""}>${escapeHtml(place.name)}</option>`
    )
    .join("");
  elements.panel.innerHTML = `
    <div class="panel-head">
      <div class="panel-title"><strong>游园路线</strong><span>已选 ${selected}/8</span></div>
      ${selected ? '<button class="text-button" type="button" data-action="clear-stops">清空</button>' : ""}
    </div>
    ${
      selected
        ? `<div class="selected-list" aria-label="已选路线地点">${chips}</div>`
        : `<div class="empty-route"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M7 5h12v12" /></svg>选择 2–8 个地点，生成游园顺序</span><button class="text-button" type="button" data-action="find-places">查找地点</button></div>`
    }
    <div class="route-controls">
      <label class="start-picker">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9" r="2.2" /></svg>
        <span>起点</span>
        <select id="startPlace" aria-label="路线起点">${options}</select>
      </label>
      <label class="return-toggle"><input id="roundTrip" type="checkbox" ${state.roundTrip ? "checked" : ""} />返回起点</label>
      <button class="primary-button" type="button" data-action="plan-route" ${canPlan ? "" : "disabled"}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M7 5h12v12" /></svg>规划路线
      </button>
    </div>
  `;
}

function renderPanel() {
  if (state.plan) {
    renderRouteResult();
  } else if (!renderSelectedPlace()) {
    renderRouteEditor();
  }
}

function renderView() {
  const viewBox = `${state.view.x} ${state.view.y} ${state.view.width} ${state.view.height}`;
  elements.base.setAttribute("viewBox", viewBox);
  elements.overlay.setAttribute("viewBox", viewBox);
}

function render() {
  renderFilters();
  renderMarkers();
  renderRoute();
  renderPanel();
  renderSearchResults();
}

function setView(x, y, width) {
  const nextWidth = Math.max(520, Math.min(mapData.width, width));
  const nextHeight = (nextWidth * mapData.height) / mapData.width;
  state.view = {
    x: Math.max(0, Math.min(mapData.width - nextWidth, x)),
    y: Math.max(0, Math.min(mapData.height - nextHeight, y)),
    width: nextWidth,
    height: nextHeight,
  };
  renderView();
}

function fitMap() {
  setView(0, 0, mapData.width);
}

function zoomBy(factor, center) {
  const width = Math.max(520, Math.min(mapData.width, state.view.width * factor));
  const height = (width * mapData.height) / mapData.width;
  const centerX = center?.x ?? state.view.x + state.view.width / 2;
  const centerY = center?.y ?? state.view.y + state.view.height / 2;
  setView(centerX - width / 2, centerY - height / 2, width);
}

function focusPlace(place) {
  const width = 1120;
  setView(place.x - width / 2, place.y - (width * mapData.height) / mapData.width / 2, width);
  state.selectedPlaceId = place.id;
  state.search = "";
  elements.search.value = "";
  elements.search.blur();
  render();
}

function toggleStop(placeId) {
  if (state.selectedIds.includes(placeId)) {
    state.selectedIds = state.selectedIds.filter((id) => id !== placeId);
    if (state.startId === placeId) state.startId = visitorCenter.id;
  } else if (state.selectedIds.length >= 8) {
    showToast("路线最多选择 8 个地点");
    return;
  } else {
    state.selectedIds = [...state.selectedIds, placeId];
  }
  state.plan = null;
  render();
}

function planRoute() {
  if (state.selectedIds.length < 2 || state.selectedIds.length > 8) {
    showToast("请选择 2–8 个地点");
    return;
  }
  const plan = optimizeVisitOrder(
    routingGraph,
    state.selectedIds,
    state.startId,
    state.roundTrip
  );
  if (!plan) {
    state.plan = null;
    render();
    showToast("部分地点暂时无法通过现有路网连通，请调整地点后重试");
    return;
  }
  state.plan = plan;
  state.selectedPlaceId = null;
  render();
  showToast("已按现有园区路网规划访问顺序");
}

function closeSearch() {
  state.search = "";
  elements.search.value = "";
  renderSearchResults();
}

function onPanelClick(event) {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.removeStop) {
    toggleStop(button.dataset.removeStop);
    return;
  }
  const placeId = button.dataset.placeId;
  switch (button.dataset.action) {
    case "toggle-stop":
      if (placeId) toggleStop(placeId);
      break;
    case "set-start":
      if (placeId) {
        state.startId = placeId;
        state.plan = null;
        showToast(`已将「${placeById.get(placeId).name}」设为起点`);
        render();
      }
      break;
    case "plan-route":
      planRoute();
      break;
    case "clear-stops":
      state.selectedIds = [];
      state.plan = null;
      render();
      break;
    case "clear-route":
      state.plan = null;
      state.selectedIds = [];
      render();
      break;
    case "edit-route":
      state.plan = null;
      render();
      break;
    case "find-places":
      elements.search.focus();
      showToast("搜索地点或点选地图标记");
      break;
    case "dismiss-detail":
      state.selectedPlaceId = null;
      render();
      break;
    default:
      break;
  }
}

elements.back.addEventListener("click", () => {
  window.location.href = "./#/main";
});
elements.help.addEventListener("click", () => elements.helpDialog.showModal());
elements.closeHelp.addEventListener("click", () => elements.helpDialog.close());
elements.helpDialog.addEventListener("click", (event) => {
  if (event.target === elements.helpDialog) elements.helpDialog.close();
});
elements.filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  render();
});
elements.search.addEventListener("input", () => {
  state.search = elements.search.value;
  renderSearchResults();
  renderMarkers();
});
elements.search.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSearch();
  if (event.key === "Enter") {
    const first = elements.searchResults.querySelector("[data-search-place]");
    if (first) focusPlace(placeById.get(first.dataset.searchPlace));
  }
});
elements.searchResults.addEventListener("click", (event) => {
  const result = event.target.closest("[data-search-place]");
  if (result) focusPlace(placeById.get(result.dataset.searchPlace));
});
elements.clearSearch.addEventListener("click", closeSearch);
elements.panel.addEventListener("click", onPanelClick);
elements.panel.addEventListener("change", (event) => {
  if (event.target.id === "startPlace") {
    state.startId = event.target.value;
    state.plan = null;
    render();
  } else if (event.target.id === "roundTrip") {
    state.roundTrip = event.target.checked;
    state.plan = null;
    render();
  }
});
elements.stage.addEventListener("click", (event) => {
  if (state.didDrag) {
    state.didDrag = false;
    return;
  }
  const marker = event.target.closest("[data-place-id]");
  if (!marker || marker.getAttribute("aria-disabled") === "true") return;
  const place = placeById.get(marker.dataset.placeId);
  if (!place) return;
  state.selectedPlaceId = state.selectedPlaceId === place.id ? null : place.id;
  render();
});
elements.stage.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const marker = event.target.closest("[data-place-id]");
  if (!marker || marker.getAttribute("aria-disabled") === "true") return;
  event.preventDefault();
  state.selectedPlaceId = marker.dataset.placeId;
  render();
});
elements.stage.addEventListener("click", (event) => {
  const action = event.target.closest("[data-map-action]")?.dataset.mapAction;
  if (!action) return;
  if (action === "zoom-in") zoomBy(0.78);
  if (action === "zoom-out") zoomBy(1.28);
  if (action === "fit") fitMap();
  if (action === "locate") {
    focusPlace(visitorCenter);
    showToast("已回到游客中心附近");
  }
});
elements.stage.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    zoomBy(event.deltaY < 0 ? 0.88 : 1.14);
  },
  { passive: false }
);
elements.stage.addEventListener("pointerdown", (event) => {
  if (
    event.target.closest("[data-place-id]") ||
    event.target.closest("[data-map-action]")
  ) {
    return;
  }
  state.didDrag = false;
  elements.stage.setPointerCapture(event.pointerId);
  elements.stage.dataset.dragStartX = String(event.clientX);
  elements.stage.dataset.dragStartY = String(event.clientY);
  elements.stage.dataset.dragViewX = String(state.view.x);
  elements.stage.dataset.dragViewY = String(state.view.y);
});
elements.stage.addEventListener("pointermove", (event) => {
  if (!elements.stage.hasPointerCapture(event.pointerId)) return;
  const rect = elements.stage.getBoundingClientRect();
  const mapWidth = Math.min(rect.width, rect.height * 0.75);
  const mapHeight = mapWidth / 0.75;
  const dx = event.clientX - Number(elements.stage.dataset.dragStartX);
  const dy = event.clientY - Number(elements.stage.dataset.dragStartY);
  if (Math.abs(dx) + Math.abs(dy) > 4) state.didDrag = true;
  const scaleX = state.view.width / mapWidth;
  const scaleY = state.view.height / mapHeight;
  setView(
    Number(elements.stage.dataset.dragViewX) - dx * scaleX,
    Number(elements.stage.dataset.dragViewY) - dy * scaleY,
    state.view.width
  );
});
elements.stage.addEventListener("pointerup", (event) => {
  if (elements.stage.hasPointerCapture(event.pointerId)) {
    elements.stage.releasePointerCapture(event.pointerId);
  }
});
elements.stage.addEventListener("pointercancel", (event) => {
  if (elements.stage.hasPointerCapture(event.pointerId)) {
    elements.stage.releasePointerCapture(event.pointerId);
  }
});

render();
renderView();
