import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  buildRoutingGraph,
  optimizeVisitOrder,
  routeEdgePath,
  shortestPath,
} from "../鲸伴同行-demo-发布包/assets/map-routing.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(
  await readFile(
    path.join(root, "鲸伴同行-demo-发布包", "assets", "map-data.json"),
    "utf8"
  )
);

const straightEdge = (id, a, b, start, end) => ({
  id,
  a,
  b,
  control1: { x: start.x + (end.x - start.x) / 3, y: start.y + (end.y - start.y) / 3 },
  control2: { x: start.x + (end.x - start.x) * 2 / 3, y: start.y + (end.y - start.y) * 2 / 3 },
});

test("the published map data stays lightweight and preserves project counts", () => {
  assert.equal(data.width, 1800);
  assert.equal(data.height, 2400);
  assert.equal(data.places.length, 24);
  assert.equal(data.network.nodes.length, 39);
  assert.equal(data.network.edges.length, 42);
  assert.ok(!Object.hasOwn(data, "imageData"));
});

test("map locations attach to curved roads with visible access segments", () => {
  const graph = buildRoutingGraph(data.network, data.places);
  for (const place of data.places) {
    const access = graph.adjacency.get(place.id);
    assert.ok(access?.some(({ edge }) => edge.type === "access"), place.name);
  }
  assert.ok(graph.adjacency.size > data.network.nodes.length + data.places.length);
  const first = data.places[0];
  const destination = data.places[2];
  const route = shortestPath(graph, first.id, destination.id);
  assert.ok(route);
  assert.ok(route.edges.some((edge) => edge.type === "access"));
  assert.ok(route.distance > 0);
});

test("the park map planner supports eight stops and keeps the app entry wired", async () => {
  const graph = buildRoutingGraph(data.network, data.places);
  const start = data.places[0];
  const eightStops = data.places.slice(1, 9).map((place) => place.id);
  const plan = optimizeVisitOrder(graph, eightStops, start.id);
  assert.ok(plan);
  assert.equal(new Set(plan.order).size, 9);
  assert.equal(
    optimizeVisitOrder(graph, data.places.slice(1, 10).map((place) => place.id), start.id),
    null
  );

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const entrySource = await readFile(
    path.join(root, "鲸伴同行-demo-发布包", "assets", "map-entry.mjs"),
    "utf8"
  );
  const repairSource = await readFile(
    path.join(root, "鲸伴同行-demo-发布包", "assets", "ui-repairs.js"),
    "utf8"
  );
  assert.match(entrySource, /\.tab-map/);
  assert.match(repairSource, /import\("\.\/map-entry\.mjs"\)/);
});

test("visit planning minimizes a fixed-start route and supports a return leg", () => {
  const nodes = [
    { id: "A", x: 0, y: 0 },
    { id: "B", x: 100, y: 0 },
    { id: "C", x: 200, y: 0 },
  ];
  const places = [
    { id: "start", name: "起点", x: 0, y: 10, tags: ["venue"] },
    { id: "near", name: "中间地点", x: 100, y: 10, tags: ["leisure"] },
    { id: "far", name: "远处地点", x: 200, y: 10, tags: ["venue"] },
  ];
  const network = {
    nodes,
    edges: [
      straightEdge("AB", "A", "B", nodes[0], nodes[1]),
      straightEdge("BC", "B", "C", nodes[1], nodes[2]),
    ],
  };
  const graph = buildRoutingGraph(network, places);
  const open = optimizeVisitOrder(graph, ["far", "near"], "start");
  assert.ok(open);
  assert.deepEqual(open.order, ["start", "near", "far"]);
  assert.ok(open.edges.some((edge) => edge.type === "access"));

  const closed = optimizeVisitOrder(graph, ["far", "near"], "start", true);
  assert.ok(closed);
  assert.deepEqual(closed.order, ["start", "near", "far", "start"]);
  assert.ok(closed.distance > open.distance);
});

test("route geometry keeps access links dashed and road legs on Bezier curves", () => {
  assert.equal(
    routeEdgePath({
      type: "access",
      reverse: false,
      segment: { start: { x: 1, y: 2 }, end: { x: 3, y: 4 } },
    }),
    "M 1 2 L 3 4"
  );
  assert.match(
    routeEdgePath({
      type: "road",
      reverse: true,
      segment: {
        start: { x: 0, y: 0 },
        control1: { x: 10, y: 5 },
        control2: { x: 20, y: 5 },
        end: { x: 30, y: 0 },
      },
    }),
    /M 30 0 C 20 5, 10 5, 0 0/
  );
});

