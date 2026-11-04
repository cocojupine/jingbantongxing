const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a, b, t) => a + (b - a) * t;

export function cubicPoint(curve, t) {
  const u = 1 - t;
  return {
    x:
      u ** 3 * curve.start.x +
      3 * u ** 2 * t * curve.control1.x +
      3 * u * t ** 2 * curve.control2.x +
      t ** 3 * curve.end.x,
    y:
      u ** 3 * curve.start.y +
      3 * u ** 2 * t * curve.control1.y +
      3 * u * t ** 2 * curve.control2.y +
      t ** 3 * curve.end.y,
  };
}

function splitCubic(curve, t) {
  const p01 = {
    x: lerp(curve.start.x, curve.control1.x, t),
    y: lerp(curve.start.y, curve.control1.y, t),
  };
  const p12 = {
    x: lerp(curve.control1.x, curve.control2.x, t),
    y: lerp(curve.control1.y, curve.control2.y, t),
  };
  const p23 = {
    x: lerp(curve.control2.x, curve.end.x, t),
    y: lerp(curve.control2.y, curve.end.y, t),
  };
  const p012 = {
    x: lerp(p01.x, p12.x, t),
    y: lerp(p01.y, p12.y, t),
  };
  const p123 = {
    x: lerp(p12.x, p23.x, t),
    y: lerp(p12.y, p23.y, t),
  };
  const middle = {
    x: lerp(p012.x, p123.x, t),
    y: lerp(p012.y, p123.y, t),
  };
  return [
    { start: curve.start, control1: p01, control2: p012, end: middle },
    { start: middle, control1: p123, control2: p23, end: curve.end },
  ];
}

function cubicSlice(curve, from, to) {
  if (from <= 0 && to >= 1) return curve;
  const left = to >= 1 ? curve : splitCubic(curve, to)[0];
  return from <= 0 ? left : splitCubic(left, from / to)[1];
}

function cubicLength(curve) {
  let length = 0;
  let previous = curve.start;
  for (let step = 1; step <= 24; step += 1) {
    const point = cubicPoint(curve, step / 24);
    length += distance(previous, point);
    previous = point;
  }
  return length;
}

function closestPointOnCubic(point, curve) {
  let bestT = 0;
  let bestDistance = Infinity;
  const samples = 48;
  for (let step = 0; step <= samples; step += 1) {
    const t = step / samples;
    const gap = distance(point, cubicPoint(curve, t));
    if (gap < bestDistance) {
      bestT = t;
      bestDistance = gap;
    }
  }
  let low = Math.max(0, bestT - 1 / samples);
  let high = Math.min(1, bestT + 1 / samples);
  for (let step = 0; step < 18; step += 1) {
    const left = low + (high - low) / 3;
    const right = high - (high - low) / 3;
    if (distance(point, cubicPoint(curve, left)) <= distance(point, cubicPoint(curve, right))) {
      high = right;
    } else {
      low = left;
    }
  }
  bestT = (low + high) / 2;
  const projected = cubicPoint(curve, bestT);
  return { t: bestT, point: projected, distance: distance(point, projected) };
}

function reverseCurve(curve) {
  return {
    start: curve.end,
    control1: curve.control2,
    control2: curve.control1,
    end: curve.start,
  };
}

function addNode(graph, id, point) {
  graph.positions.set(id, point);
  if (!graph.adjacency.has(id)) graph.adjacency.set(id, []);
}

function addEdge(graph, edge) {
  graph.adjacency.get(edge.from).push({ edge, reverse: false });
  graph.adjacency.get(edge.to).push({ edge, reverse: true });
}

export function buildRoutingGraph(network, places) {
  const graph = { adjacency: new Map(), positions: new Map() };
  const nodeById = new Map(network.nodes.map((node) => [node.id, node]));
  for (const node of network.nodes) addNode(graph, node.id, node);

  const curves = network.edges.map((edge) => ({
    edge,
    curve: {
      start: nodeById.get(edge.a),
      control1: edge.control1,
      control2: edge.control2,
      end: nodeById.get(edge.b),
    },
    anchors: [],
  }));

  const attachmentByPlace = new Map();
  for (const place of places) {
    let nearest = null;
    for (const road of curves) {
      const projected = closestPointOnCubic(place, road.curve);
      if (!nearest || projected.distance < nearest.distance) {
        nearest = { road, ...projected };
      }
    }
    if (!nearest) continue;
    const anchorId =
      nearest.t < 0.00001
        ? nearest.road.edge.a
        : nearest.t > 0.99999
          ? nearest.road.edge.b
          : `road-anchor:${place.id}`;
    nearest.road.anchors.push({
      id: anchorId,
      place,
      t: nearest.t,
      point: nearest.point,
    });
    attachmentByPlace.set(place.id, { anchorId, point: nearest.point });
    addNode(graph, place.id, place);
    if (anchorId.startsWith("road-anchor:")) addNode(graph, anchorId, nearest.point);
    addEdge(graph, {
      from: place.id,
      to: anchorId,
      type: "access",
      length: distance(place, nearest.point),
      segment: { start: place, end: nearest.point },
    });
  }

  for (const road of curves) {
    const anchors = road.anchors.sort((a, b) => a.t - b.t);
    let previousT = 0;
    let previousId = road.edge.a;
    const stops = [
      ...anchors.map((anchor) => ({
        t: Math.max(0, Math.min(1, anchor.t)),
        id:
          anchor.t < 0.00001
            ? road.edge.a
            : anchor.t > 0.99999
              ? road.edge.b
              : anchor.id,
      })),
      { t: 1, id: road.edge.b },
    ];
    for (const stop of stops) {
      if (stop.t - previousT > 0.000001 && stop.id !== previousId) {
        const segment = cubicSlice(road.curve, previousT, stop.t);
        addEdge(graph, {
          from: previousId,
          to: stop.id,
          type: "road",
          length: cubicLength(segment),
          segment,
          roadId: road.edge.id,
        });
      } else if (stop.id !== previousId && stop.t < 0.99999) {
        const segment = cubicSlice(road.curve, stop.t, stop.t);
        addEdge(graph, {
          from: previousId,
          to: stop.id,
          type: "road",
          length: 0,
          segment,
          roadId: road.edge.id,
        });
      }
      previousT = stop.t;
      previousId = stop.id;
    }
  }
  return { ...graph, attachmentByPlace };
}

