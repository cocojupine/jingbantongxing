import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(
  root,
  "map_demo",
  "ocean-park-map-restyled-hd-map-project.json"
);
const outputPath = path.join(
  root,
  "鲸伴同行-demo-发布包",
  "assets",
  "map-data.json"
);

const project = JSON.parse(await readFile(sourcePath, "utf8"));
const data = {
  width: project.width,
  height: project.height,
  places: project.items
    .filter((item) => item.kind === "place")
    .map(({ id, name, x, y, number, tags = [] }) => ({
      id,
      name,
      x,
      y,
      number,
      tags,
    })),
  network: {
    nodes: project.network.nodes.map(({ id, label, x, y }) => ({
      id,
      label,
      x,
      y,
    })),
    edges: project.network.edges.map(
      ({ id, a, b, control1, control2 }) => ({
        id,
        a,
        b,
        control1,
        control2,
      })
    ),
  },
};

if (
  data.width !== 1800 ||
  data.height !== 2400 ||
  data.places.length !== 24 ||
  data.network.nodes.length !== 39 ||
  data.network.edges.length !== 42
) {
  throw new Error("Unexpected park map dimensions or network data.");
}

await writeFile(outputPath, `${JSON.stringify(data)}\n`);
console.log(
  `Exported ${data.places.length} places, ${data.network.nodes.length} nodes, and ${data.network.edges.length} roads.`
);