test("the published map filters dining spots and shows mock venue details", async () => {
  const assetRoot = path.join(root, "鲸伴同行-demo-发布包", "assets");
  const [pageSource, styleSource, htmlSource] = await Promise.all([
    readFile(path.join(assetRoot, "map-design-page.mjs"), "utf8"),
    readFile(path.join(assetRoot, "map-design.css"), "utf8"),
    readFile(path.join(root, "鲸伴同行-demo-发布包", "map-design.html"), "utf8"),
  ]);
  const visibleWithoutDiningOrLeisure = new Set([
    "venue",
    "entrance",
    "restroom",
    "gift",
  ]);
  const hiddenByDefault = data.places.filter(
    (place) =>
      (place.tags.includes("dining") || place.tags.includes("leisure")) &&
      !place.tags.some((tag) => visibleWithoutDiningOrLeisure.has(tag))
  );

  assert.deepEqual(
    hiddenByDefault.map((place) => place.name),
    ["美人鱼餐厅", "休闲餐吧", "休闲餐吧"]
  );
  assert.match(pageSource, /matchesDefaultView/);
  assert.match(pageSource, /state\.search\.trim\(\).*matchesSearch/s);
  assert.match(pageSource, /const MOCK_VENUE_INFO/);
  assert.doesNotMatch(pageSource, /placeSummary\.textContent\s*=\s*`地图编号/);
  assert.doesNotMatch(pageSource, /<small>地图编号 \$\{place\.number\}/);
  assert.match(styleSource, /\.map-place-card\.is-suppressed\s*\{\s*display:\s*none/s);
  assert.match(styleSource, /\.map-place-card\.is-selected \.place-chip-bg[\s\S]*?stroke:\s*#0b78dc !important/);
  assert.match(styleSource, /\.profile-button[\s\S]*?linear-gradient/);
  assert.match(styleSource, /\.place-card\s*\{[\s\S]*?linear-gradient/);
  assert.match(htmlSource, /场馆介绍/);
  assert.match(htmlSource, /场馆推荐度/);
  assert.match(htmlSource, /class="recommend-stars"/);
  assert.match(htmlSource, /class="venue-intro-section"/);
  assert.match(htmlSource, /class="service-types" id="serviceTypes"/);
  assert.doesNotMatch(htmlSource, />服务类型</);
  assert.match(pageSource, /const ICON_SHAPES/);
  assert.match(pageSource, /function iconFor\(place\)/);
  assert.match(pageSource, /visitorCenter:\s*\{[\s\S]*M-19-4h38v23/);
  assert.match(pageSource, /name\.includes\("游客中心"\)\) return ICON_SHAPES\.visitorCenter/);
  assert.match(pageSource, /function placeIconMarkup\(place\)/);
  assert.doesNotMatch(pageSource, /emojiFor|place-icon-emoji/);
  assert.match(pageSource, /mapScale:\s*1\.25/);
  assert.match(pageSource, /elements\.mapMarkers\.append\(elements\.location\)/);
  assert.match(pageSource, /focusPlace\(demoLocation,\s*1\.25\)/);
  assert.match(pageSource, /state\.mapScale - 1/);
  assert.match(htmlSource, /class="my-location" transform="translate\(361 1714\) scale\(1\.55\)"/);
  assert.match(htmlSource, /mapMarkers\.append\(mapMarkers\.querySelector\("\.my-location"\)\)/);
  assert.match(htmlSource, /let mapScale = 1\.25/);
  assert.match(htmlSource, /requestAnimationFrame\(\(\) => document\.querySelector\("\[data-locate\]"\)\.click\(\)\)/);
  assert.match(pageSource, /const routeVisible =[\s\S]*state\.selectedIds\.includes\(place\.id\)/);
  assert.match(pageSource, /marker\.classList\.toggle\("is-route-hidden", !routeVisible\)/);
  assert.match(pageSource, /place\.id !== visitorCenter\.id[\s\S]*!place\.tags\.includes\("entrance"\)/);
  assert.match(pageSource, /elements\.routeStops\.append\(stops\)/);
  assert.match(pageSource, /elements\.mapMarkers\.append\(elements\.routeStops\)/);
  assert.match(pageSource, /querySelectorAll\("\.map-place-card, \.my-location, \.route-stop"\)/);
  assert.match(pageSource, /`\$\{baseTransform\} scale\(\$\{1 \/ state\.mapScale\}\)`/);
  assert.match(pageSource, /class="itinerary-remove"[\s\S]*<svg viewBox="0 0 24 24"/);
  assert.match(pageSource, /classList\.toggle\(\s*"has-itinerary",\s*state\.routeActive && state\.selectedIds\.length > 0/s);
  assert.doesNotMatch(pageSource, /elements\.routeStart|elements\.roundTrip|roundTrip:/);
  assert.match(htmlSource, /class="route-layer" id="routeStops"/);
  assert.match(htmlSource, /const hidden = active && entries\.length > 0 && !itinerary\.has/);
  assert.match(htmlSource, /mapView\.classList\.toggle\("has-itinerary", active && entries\.length > 0\)/);
  assert.match(styleSource, /\.map-place-card\.is-route-hidden\s*\{\s*display:\s*none/s);
  assert.match(styleSource, /\.has-itinerary \.map-place-card\.is-route-hidden\s*\{\s*display:\s*none !important/s);
  assert.match(styleSource, /\.route-line\s*\{[^}]*stroke-width:\s*15/s);
  assert.doesNotMatch(styleSource, /\.route-line\s*\{[^}]*stroke-dasharray/s);
  assert.match(styleSource, /\.route-access\s*\{[^}]*stroke-width:\s*11/s);
  assert.doesNotMatch(styleSource, /\.route-access\s*\{[^}]*stroke-dasharray/s);
  assert.match(styleSource, /\.itinerary-dialog\[open\]\s*\{[^}]*display:\s*flex/s);
  assert.match(styleSource, /\.itinerary-place strong\s*\{/);
  assert.match(styleSource, /\.itinerary-remove svg\s*\{/);
  assert.match(styleSource, /\.itinerary-start-note\s*\{/);
  assert.doesNotMatch(htmlSource, /id="routeStart"|id="roundTrip"|返回起点/);
  for (const icon of [
    "capybara",
    "dolphin",
    "penguin",
    "seal",
    "whale",
    "manatee",
    "wolf",
    "bear",
    "otter",
    "jellyfish",
    "dining",
    "restroom",
    "entrance",
    "gift",
    "leisure",
  ]) {
    assert.match(pageSource, new RegExp(`\\b${icon}:\\s*\\{`));
  }
});