export function shortestPath(graph, startId, endId) {
  if (!graph.adjacency.has(startId) || !graph.adjacency.has(endId)) return null;
  const distances = new Map([[startId, 0]]);
  const previous = new Map();
  const visited = new Set();

  while (true) {
    let current = null;
    let best = Infinity;
    for (const [id, value] of distances) {
      if (!visited.has(id) && value < best) {
        current = id;
        best = value;
      }
    }
    if (current === null || current === endId) break;
    visited.add(current);
    for (const step of graph.adjacency.get(current)) {
      const next = step.reverse ? step.edge.from : step.edge.to;
      const nextDistance = best + step.edge.length;
      if (nextDistance < (distances.get(next) ?? Infinity)) {
        distances.set(next, nextDistance);
        previous.set(next, { id: current, step });
      }
    }
  }

  if (!distances.has(endId)) return null;
  const edges = [];
  let cursor = endId;
  while (cursor !== startId) {
    const prior = previous.get(cursor);
    if (!prior) return null;
    edges.unshift({ ...prior.step.edge, reverse: prior.step.reverse });
    cursor = prior.id;
  }
  return { distance: distances.get(endId), edges };
}

export function optimizeVisitOrder(graph, selectedIds, startId, roundTrip = false) {
  const uniqueIds = [...new Set(selectedIds)];
  if (!graph.adjacency.has(startId) || uniqueIds.some((id) => !graph.adjacency.has(id))) {
    return null;
  }
  const stops = uniqueIds.filter((id) => id !== startId);
  if (stops.length > 8) return null;
  const baseLegs = new Map();
  for (const id of stops) {
    const leg = shortestPath(graph, startId, id);
    if (!leg) return null;
    baseLegs.set(`${startId}|${id}`, leg);
  }
  const pairLegs = new Map();
  for (const from of stops) {
    for (const to of stops) {
      if (from === to) continue;
      const leg = shortestPath(graph, from, to);
      if (!leg) return null;
      pairLegs.set(`${from}|${to}`, leg);
    }
  }

  if (!stops.length) {
    return {
      order: [startId, ...(roundTrip ? [startId] : [])],
      legs: roundTrip ? [shortestPath(graph, startId, startId)] : [],
      distance: 0,
      edges: [],
    };
  }

  let states = new Map();
  stops.forEach((id, index) => {
    const leg = baseLegs.get(`${startId}|${id}`);
    states.set(`${1 << index}:${index}`, { cost: leg.distance, order: [index] });
  });
  const fullMask = (1 << stops.length) - 1;

  for (let mask = 1; mask <= fullMask; mask += 1) {
    for (let last = 0; last < stops.length; last += 1) {
      const state = states.get(`${mask}:${last}`);
      if (!state) continue;
      for (let next = 0; next < stops.length; next += 1) {
        if (mask & (1 << next)) continue;
        const leg = pairLegs.get(`${stops[last]}|${stops[next]}`);
        const nextMask = mask | (1 << next);
        const key = `${nextMask}:${next}`;
        const cost = state.cost + leg.distance;
        if (cost < (states.get(key)?.cost ?? Infinity)) {
          states.set(key, { cost, order: [...state.order, next] });
        }
      }
    }
  }

  let best = null;
  for (let last = 0; last < stops.length; last += 1) {
    const state = states.get(`${fullMask}:${last}`);
    if (!state) continue;
    const returnLeg = roundTrip
      ? shortestPath(graph, stops[last], startId)
      : null;
    if (roundTrip && !returnLeg) continue;
    const cost = state.cost + (returnLeg?.distance ?? 0);
    if (!best || cost < best.cost) {
      best = { ...state, cost, returnLeg };
    }
  }
  if (!best) return null;

  const orderedStops = best.order.map((index) => stops[index]);
  const order = [startId, ...orderedStops];
  if (roundTrip) order.push(startId);
  const legs = [];
  let current = startId;
  for (const next of orderedStops) {
    legs.push(baseLegs.get(`${startId}|${next}`) && current === startId
      ? baseLegs.get(`${startId}|${next}`)
      : pairLegs.get(`${current}|${next}`));
    current = next;
  }
  if (roundTrip) legs.push(best.returnLeg);
  return {
    order,
    legs,
    distance: best.cost,
    edges: legs.flatMap((leg) => leg.edges),
  };
}

export function routeEdgePath(edge) {
  if (edge.type === "access") {
    const start = edge.reverse ? edge.segment.end : edge.segment.start;
    const end = edge.reverse ? edge.segment.start : edge.segment.end;
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }
  const curve = edge.reverse ? reverseCurve(edge.segment) : edge.segment;
  return `M ${curve.start.x} ${curve.start.y} C ${curve.control1.x} ${curve.control1.y}, ${curve.control2.x} ${curve.control2.y}, ${curve.end.x} ${curve.end.y}`;
}
