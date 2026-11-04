import {
  buildRoutingGraph,
  optimizeVisitOrder,
  routeEdgePath,
} from "./map-routing.mjs";

if (new URLSearchParams(window.location.search).get("mode") === "app") {
document.title = "园区地图 · 鲸伴同行";
const SVG_NS = "http://www.w3.org/2000/svg";
const TAGS = {
  venue: "场馆",
  dining: "餐饮",
  leisure: "休闲",
  gift: "礼品",
  restroom: "卫生间",
  entrance: "出入口",
};
const MOCK_VENUE_INFO = {
  游客中心: {
    description: "园区游览服务的起点，可先了解地图与行程安排。",
    services: ["游览咨询", "行程指引", "休息补给"],
    rating: 5,
  },
  钱塘江流域: {
    description: "以水域生态为主题的展示区域，适合放慢节奏观察。",
    services: ["主题展览", "生态观察", "休息区域"],
    rating: 5,
  },
  美人鱼餐厅: {
    description: "提供用餐与短暂休息的空间，可按游览节奏安排停留。",
    services: ["餐饮", "休息区域"],
    rating: 4,
  },
  公园入口: {
    description: "园区主要出入口，适合作为集合与行程起点。",
    services: ["出入口", "集合点"],
    rating: 5,
  },
  梦幻水母宫: {
    description: "围绕水母主题布置的展示空间，适合近距离观赏。",
    services: ["主题展览", "卫生间"],
    rating: 5,
  },
  海象剧场: {
    description: "海象主题演出与科普展示空间，演出安排以现场信息为准。",
    services: ["动物展示", "演出空间"],
    rating: 5,
  },
  海牛馆: {
    description: "以海牛为主题的观赏区域，可安排轻松短暂停留。",
    services: ["动物展示", "休息区域"],
    rating: 5,
  },
  水豚部落: {
    description: "水豚主题观赏区域，可从舒适的参观节奏开始探索。",
    services: ["动物展示", "卫生间"],
    rating: 5,
  },
  北极狼谷: {
    description: "以北极狼为主题的展示区域，适合了解动物习性。",
    services: ["动物展示", "科普介绍"],
    rating: 4,
  },
  "水獭 海狸鼠馆": {
    description: "水獭与海狸鼠主题展示区域，可观察动物活动。",
    services: ["动物展示", "科普介绍"],
    rating: 5,
  },
  海象馆: {
    description: "海象主题场馆，适合近距离观察并了解相关知识。",
    services: ["动物展示", "科普介绍"],
    rating: 5,
  },
  北海狮馆: {
    description: "北海狮主题展示区域，可结合现场安排参观。",
    services: ["动物展示", "休息区域"],
    rating: 4,
  },
  雨林海豚湾: {
    description: "海豚主题展示区域，带来雨林与海洋相结合的观赏体验。",
    services: ["动物展示", "科普介绍"],
    rating: 5,
  },
  "海狮剧场 鲸鱼天地": {
    description: "海狮与鲸类主题展示区域，演出安排以现场信息为准。",
    services: ["动物展示", "演出空间", "餐饮"],
    rating: 5,
  },
  白鲸海: {
    description: "白鲸主题观赏区域，可按个人节奏慢慢游览。",
    services: ["动物展示", "礼品", "卫生间"],
    rating: 5,
  },
  企鹅岛: {
    description: "企鹅主题观赏区域，适合观察企鹅的生活状态。",
    services: ["动物展示", "礼品", "卫生间"],
    rating: 5,
  },
  棕熊馆: {
    description: "棕熊主题展示区域，可了解动物特点与生活习性。",
    services: ["动物展示", "科普介绍"],
    rating: 4,
  },
  北极熊馆: {
    description: "北极熊主题展示区域，可结合园区导览安排参观。",
    services: ["动物展示", "科普介绍"],
    rating: 5,
  },
  海豹馆: {
    description: "海豹主题展示区域，可在游览途中安排停留。",
    services: ["动物展示", "卫生间"],
    rating: 5,
  },
  杭州长乔海洋研学院: {
    description: "海洋主题学习与探索空间，适合了解海洋相关知识。",
    services: ["科普学习", "主题活动", "卫生间"],
    rating: 5,
  },
  入口卫生间: {
    description: "靠近入口的便民服务点，可在入园前后灵活使用。",
    services: ["卫生间"],
    rating: 4,
  },
  休闲餐吧: {
    description: "供游客休息与补充能量的空间，可按需要安排停留。",
    services: ["餐饮", "休息区域"],
    rating: 4,
  },
  卫生间: {
    description: "园区便民服务点，可在游览途中使用。",
    services: ["卫生间"],
    rating: 4,
  },
};
const elements = {
  app: document.querySelector(".design-app"),
  filterToggle: document.querySelector("#filterToggle"),
  filters: document.querySelector("#filterOptions"),
  search: document.querySelector("#placeSearch"),
  searchResults: document.querySelector("#searchResults"),
  mapView: document.querySelector(".map-view"),
  mapScene: document.querySelector(".map-scene"),
  mapMarkers: document.querySelector(".map-markers"),
  routeLayer: document.querySelector(".route-layer"),
  routeStops: document.querySelector("#routeStops"),
  location: document.querySelector(".my-location"),
  card: document.querySelector(".place-card"),
  placeDetails: document.querySelector("#placeDetails"),
  placeType: document.querySelector("#placeType"),
  placeName: document.querySelector("#placeName"),
  placeSummary: document.querySelector("#placeSummary"),
  placeDescription: document.querySelector("#placeDescription"),
  placeIcon: document.querySelector("#placeCardIconGlyph"),
  serviceTypes: document.querySelector("#serviceTypes"),
  rating: document.querySelector(".recommend-row"),
  ratingStars: document.querySelector("#placeRating"),
  addToPlan: document.querySelector("#addToPlan"),
  itineraryToggle: document.querySelector("#itineraryToggle"),
  itineraryCount: document.querySelector("#itineraryCount"),
  routeNote: document.querySelector("#routeNote"),
  routeNoteTitle: document.querySelector("#routeNoteTitle"),
  routeNoteText: document.querySelector("#routeNoteText"),
  recommendDialog: document.querySelector("#recommendDialog"),
  recommendForm: document.querySelector("#recommendForm"),
  recommendClose: document.querySelector("#recommendClose"),
  itineraryDialog: document.querySelector("#itineraryDialog"),
  itineraryClose: document.querySelector("#itineraryClose"),
  itineraryList: document.querySelector("#itineraryList"),
  planRoute: document.querySelector("#planRouteButton"),
  clearItinerary: document.querySelector("#clearItineraryButton"),
  mascot: document.querySelector(".ai-mascot-fab"),
};

const response = await fetch("./assets/map-data.json");
if (!response.ok) throw new Error("Unable to load the park map data.");
const mapData = await response.json();
const places = mapData.places;
const demoLocation = {
  id: "demo-location",
  name: "我的位置",
  x: 361,
  y: 1714,
  number: 0,
  tags: [],
};
const routeStarts = [demoLocation, ...places];
const placeById = new Map(routeStarts.map((place) => [place.id, place]));
const visitorCenter =
  places.find((place) => place.name === "游客中心") ?? places[0];
const routingGraph = buildRoutingGraph(mapData.network, routeStarts);
const state = {
  category: "all",
  search: "",
  selectedPlaceId: null,
  selectedIds: [],
  startId: demoLocation.id,
  plan: null,
  routeActive: false,
  mapOffset: { x: 0, y: 0 },
  mapScale: 1.25,
  drag: null,
  suppressMapClick: false,
  toastTimer: 0,
  routeHeadline: "",
};

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
const tagNames = (place) =>
  place.tags.map((tag) => TAGS[tag]).filter(Boolean);
const categoryLabels = (place) =>
  tagNames(place).join(" · ") || "园区地点";
const matchesCategory = (place) =>
  state.category === "all" || place.tags.includes(state.category);
const hasMapPlaceType = (place) =>
  ["venue", "gift", "leisure"].some((tag) =>
    place.tags.includes(tag)
  );
const matchesSearch = (place) => {
  const query = state.search.trim().toLocaleLowerCase("zh-CN");
  return !query || `${place.name} ${tagNames(place).join(" ")}`
    .toLocaleLowerCase("zh-CN")
    .includes(query);
};
const ICON_SHAPES = {
  visitorCenter: {
    paths: [
      "M-19-4h38v23h-38z",
      "M-23-4l5-13h36l5 13",
      "M-23-4c0 5 9 5 9 0 0 5 9 5 9 0 0 5 9 5 9 0 0 5 9 5 9 0",
      "M-8 19V7H8v12",
      "M0-13v5m0 4v.1",
    ],
    circles: [[0, -15, 1.1]],
  },
  capybara: {
    paths: [
      "M-21 9c-2-4-2-10 0-15 2-5 7-9 14-9 5 0 9 2 12 6l4 6 8 2c4 1 6 4 6 8v4h-7l-2 6h-4l-2-6H-8l-2 6h-4l-1-6h-2c-3 0-4-1-4-2Z",
      "M-2-13c2-4 7-4 9 0m-3 4h.1m7 8 4 1",
    ],
    circles: [[4, -6, 1]],
  },
  school: {
    paths: [
      "m-21-7 21-12L21-7H-21Zm4 4v17m9-17v17m16-17v17M-22 16h44M-25 21h50",
      "M-12 8c4-3 8 3 12 0s8 3 12 0",
    ],
  },
  dolphin: {
    paths: [
      "M-22 1C-14-9-4-12 7-7l9-8-2 10c5 2 8 4 11 8-7-1-11 2-16 6C-1 17-14 12-20 5l-5 5 2-8Z",
      "M-8 6c5 3 10 3 15 0m-6 5-3 5",
    ],
    circles: [[10, -3, 1]],
  },
  penguin: {
    paths: [
      "M0-21C-10-21-15-12-14-1l2 16c7 7 17 7 24 0l2-16C15-12 10-21 0-21Z",
      "M-8-2c1 7 3 12 8 15 5-3 7-8 8-15M-3-5 0-2l3-3m-11 22-5 4 7-1m14-3 5 4-7-1",
    ],
    circles: [[-4, -9, 1], [4, -9, 1]],
  },
  seal: {
    paths: [
      "M-20 2C-20-10-12-18 0-18S20-10 20 2c0 11-8 17-20 17S-20 13-20 2Z",
      "M-11 2c2-5 6-7 11-7s9 2 11 7c-1 7-5 11-11 11S-10 9-11 2Zm-3 7-8 2m9 2-7 4m26-8 8 2m-9 2 7 4",
      "m-7 8 2 11 3-9m9-2-2 11-3-9",
    ],
    circles: [[-7, -6, 1], [7, -6, 1]],
  },
  whale: {
    paths: [
      "M-22 2c2-11 12-18 24-16 8 1 13 6 16 13l9-7-3 12 3 10-10-5c-4 6-11 9-20 8C-14 16-21 10-22 2Z",
      "M-5-13c3-4 7-5 11-5M-2 7c3 2 7 2 10 0m-15-1 5 11",
    ],
    circles: [[9, -5, 1]],
  },
  manatee: {
    paths: [
      "M-21 1c3-12 14-18 27-13 8 3 13 10 13 18-5-4-10-4-15 0-8 7-19 8-25 1l-5 8 1-14Z",
      "M-7 5c5 3 11 3 16 0",
    ],
    circles: [[8, -5, 1]],
  },
  wolf: {
    paths: [
      "m-17-13 8 4Q0-15 9-9l8-4-2 12 4 14-9-5Q0 20-10 8l-9 5 4-14Z",
      "M-7 2q7 6 14 0m-7 2v5",
    ],
    circles: [[-7, -4, 1], [7, -4, 1]],
  },
  bear: {
    paths: [
      "M-20-8a7 7 0 0 1 14-5q6-3 12 0a7 7 0 0 1 14 5v13a20 20 0 0 1-40 0Z",
      "M-9 4q9-7 18 0v7q-9 8-18 0Z",
    ],
    circles: [[-10, -2, 1], [10, -2, 1], [0, 7, 1.3]],
  },
  otter: {
    paths: [
      "M0-21c10 0 16 9 14 20l-3 18h-9l-2-10-2 10h-9l-3-18C-16-12-10-21 0-21Z",
      "M-9-3q9-8 18 0v9q-9 8-18 0Z",
    ],
    circles: [[-5, 0, 1], [5, 0, 1], [0, 5, 1]],
  },
  jellyfish: {
    paths: [
      "M-20 3a20 20 0 0 1 40 0H-20Zm0 0q5 7 10 0 5 7 10 0 5 7 10 0 5 7 10 0",
      "M-13 10v9m8-7v10m10-10v10m8-12v9",
    ],
  },
  dining: {
    paths: [
      "M-12-20v12m-6-12v9a6 6 0 0 0 12 0v-9M-12-3v23M9-20v40M9-20c10 8 10 17 0 21",
    ],
  },
  restroom: {
    paths: [
      "M-13-18h10v9h-10Zm-5 11h28l-3 10a10 10 0 0 1-20 0Zm5 20v7m12-7v7",
    ],
  },
  entrance: {
    paths: ["M-14 21v-39h28v39M-8 21V-9l16-4v34M-22 21h44"],
    circles: [[3, 3, 1]],
  },
  gift: {
    paths: [
      "M-19-5h38v25h-38Zm-3-8h44v8h-44Zm22 0v33m0-33c-12 1-17-3-13-8 4-4 10 2 13 8Zm0 0c12 1 17-3 13-8-4-4-10 2-13 8Z",
    ],
  },
  leisure: {
    paths: [
      "M-21-9q7-7 14 0t14 0 14 0M-21 1q7-7 14 0t14 0 14 0M-21 11q7-7 14 0t14 0 14 0",
    ],
  },
  fish: {
    paths: [
      "M-21 0c9-12 22-12 34 0C1 12-12 12-21 0Zm34 0 9-8v16Zm-17-5q5 5 0 10",
    ],
    circles: [[5, -2, 1]],
  },
};

function iconFor(place) {
  const name = place.name;
  if (name.includes("游客中心")) return ICON_SHAPES.visitorCenter;
  if (name.includes("水豚")) return ICON_SHAPES.capybara;
  if (name.includes("研学院")) return ICON_SHAPES.school;
  if (name.includes("海豚")) return ICON_SHAPES.dolphin;
  if (name.includes("企鹅")) return ICON_SHAPES.penguin;
  if (name.includes("海象") || name.includes("海狮") || name.includes("海豹")) {
    return ICON_SHAPES.seal;
  }
  if (name.includes("白鲸") || name.includes("鲸")) return ICON_SHAPES.whale;
  if (name.includes("海牛")) return ICON_SHAPES.manatee;
  if (name.includes("狼")) return ICON_SHAPES.wolf;
  if (name.includes("熊")) return ICON_SHAPES.bear;
  if (name.includes("水獭") || name.includes("海狸")) return ICON_SHAPES.otter;
  if (name.includes("水母")) return ICON_SHAPES.jellyfish;
  if (place.tags.includes("dining")) return ICON_SHAPES.dining;
  if (place.tags.includes("restroom")) return ICON_SHAPES.restroom;
  if (place.tags.includes("entrance")) return ICON_SHAPES.entrance;
  if (place.tags.includes("gift")) return ICON_SHAPES.gift;
  if (place.tags.includes("leisure")) return ICON_SHAPES.leisure;
  return ICON_SHAPES.fish;
}

function placeIcon(place, x = 0, y = 0) {
  const shape = iconFor(place);
  const icon = svgElement("g", {
    class: "place-line-icon",
    transform: `translate(${x} ${y})`,
  });
  shape.paths.forEach((d) => icon.append(svgElement("path", { d })));
  (shape.circles ?? []).forEach(([cx, cy, r]) =>
    icon.append(svgElement("circle", { cx, cy, r }))
  );
  return icon;
}

function placeIconMarkup(place) {
  const shape = iconFor(place);
  const paths = shape.paths.map((d) => `<path d="${d}"/>`).join("");
  const circles = (shape.circles ?? [])
    .map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`)
    .join("");
  return `<svg class="search-result-icon" viewBox="0 0 48 48" aria-hidden="true">${paths}${circles}</svg>`;
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, String(value));
  }
  return element;
}

function showToast(message) {
  elements.routeNoteTitle.textContent = message;
  elements.routeNoteText.textContent = "";
  elements.routeNote.hidden = false;
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    renderRouteNote();
  }, 2100);
}

const ANIMAL_IMAGES = {
  "企鹅岛": "penguin-right.png",
  "梦幻水母宫": "jellyfish.png",
  "海象剧场": "walrus.png",
  "海象馆": "walrus-front.png",
  "海牛馆": "manatee.png",
  "水豚部落": "capybara-big.png",
  "北极狼谷": "wolf-sit.png",
  "水獭 海狸鼠馆": "otter-1.png",
  "北海狮馆": "sealion-light.png",
  "海狮剧场 鲸鱼天地": "sealion-dark.png",
  "白鲸海": "beluga.png",
  "海豹馆": "seal-spotted.png",
  "雨林海豚湾": "dolphin.png",
  "棕熊馆": "brown-bear.png",
  "北极熊馆": "polar-bear.png",
  "游客中心": "gift.png",
  "美人鱼餐厅": "dining.png",
  "公园入口": "entrance.png",
  "入口卫生间": "restroom.png",
  "休闲餐吧": "rest.png",
  "卫生间": "restroom.png",
  "钱塘江流域": "river-fish.png",
  "杭州长乔海洋研学院": "academy.png",
};

function markerWidth(place) {
  return Math.max(170, Math.min(440, [...place.name].length * 46 + 24));
}

const PLACE_CARD_HEIGHT = 210;
const PLACE_IMAGE_SIZE = 120;
const PLACE_DOT_GAP = 20;
const PLACE_MARKER_SCALE = 1.3;
const CARD_ZOOM_THRESHOLD = 1.6;
const MAX_MAP_SCALE = 2.16;

function renderMarkers() {
  elements.mapMarkers.querySelectorAll("[data-place]").forEach((marker) => marker.remove());
  const fragment = document.createDocumentFragment();

  for (const place of places) {
    const width = markerWidth(place);
    const matchesDefaultView =
      hasMapPlaceType(place) ||
      (Boolean(state.search.trim()) && matchesSearch(place));
    const visible =
      matchesCategory(place) &&
      (state.category !== "all" || matchesDefaultView);
    const routeVisible =
      !state.routeActive ||
      !state.selectedIds.length ||
      state.selectedIds.includes(place.id) ||
      place.id === state.startId;
    const marker = svgElement("g", {
      class: "map-place-card",
      "data-place": "",
      "data-place-id": place.id,
      role: "button",
      tabindex: visible && routeVisible ? 0 : -1,
      "aria-pressed": place.id === state.selectedPlaceId,
      "aria-disabled": String(!visible || !routeVisible),
      "aria-hidden": String(!routeVisible),
      "aria-label": `${place.name}，${categoryLabels(place)}`,
      transform: `translate(${place.x} ${place.y}) scale(${PLACE_MARKER_SCALE})`,
    });
    marker.classList.toggle("is-muted", !visible && state.category !== "all");
    marker.classList.toggle("is-suppressed", !visible && state.category === "all");
    marker.classList.toggle("is-route-hidden", !routeVisible);

    // 透明命中区，保证缩小（文字态）时地点仍可点击
    const hit = svgElement("circle", {
      class: "place-hit",
      cx: 0,
      cy: 0,
      r: 48,
    });

    // 地点位置圆点，标注精确坐标
    const dot = svgElement("circle", {
      class: "place-dot",
      cx: 0,
      cy: 12,
      r: 18,
    });

    // 信息卡片：圆形白色底 + 动物图；名称显示在圆圈下方（白底不含文字）
    const chip = svgElement("g", {
      class: "place-chip",
      transform: "translate(0 -163)",
    });
    const background = svgElement("circle", {
      class: "place-chip-bg",
      cx: 0,
      cy: 0,
      r: 100,
    });
    chip.append(background);

    const animalFile = ANIMAL_IMAGES[place.name];
    if (animalFile) {
      chip.append(
        svgElement("image", {
          class: "place-animal",
          href: `./assets/animals/${animalFile}`,
          x: -95,
          y: -95,
          width: 190,
          height: 190,
          preserveAspectRatio: "xMidYMid meet",
          "clip-path": "url(#placeCircleClip)",
        })
      );
    } else {
      const fallback = svgElement("g", {
        class: "place-animal-fallback",
        transform: "scale(2)",
      });
      fallback.append(placeIcon(place, 0, 0));
      chip.append(fallback);
    }

    // 缩小（文字态）时仅显示文字标签
    const textOnly = svgElement("text", {
      class: "place-label-only",
      x: 0,
      y: -(PLACE_DOT_GAP + 14),
      "text-anchor": "middle",
    });
    textOnly.textContent = place.name;

    marker.append(hit, dot, chip, textOnly);
    fragment.append(marker);
  }

  elements.mapMarkers.append(fragment);
  elements.mapMarkers.append(elements.location);
  elements.mapMarkers.append(elements.routeStops);
  renderMarkerStates();
}

function renderMarkerStates() {
  elements.mapMarkers.querySelectorAll("[data-place-id]").forEach((marker) => {
    const id = marker.dataset.placeId;
    marker.classList.toggle("is-selected", id === state.selectedPlaceId);
    marker.classList.toggle("is-in-itinerary", state.selectedIds.includes(id));
    marker.setAttribute("aria-pressed", String(id === state.selectedPlaceId));
  });
  updateMarkerScale();
}

function updateMarkerScale() {
  elements.mapMarkers
    .querySelectorAll(".map-place-card, .my-location, .route-stop")
    .forEach((marker) => {
      const baseTransform =
        marker.dataset.baseTransform ?? marker.getAttribute("transform");
      if (!baseTransform) return;
      marker.dataset.baseTransform = baseTransform;
      const compensated = /scale\(([^)]+)\)/.test(baseTransform)
        ? baseTransform.replace(
            /scale\(([^)]+)\)/,
            (_, scale) => `scale(${Number(scale) / state.mapScale})`
          )
        : `${baseTransform} scale(${1 / state.mapScale})`;
      marker.setAttribute("transform", compensated);
    });
}

function renderSearchResults() {
  const query = state.search.trim().toLocaleLowerCase("zh-CN");
  elements.search.setAttribute("aria-expanded", String(Boolean(query)));
  if (!query) {
    elements.searchResults.hidden = true;
    elements.searchResults.replaceChildren();
    return;
  }

  const results = places
    .filter(
      (place) =>
        matchesCategory(place) &&
        `${place.name} ${tagNames(place).join(" ")}`
          .toLocaleLowerCase("zh-CN")
          .includes(query)
    )
    .slice(0, 8);
  elements.searchResults.hidden = false;
  elements.searchResults.innerHTML = results.length
    ? results
        .map(
          (place) => `
            <button class="search-result" type="button" role="option" data-search-place="${escapeHtml(place.id)}">
              ${placeIconMarkup(place)}
              <span><strong>${escapeHtml(place.name)}</strong><small>${escapeHtml(categoryLabels(place))}</small></span>
            </button>`
        )
        .join("")
    : '<p class="search-empty">没有匹配地点，请调整关键词或分类。</p>';
}

function clampMapOffset(x, y, scale = state.mapScale) {
  const bounds = elements.mapView.getBoundingClientRect();
  const maxX = (bounds.width * (scale - 1)) / 2;
  const maxY = (bounds.height * (scale - 1)) / 2;
  return {
    x: Math.max(-maxX, Math.min(maxX, x)),
    y: Math.max(-maxY, Math.min(maxY, y)),
  };
}

function applyMapTransform() {
  state.mapOffset = clampMapOffset(state.mapOffset.x, state.mapOffset.y);
  elements.mapScene.style.transform =
    `translate(${state.mapOffset.x}px, ${state.mapOffset.y}px) scale(${state.mapScale})`;
  updateMarkerScale();
  applyZoomMode();
}

function applyZoomMode() {
  elements.mapView.classList.toggle(
    "is-card-zoom",
    state.mapScale >= CARD_ZOOM_THRESHOLD
  );
}

function contentPoint(place) {
  const bounds = elements.mapView.getBoundingClientRect();
  const scale = Math.max(bounds.width / mapData.width, bounds.height / mapData.height);
  return {
    x: bounds.left + (bounds.width - mapData.width * scale) / 2 + place.x * scale,
    y: bounds.top + (bounds.height - mapData.height * scale) / 2 + place.y * scale,
  };
}

function focusPlace(place, zoom = 1.75) {
  const point = contentPoint(place);
  const bounds = elements.mapView.getBoundingClientRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height * 0.52;
  state.mapScale = Math.min(
    MAX_MAP_SCALE,
    Math.max(state.mapScale, zoom)
  );
  state.mapOffset = {
    x: -(point.x - centerX) * (state.mapScale - 1),
    y: -(point.y - centerY) * (state.mapScale - 1),
  };
  applyMapTransform();
}

function defaultCardIcon() {
  return svgElement("image", {
    class: "place-card-animal",
    href: "./assets/animals/route.png",
    x: -24,
    y: -24,
    width: 48,
    height: 48,
    preserveAspectRatio: "xMidYMid meet",
  });
}

function renderCard() {
  const hasItinerary = state.selectedIds.length > 0;
  if (!state.selectedPlaceId) {
    delete elements.card.dataset.placeId;
    elements.placeType.textContent = hasItinerary ? "游园行程" : "游园规划";
    elements.placeName.textContent = hasItinerary
      ? `已选 ${state.selectedIds.length} 个地点`
      : "还没有规划行程";
    elements.placeSummary.textContent = hasItinerary
      ? "点击「调整行程」查看或规划路线"
      : "在地图上选择地点加入规划";
    elements.placeDescription.textContent = "";
    elements.rating.hidden = true;
    elements.serviceTypes.replaceChildren();
    elements.placeIcon.replaceChildren(defaultCardIcon());
    elements.addToPlan.textContent = hasItinerary ? "调整行程" : "推荐行程";
    elements.addToPlan.disabled = false;
    elements.addToPlan.setAttribute("aria-pressed", "false");
    elements.addToPlan.classList.remove("is-added");
    return;
  }

  const place = placeById.get(state.selectedPlaceId);
  if (!place) return;
  const mockInfo = MOCK_VENUE_INFO[place.name] ?? {
    description: "园区便民服务点，具体安排以现场信息为准。",
    services: tagNames(place),
    rating: 4,
  };
  const isCurrent = place.id === state.startId;
  elements.card.dataset.placeId = place.id;
  elements.placeType.textContent = categoryLabels(place);
  elements.placeName.textContent = place.name;
  elements.placeSummary.textContent = `园区点位 · ${categoryLabels(place)}`;
  elements.placeDescription.textContent = mockInfo.description;
  elements.rating.hidden = false;
  elements.ratingStars.replaceChildren(
    ...Array.from({ length: 5 }, (_, index) => {
      const star = document.createElement("span");
      star.className = index < mockInfo.rating ? "is-filled" : "is-empty";
      star.textContent = "★";
      return star;
    })
  );
  elements.ratingStars.setAttribute(
    "aria-label",
    `${mockInfo.rating} 星，演示评分`
  );

  const animalFile = ANIMAL_IMAGES[place.name];
  if (animalFile) {
    elements.placeIcon.replaceChildren(
      svgElement("image", {
        class: "place-card-animal",
        href: `./assets/animals/${animalFile}`,
        x: -24,
        y: -24,
        width: 48,
        height: 48,
        preserveAspectRatio: "xMidYMid meet",
      })
    );
  } else {
    elements.placeIcon.replaceChildren(placeIcon(place, 0, 1));
  }
  elements.serviceTypes.replaceChildren(
    ...mockInfo.services.map((name) => {
      const tag = document.createElement("span");
      tag.className = "service-type";
      tag.textContent = name;
      return tag;
    })
  );

  const isAdded = state.selectedIds.includes(place.id);
  elements.addToPlan.textContent = isCurrent
    ? "路线起点"
    : isAdded
      ? "移出行程"
      : "加入规划";
  elements.addToPlan.disabled = isCurrent;
  elements.addToPlan.setAttribute("aria-pressed", String(isAdded));
  elements.addToPlan.classList.toggle("is-added", isAdded);
}

function routeArrows(lines) {
  const fragment = document.createDocumentFragment();
  const step = 220;
  for (const line of lines) {
    let total = 0;
    try {
      total = line.getTotalLength();
    } catch {
      total = 0;
    }
    if (!total || total < 90) continue;
    for (let pos = step * 0.55; pos < total - 10; pos += step) {
      const point = line.getPointAtLength(pos);
      const ahead = line.getPointAtLength(Math.min(pos + 4, total));
      const angle =
        (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
      const arrow = svgElement("g", {
        transform: `translate(${point.x} ${point.y}) rotate(${angle})`,
      });
      arrow.append(
        svgElement("path", {
          class: "route-arrow",
          d: "M 11.46 -3.54 Q 15 0 11.46 3.54 L -11.46 26.46 Q -15 30 -15 25 L -15 -25 Q -15 -30 -11.46 -26.46 Z",
        })
      );
      fragment.append(arrow);
    }
  }
  return fragment;
}

function renderRoute() {
  elements.routeLayer.replaceChildren();
  elements.routeStops.replaceChildren();
  elements.mapView.classList.toggle("route-active", state.routeActive);
  elements.mapView.classList.toggle(
    "has-itinerary",
    state.routeActive && state.selectedIds.length > 0
  );
  if (!state.plan) {
    renderMarkerStates();
    return;
  }

  const paths = document.createDocumentFragment();
  const routeLines = [];
  // 只绘制「当前位置 → 下一个目的地」这一段
  const nextLeg = state.plan.legs[0];
  for (const edge of nextLeg?.edges ?? []) {
    const d = routeEdgePath(edge);
    const access = edge.type === "access";
    const casing = svgElement("path", {
      class: access ? "route-access-casing" : "route-casing",
      d,
    });
    const line = svgElement("path", {
      class: access ? "route-access" : "route-line",
      d,
    });
    paths.append(casing, line);
    routeLines.push(line);
  }
  elements.routeLayer.append(paths);
  elements.routeLayer.append(routeArrows(routeLines));
  renderMarkerStates();
}

function renderItineraryDialog() {
  elements.itineraryList.innerHTML = state.selectedIds.length
    ? state.selectedIds
        .map((id, index) => {
          const place = placeById.get(id);
          return place
            ? `<div class="itinerary-stop"><strong class="itinerary-index">${index + 1}</strong><span class="itinerary-place"><strong>${escapeHtml(place.name)}</strong><small>${escapeHtml(categoryLabels(place))} · 地图点位 ${place.number}</small></span><button class="itinerary-remove" type="button" data-remove-stop="${escapeHtml(id)}" aria-label="移除${escapeHtml(place.name)}，地图点位 ${place.number}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m3 3v7m6-7v7"/></svg></button></div>`
            : "";
        })
        .join("")
    : '<p class="search-empty">行程为空。关闭此面板后，在地图上选择地点并加入规划。</p>';
  elements.planRoute.disabled = state.selectedIds.length < 1;
  elements.mapView.classList.toggle(
    "has-itinerary",
    state.routeActive && state.selectedIds.length > 0
  );
}

function renderItineraryCount() {
  elements.itineraryCount.textContent = String(state.selectedIds.length);
  elements.itineraryToggle.setAttribute(
    "aria-label",
    `显示行程路线，共 ${state.selectedIds.length} 个地点`
  );
  elements.itineraryToggle.setAttribute(
    "aria-pressed",
    String(state.routeActive)
  );
}

function renderRouteNote() {
  elements.mapView.classList.toggle("route-active", state.routeActive);
  elements.mapView.classList.toggle(
    "has-itinerary",
    state.routeActive && state.selectedIds.length > 0
  );
  if (state.routeActive && state.plan) {
    elements.routeNote.hidden = true;
    return;
  }
  if (!state.selectedIds.length && state.routeActive) {
    elements.routeNoteTitle.textContent = "行程还是空的";
    elements.routeNoteText.textContent = "选择地点加入规划，或生成推荐路线";
    elements.routeNote.hidden = false;
    return;
  }
  if (state.routeActive && state.selectedIds.length === 1) {
    elements.routeNoteTitle.textContent = "已选择 1 个地点";
    elements.routeNoteText.textContent = "再加入一个地点即可规划路线";
    elements.routeNote.hidden = false;
    return;
  }
  elements.routeNote.hidden = true;
}

function renderAll() {
  renderMarkers();
  renderSearchResults();
  renderCard();
  renderItineraryCount();
  renderRoute();
  renderRouteNote();
}

function openPlace(place) {
  state.selectedPlaceId = place.id;
  elements.card.classList.add("is-expanded");
  elements.placeDetails.classList.add("is-open");
  elements.placeDetails.setAttribute("aria-hidden", "false");
  elements.placeDetails.inert = false;
  elements.mapView.classList.add("details-open");
  renderCard();
  renderMarkerStates();
}

function closePlaceDetails() {
  elements.card.classList.remove("is-expanded");
  elements.placeDetails.classList.remove("is-open");
  elements.placeDetails.setAttribute("aria-hidden", "true");
  elements.placeDetails.inert = true;
  elements.mapView.classList.remove("details-open");
  state.selectedPlaceId = null;
  renderCard();
  renderMarkerStates();
}

function focusAndOpen(place) {
  state.search = "";
  elements.search.value = "";
  renderSearchResults();
  focusPlace(place);
  openPlace(place);
}

function toggleStop(placeId) {
  if (placeId === state.startId) {
    showToast("起点不会重复加入途经地点");
    return;
  }
  if (state.selectedIds.includes(placeId)) {
    state.selectedIds = state.selectedIds.filter((id) => id !== placeId);
  } else if (state.selectedIds.length >= 8) {
    showToast("行程最多选择 8 个地点");
    return;
  } else {
    state.selectedIds = [...state.selectedIds, placeId];
  }
  state.plan = null;
  state.routeActive = false;
  state.routeHeadline = "";
  renderAll();
  renderItineraryDialog();
}

function planRoute() {
  if (state.selectedIds.length < 1 || state.selectedIds.length > 8) {
    showToast("请选择 1–8 个地点");
    return false;
  }
  const plan = optimizeVisitOrder(
    routingGraph,
    state.selectedIds,
    state.startId,
    false
  );
  if (!plan) {
    showToast("部分地点无法通过现有路网连通，请调整地点后重试");
    return false;
  }
  state.plan = plan;
  state.routeActive = true;
  state.selectedPlaceId = null;
  elements.card.classList.remove("is-expanded");
  elements.placeDetails.classList.remove("is-open");
  elements.placeDetails.setAttribute("aria-hidden", "true");
  elements.placeDetails.inert = true;
  elements.mapView.classList.remove("details-open");
  renderAll();
  if (elements.itineraryDialog.open) elements.itineraryDialog.close();
  showToast("已规划游园路线 · 从我的位置出发");
  return true;
}

function recommendRoute(formData) {
  const duration = formData.get("duration");
  const style = formData.get("style");
  const stopLimits = { short: 2, medium: 4, long: 8 };
  const durationLabels = {
    short: "约 1 小时",
    medium: "2-3 小时",
    long: "半日游",
  };
  const otherPlaces = places.filter(
    (place) =>
      place.id !== visitorCenter.id &&
      place.name !== "游客中心" &&
      !place.tags.includes("entrance")
  );
  const prioritized =
    style === "shows"
      ? otherPlaces.filter((place) => /剧场|演出/.test(place.name))
      : style === "family"
        ? otherPlaces.filter((place) => place.tags.includes("venue"))
        : otherPlaces;
  const eligible = otherPlaces.filter(
    (place, index, list) =>
      list.findIndex((candidate) => candidate.id === place.id) === index
  );
  const candidates = [
    ...prioritized,
    ...eligible.filter((place) => !prioritized.includes(place)),
  ];
  const stops = candidates.slice(0, stopLimits[duration] ?? 2);
  if (stops.length < 2) {
    showToast("当前数据不足以生成推荐路线");
    return;
  }
  state.selectedIds = stops.map((place) => place.id);
  state.startId = demoLocation.id;
  state.routeHeadline =
    `偏好路线 · ${durationLabels[duration] ?? "按偏好选择"}（不估算实际时长）`;
  if (!planRoute()) return;
  elements.recommendDialog.close();
}

elements.filterToggle.addEventListener("click", () => {
  const expanded = elements.filterToggle.getAttribute("aria-expanded") === "true";
  elements.filterToggle.setAttribute("aria-expanded", String(!expanded));
  elements.filters.setAttribute("aria-hidden", String(expanded));
  elements.filters.inert = expanded;
  elements.filters.classList.toggle("is-open", !expanded);
  elements.app.classList.toggle("filters-open", !expanded);
});

elements.filters.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-category]");
  if (!chip) return;
  state.category = chip.dataset.category;
  elements.filters.querySelector(".is-active")?.classList.remove("is-active");
  chip.classList.add("is-active");
  renderMarkers();
  renderSearchResults();
});

elements.search.addEventListener("input", () => {
  state.search = elements.search.value;
  renderMarkers();
  renderSearchResults();
});
elements.search.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    state.search = "";
    elements.search.value = "";
    renderSearchResults();
  } else if (event.key === "Enter") {
    const first = elements.searchResults.querySelector("[data-search-place]");
    const place = first && placeById.get(first.dataset.searchPlace);
    if (place) focusAndOpen(place);
  }
});
elements.searchResults.addEventListener("click", (event) => {
  const result = event.target.closest("[data-search-place]");
  const place = result && placeById.get(result.dataset.searchPlace);
  if (place) focusAndOpen(place);
});

elements.mapMarkers.addEventListener("click", (event) => {
  const marker = event.target.closest("[data-place-id]");
  const place = marker && placeById.get(marker.dataset.placeId);
  if (place) openPlace(place);
});
elements.mapMarkers.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const marker = event.target.closest("[data-place-id]");
  const place = marker && placeById.get(marker.dataset.placeId);
  if (!place) return;
  event.preventDefault();
  openPlace(place);
});

elements.mapView.addEventListener("click", (event) => {
  if (state.suppressMapClick) {
    state.suppressMapClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
  if (!elements.card.classList.contains("is-expanded")) return;
  if (
    event.target.closest(
      ".place-card, .map-controls, .map-count, .route-note, .ai-mascot-fab, .map-place-card"
    )
  ) {
    return;
  }
  closePlaceDetails();
});
elements.mapView.addEventListener("pointerdown", (event) => {
  if (
    event.button !== 0 ||
    event.target.closest(
      "button, a, .place-card, .map-place-card, .route-note, .ai-mascot-fab"
    )
  ) {
    return;
  }
  state.drag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: state.mapOffset.x,
    offsetY: state.mapOffset.y,
    moved: false,
  };
});
elements.mapView.addEventListener("pointermove", (event) => {
  if (!state.drag || state.drag.pointerId !== event.pointerId) return;
  const dx = event.clientX - state.drag.startX;
  const dy = event.clientY - state.drag.startY;
  if (!state.drag.moved && Math.hypot(dx, dy) < 5) return;
  state.drag.moved = true;
  if (!elements.mapView.hasPointerCapture(event.pointerId)) {
    elements.mapView.setPointerCapture(event.pointerId);
  }
  elements.mapView.classList.add("is-dragging");
  state.mapOffset = clampMapOffset(
    state.drag.offsetX + dx,
    state.drag.offsetY + dy
  );
  applyMapTransform();
});
elements.mapView.addEventListener("pointerup", (event) => {
  if (!state.drag || state.drag.pointerId !== event.pointerId) return;
  if (state.drag.moved) {
    state.suppressMapClick = true;
    if (elements.mapView.hasPointerCapture(event.pointerId)) {
      elements.mapView.releasePointerCapture(event.pointerId);
    }
  }
  state.drag = null;
  elements.mapView.classList.remove("is-dragging");
});
elements.mapView.addEventListener("pointercancel", () => {
  state.drag = null;
  elements.mapView.classList.remove("is-dragging");
});

elements.mapView.querySelectorAll("[data-zoom]").forEach((button) => {
  button.addEventListener("click", () => {
    state.mapScale = Math.max(
      1,
      Math.min(MAX_MAP_SCALE, state.mapScale * (button.dataset.zoom === "in" ? 1.2 : 1 / 1.2))
    );
    applyMapTransform();
  });
});
document.querySelector("[data-locate]").addEventListener("click", () => {
  state.mapScale = Math.max(1.5, state.mapScale);
  state.mapOffset = { x: 0, y: 0 };
  focusPlace(demoLocation, 1.5);
  showToast("已定位到我的位置（静态演示）");
});
window.addEventListener("resize", applyMapTransform);

elements.addToPlan.addEventListener("click", () => {
  if (!state.selectedPlaceId) {
    if (!state.selectedIds.length) {
      elements.recommendDialog.showModal();
    } else {
      renderItineraryDialog();
      elements.itineraryDialog.showModal();
    }
    return;
  }
  if (state.selectedPlaceId === state.startId) {
    showToast(`${placeById.get(state.selectedPlaceId).name} 已是路线起点`);
    return;
  }
  toggleStop(state.selectedPlaceId);
});
elements.routeNote.addEventListener("click", () => {
  renderItineraryDialog();
  elements.itineraryDialog.showModal();
});

elements.itineraryToggle.addEventListener("click", () => {
  if (!state.selectedIds.length) {
    state.routeActive = !state.routeActive;
    renderMarkers();
    renderRouteNote();
    renderItineraryCount();
    return;
  }
  if (!state.plan && state.selectedIds.length >= 1) {
    planRoute();
    return;
  }
  state.routeActive = !state.routeActive;
  renderMarkers();
  renderRouteNote();
  renderItineraryCount();
});

elements.itineraryDialog.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-remove-stop]");
  if (remove) toggleStop(remove.dataset.removeStop);
});
elements.planRoute.addEventListener("click", planRoute);
elements.clearItinerary.addEventListener("click", () => {
  state.selectedIds = [];
  state.plan = null;
  state.routeActive = false;
  state.routeHeadline = "";
  renderAll();
  renderItineraryDialog();
});
elements.itineraryClose.addEventListener("click", () =>
  elements.itineraryDialog.close()
);
elements.recommendClose.addEventListener("click", () =>
  elements.recommendDialog.close()
);
for (const dialog of [elements.itineraryDialog, elements.recommendDialog]) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}
elements.recommendForm.addEventListener("submit", (event) => {
  event.preventDefault();
  recommendRoute(new FormData(elements.recommendForm));
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && elements.card.classList.contains("is-expanded")) {
    closePlaceDetails();
  }
});

document.querySelector(".back-button").addEventListener("click", () => {
  window.location.href = "./index.html#/main";
});
elements.mascot.addEventListener("click", () => {
  window.location.href = "./index.html#/chat";
});
document.querySelector("#profileButton").addEventListener("click", () => {
  window.location.href = "./index.html#/profile";
});

renderItineraryDialog();
renderAll();
focusPlace(demoLocation, 1.25);
}
