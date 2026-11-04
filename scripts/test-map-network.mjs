import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(path.join(root, "map_demo", "svg-map-editor.html"), "utf8");
const fixture = JSON.parse(readFileSync(
  path.join(root, "map_demo", "ocean-park-map-restyled-hd-map-project.json"), "utf8"
));
const names = [
  "escapeXml", "makeId", "placeTags", "categoryForTags", "networkNode", "edgeSegment",
  "edgePath", "networkDiagnostics", "isClosedRoad",
  "roadCurveSegments", "roadSegments", "splitCubic", "cubicPoint", "cubicLength",
  "reverseRouteGeometry", "buildRoutingGraph", "shortestPath", "optimizeVisitOrder",
  "routeGeometryPath",
  "migrateLegacyRoutes",
  "routeSnapTolerance", "closestPointOnEdge", "pickNetworkTarget", "nextNodeLabel",
  "splitEdge", "splitCrossingEdges", "realizeNetworkTarget", "existingEdge", "connectNodes", "resetConnection",
  "svgString", "safeBaseName", "saveProject", "openProject"
];
const state = {
  network: { nodes: [], edges: [] }, items: [], width: 1800, height: 2400,
  imageData: "", imageName: "map.png"
};
const downloads = [];
const context = createContext({ testState: state, downloads, Math, Date });
const tagDefinitions = html.match(/      const PLACE_TAGS = \{[\s\S]*?\n      \};/);
assert.ok(tagDefinitions, "missing place tag definitions");
const functions = names.map((name) => {
  const start = html.indexOf(`      ${name === "openProject" ? "async " : ""}function ${name}(`);
  assert.notEqual(start, -1, `missing ${name}`);
  const next = [
    html.indexOf("\n      function ", start + 1),
    html.indexOf("\n      async function ", start + 1),
    html.indexOf('\n      $("#loadImageButton")', start + 1)
  ].filter((index) => index >= 0);
  return html.slice(start, Math.min(...next));
}).join("\n");
runInContext(
  `const state = testState; const SVG_NS = "http://www.w3.org/2000/svg";\n${tagDefinitions[0]}\n` +
  `const $ = () => ({ value: "#0b78dc" });` +
  `const download = (...args) => downloads.push(args); const toast = () => {};` +
  `const render = () => {}; const elements = {` +
  `image: { classList: { add() {} } }, empty: { classList: { remove() {} } },` +
  `wrap: { classList: { remove() {} }, style: {} },` +
  `overlay: { setAttribute() {}, getBoundingClientRect: () => ({ width: 1800 }) }` +
  `};\n${functions}\n` +
  `globalThis.api = { ${names.join(", ")} };`,
  context
);
const api = context.api;
const legacyRoutes = [
  { id: "old-a", kind: "route", color: "#0b78dc",
    points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }] },
  { id: "old-b", kind: "route", color: "#2fa76b",
    points: [{ x: 100, y: 100 }, { x: 150, y: 150 }] }
].map((route) => ({ ...route, curveSegments: api.roadCurveSegments(route.points) }));

test("legacy saved roads become one graph without changing their Bezier handles", () => {
  const migrated = api.migrateLegacyRoutes(legacyRoutes);
  assert.equal(migrated.nodes.length, 4);
  assert.equal(migrated.edges.length, 3);
  const original = legacyRoutes.flatMap((route) => route.curveSegments);
  migrated.edges.forEach((edge, index) => {
    assert.equal(JSON.stringify(edge.control1), JSON.stringify(original[index].control1));
    assert.equal(JSON.stringify(edge.control2), JSON.stringify(original[index].control2));
    const start = migrated.nodes.find((node) => node.id === edge.a);
    const end = migrated.nodes.find((node) => node.id === edge.b);
    assert.equal(JSON.stringify({ x: start.x, y: start.y }), JSON.stringify(original[index].start));
    assert.equal(JSON.stringify({ x: end.x, y: end.y }), JSON.stringify(original[index].end));
  });
  const shared = migrated.nodes.filter((node) => node.x === 100 && node.y === 100);
  assert.equal(shared.length, 1);
  state.network = migrated;
  const diagnostics = api.networkDiagnostics();
  assert.equal(diagnostics.components.length, 1);
  assert.equal(migrated.edges.length - migrated.nodes.length + diagnostics.components.length, 0);
});

