import { readFile, writeFile, readdir, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { build } from "esbuild";

const source = await readFile("legacy/original-app.js", "utf8");
const expectedHash =
  "435fadabb85a3aa6be1beaf9b5db8d0e81ec54aa2b222502a6cfcd2c94f855d0";
if (createHash("sha256").update(source).digest("hex") !== expectedHash) {
  throw new Error(
    "The preserved legacy baseline changed; review the compatibility mapping before rebuilding.",
  );
}
const ast = parse(source, { ecmaVersion: "latest", sourceType: "module" });
const replacements = [];
for (const filename of await readdir("src/legacy")) {
  if (!filename.endsWith(".js")) continue;
  const replacement = await readFile(`src/legacy/${filename}`, "utf8");
  const declaration = parse(replacement, {
    ecmaVersion: "latest",
    sourceType: "module",
  }).body[0];
  const node = ast.body.find(
    (node) =>
      node.type === "FunctionDeclaration" &&
      node.id.name === declaration.id.name,
  );
  if (!node) throw new Error(`Legacy function missing: ${filename}`);
  replacements.push({ start: node.start, end: node.end, replacement });
}
let output = source;
for (const patch of replacements.sort((a, b) => b.start - a.start)) {
  output =
    output.slice(0, patch.start) + patch.replacement + output.slice(patch.end);
}
const bootstrap = 'P2.createRoot(document.getElementById("root"))';
if (output.split(bootstrap).length !== 2)
  throw new Error("Unexpected bootstrap count");
output =
  'import { createEnhancements } from "./enhancements.js";\n' +
  output.replace(
    bootstrap,
    "const WhaleUI = createEnhancements({ React: d, useNavigate: Mr, useLocation: ao, useSearchParams: Y0, Frame: Rr, StatusBar: oo, ProfileModal: aR, Modal: Tr, useApp: zl.useApp, venues: I0, stories: H0, shows: j2 });\n" +
      bootstrap,
  );
parse(output, { ecmaVersion: "latest", sourceType: "module" });
await build({
  entryPoints: ["src/enhancements.jsx"],
  outfile: "鲸伴同行-demo-发布包/assets/enhancements.js",
  bundle: true,
  format: "esm",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  target: "es2020",
  sourcemap: false,
});
await writeFile("鲸伴同行-demo-发布包/assets/app.js", output);
await copyFile("src/styles.css", "鲸伴同行-demo-发布包/assets/fixes.css");
console.log(
  `Built ${replacements.length} editable functions + enhancements. Legacy SHA256 ${createHash("sha256").update(source).digest("hex")}`,
);