test("connectivity counts undirected branches, cycles, disconnected parts, and isolated nodes", () => {
  state.network = {
    nodes: ["A", "B", "C", "D", "E", "F"].map((id, index) => ({
      id, label: id, x: index * 100, y: 0
    })),
    edges: [
      ["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["A", "E"]
    ].map(([a, b], index) => ({ id: `e${index}`, a, b }))
  };
  let result = api.networkDiagnostics();
  assert.equal(result.components.length, 2);
  assert.equal(result.adjacency.get("A").size, 3);
  assert.equal(result.adjacency.get("F").size, 0);
  assert.equal(result.membership.get("A"), result.membership.get("E"));
  assert.notEqual(result.membership.get("A"), result.membership.get("F"));
  assert.equal(state.network.edges.length - state.network.nodes.length + result.components.length, 1);
  state.network.edges.push({ id: "bridge", a: "E", b: "F" });
  result = api.networkDiagnostics();
  assert.equal(result.components.length, 1);
  assert.equal(result.adjacency.get("F").has("E"), true);
  assert.equal(result.adjacency.get("E").has("F"), true);
});

test("splitting a curved edge creates a real junction without changing its shape", () => {
  const start = { id: "start", x: 0, y: 0 };
  const end = { id: "end", x: 120, y: 0 };
  const edge = {
    id: "curve", a: start.id, b: end.id,
    control1: { x: 20, y: 90 }, control2: { x: 95, y: -45 },
    color: "#0b78dc"
  };
  state.network = { nodes: [start, end], edges: [edge] };
  const original = api.edgeSegment(edge);
  const junction = api.cubicPoint(original, .4);
  const node = { id: "junction", ...junction };
  state.network.nodes.push(node);
  api.splitEdge(edge, node, .4);
  assert.equal(state.network.edges.length, 2);
  assert.equal(api.networkDiagnostics().adjacency.get("junction").size, 2);
  for (let step = 0; step <= 20; step += 1) {
    const t = step / 20;
    const split = t <= .4
      ? api.cubicPoint(api.edgeSegment(state.network.edges[0]), t / .4)
      : api.cubicPoint(api.edgeSegment(state.network.edges[1]), (t - .4) / .6);
    const expected = api.cubicPoint(original, t);
    assert.ok(Math.hypot(split.x - expected.x, split.y - expected.y) < 1e-8);
  }
});

test("clicking two crossing edges makes one shared node with four connections", () => {
  const nodes = [
    { id: "left", label: "P1", x: 0, y: 50 },
    { id: "right", label: "P2", x: 100, y: 50 },
    { id: "top", label: "P3", x: 50, y: 0 },
    { id: "bottom", label: "P4", x: 50, y: 100 }
  ];
  state.network = {
    nodes,
    edges: [
      {
        id: "horizontal", a: "left", b: "right",
        control1: { x: 33, y: 50 }, control2: { x: 67, y: 50 }
      },
      {
        id: "vertical", a: "top", b: "bottom",
        control1: { x: 50, y: 33 }, control2: { x: 50, y: 67 }
      }
    ]
  };
  const target = api.pickNetworkTarget({ x: 50, y: 50 }, true);
  assert.ok(target.split);
  const junction = api.realizeNetworkTarget(target);
  assert.equal(state.network.nodes.length, 5);
  assert.equal(state.network.edges.length, 4);
  assert.equal(api.networkDiagnostics().adjacency.get(junction.id).size, 4);
  assert.equal(api.networkDiagnostics().components.length, 1);
});

test("one node can connect to many others; reverse connection is the same edge", () => {
  state.network = {
    nodes: [0, 1, 2, 3, 4, 5].map((index) => ({
      id: `n${index}`, x: index * 100, y: index * 40
    })),
    edges: []
  };
  const hub = state.network.nodes[0];
  for (const node of state.network.nodes.slice(1)) {
    assert.ok(api.connectNodes(hub, node));
  }
  assert.equal(api.networkDiagnostics().adjacency.get(hub.id).size, 5);
  assert.equal(api.connectNodes(state.network.nodes[1], hub), null);
  assert.equal(state.network.edges.length, 5);
});

test("route planning measures curved roads by arc length", () => {
  const curve = {
    start: { x: 0, y: 0 }, control1: { x: 0, y: 100 },
    control2: { x: 100, y: 100 }, end: { x: 100, y: 0 }
  };
  const length = api.cubicLength(curve);
  assert.ok(length > 100);
  assert.ok(length < 200);
});

test("route planning optimizes stop order from a fixed start and supports return trips", () => {
  const previousNetwork = state.network;
  const previousItems = state.items;
  const previousRoutePlan = state.routePlan;
  const nodes = [0, 100, 200, 300].map((x, index) => ({
    id: `n${index}`, label: `P${index + 1}`, x, y: 0
  }));
  state.network = {
    nodes,
    edges: nodes.slice(1).map((node, index) => ({
      id: `line-${index}`, a: nodes[index].id, b: node.id,
      control1: { x: nodes[index].x + 100 / 3, y: 0 },
      control2: { x: node.x - 100 / 3, y: 0 }
    }))
  };
  state.items = [
    { id: "start", kind: "place", name: "起点", x: 5, y: 0 },
    { id: "last", kind: "place", name: "最远站", x: 295, y: 0 },
    { id: "middle-a", kind: "place", name: "中间站一", x: 105, y: 0 },
    { id: "middle-b", kind: "place", name: "中间站二", x: 195, y: 0 }
  ];
  const open = api.optimizeVisitOrder(
    ["start", "last", "middle-a", "middle-b"], "start", false
  );
  assert.deepEqual([...open.order], ["start", "middle-a", "middle-b", "last"]);
  assert.equal(open.legs.length, 3);
  assert.ok(Math.abs(open.distance - 290) < .1);

  const closed = api.optimizeVisitOrder(
    ["start", "last", "middle-a", "middle-b"], "start", true
  );
  assert.equal(closed.order[0], "start");
  assert.deepEqual([...closed.order].sort(), [...open.order].sort());
  assert.equal(closed.legs.length, 4);
  assert.ok(Math.abs(closed.distance - 580) < .1);
  state.routePlan = open;
  assert.match(api.svgString(false), /data-kind="planned-route"/);
  assert.match(api.svgString(false), /data-kind="route-step"/);
  state.network = previousNetwork;
  state.items = previousItems;
  state.routePlan = previousRoutePlan;
});

test("SVG exports undirected edge endpoints and v3 project saves graph separately", async () => {
  const xml = api.svgString(false);
  assert.match(xml, /viewBox="0 0 1800 2400"/);
  assert.match(xml, /data-network-directed="false"/);
  assert.match(xml, /data-kind="road-edge" data-node-a="n0" data-node-b="n1"/);
  assert.match(xml, /data-kind="road-node"/);
  assert.doesNotMatch(xml, /<polyline|data-from=|data-to=/);
  api.saveProject();
  const saved = JSON.parse(downloads.at(-1)[1]);
  assert.equal(saved.version, 3);
  assert.equal(saved.network.directed, false);
  assert.equal(saved.network.nodes.length, 6);
  assert.equal(saved.network.edges.length, 5);
  assert.deepEqual(saved.items, []);
  await api.openProject({ text: async () => JSON.stringify(saved) });
  assert.equal(state.network.nodes.length, 6);
  assert.equal(state.network.edges.length, 5);
  assert.equal(api.networkDiagnostics().components.length, 1);
});

test("opening the actual v1 project upgrades its roads without losing geometry", async () => {
  const oldProject = {
    format: "jingbantongxing-map-editor", version: 1,
    imageName: "old.png", imageData: "", width: 1800, height: 2400,
    items: legacyRoutes
  };
  await api.openProject({ text: async () => JSON.stringify(oldProject) });
  assert.equal(state.network.nodes.length, 4);
  assert.equal(state.network.edges.length, 3);
  assert.equal(state.items.length, 0);
  assert.equal(state.imageName, "old.png");
  assert.equal(JSON.stringify(state.network.edges[0].control1),
    JSON.stringify(legacyRoutes[0].curveSegments[0].control1));
});

test("current saved places retain their original fields and multitag values", async () => {
  assert.ok(fixture.version >= 2);
  const originalPlaces = fixture.items.filter((item) => item.kind === "place");
  await api.openProject({ text: async () => JSON.stringify({ ...fixture, imageData: "" }) });
  assert.equal(state.items.length, originalPlaces.length);
  assert.equal(state.network.nodes.length, fixture.network.nodes.length);
  assert.equal(state.network.edges.length, fixture.network.edges.length);
  for (const original of originalPlaces) {
    const upgraded = state.items.find((item) => item.id === original.id);
    assert.ok(upgraded, `missing place ${original.id}`);
    for (const field of ["name", "category", "number", "x", "y"]) {
      assert.equal(upgraded[field], original[field], `${original.id} changed ${field}`);
    }
    assert.deepEqual(
      [...upgraded.tags],
      [...api.placeTags(original)]
    );
  }
  const lounge = state.items.find((item) => item.category === "rest");
  lounge.tags = [...new Set([...lounge.tags, "gift"])];
  assert.equal(api.categoryForTags(lounge.tags), "rest");
  assert.match(
    api.svgString(false),
    new RegExp(`data-tags="${[...lounge.tags].join(",")}" data-category="rest"`)
  );
  api.saveProject();
  const saved = JSON.parse(downloads.at(-1)[1]);
  assert.equal(saved.version, 3);
  assert.equal(saved.items.length, fixture.items.length);
  assert.deepEqual(saved.items.find((item) => item.id === lounge.id).tags,
    [...lounge.tags]);
  await api.openProject({ text: async () => JSON.stringify(saved) });
  assert.deepEqual([...state.items.find((item) => item.id === lounge.id).tags],
    [...lounge.tags]);
});
