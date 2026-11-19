import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  rmSync,
} from "node:fs";
import path from "node:path";

// Usage: node scripts/build-npm-archive.mjs [VERSION]
// Run from repository root. Existing files are never modified.
const root = process.cwd();
const version = process.argv[2] ?? "0.1.0";
const output = path.join(root, ".npm-build", "retro-icons-archive");
const licenseNotice = path.join(root, "LICENSES.md");
if (!existsSync(licenseNotice))
  throw new Error("LICENSES.md missing from repository root");
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
const exports = {};
const collections = [];
let sheetCount = 0;
for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (
    !entry.isDirectory() ||
    entry.name.startsWith(".") ||
    ["scripts", "node_modules", "custom-cursor"].includes(entry.name)
  )
    continue;
  const source = path.join(root, entry.name);
  const styles = readdirSync(source)
    .filter((f) => f.endsWith(".css"))
    .sort();
  if (!styles.length) continue;
  const target = path.join(output, entry.name);
  mkdirSync(target, { recursive: true });
  const included = new Set();
  for (const cssName of styles) {
    const css = readFileSync(path.join(source, cssName), "utf8");
    included.add(cssName);
    for (const match of css.matchAll(/url\(\s*['"]?([^)'"?#]+)[^)]*\)/g)) {
      const ref = match[1].trim();
      if (/^(?:[a-z]+:|\/|#)/i.test(ref))
        throw new Error(`Unsupported URL in ${entry.name}/${cssName}: ${ref}`);
      const normalized = path.posix.normalize(ref.replaceAll("\\", "/"));
      if (normalized === ".." || normalized.startsWith("../"))
        throw new Error(`Out-of-folder CSS URL: ${ref}`);
      if (!existsSync(path.join(source, normalized)))
        throw new Error(`Missing asset: ${entry.name}/${normalized}`);
      included.add(normalized);
    }
    exports[`./${entry.name}/${cssName}`] = `./${entry.name}/${cssName}`;
    sheetCount++;
  }
  for (const filename of included) {
    const dest = path.join(target, filename);
    mkdirSync(path.dirname(dest), { recursive: true });
    copyFileSync(path.join(source, filename), dest);
    if (!filename.endsWith(".css"))
      exports[`./${entry.name}/${filename}`] = `./${entry.name}/${filename}`;
  }
  for (const f of [
    "README.md",
    "original-README.txt",
    "original-readme.txt",
    "original-licence.txt",
  ]) {
    if (existsSync(path.join(source, f)))
      copyFileSync(path.join(source, f), path.join(target, f));
  }
  collections.push(entry.name);
}
if (!collections.length)
  throw new Error(
    "No collection CSS files found. Run from the retro-icons repository root.",
  );
copyFileSync(licenseNotice, path.join(output, "LICENSES.md"));
const pkg = {
  name: "@claserna/retro-icons-archive",
  version,
  description: "Retro icon CSS sprite sheets organized by collection",
  license: "SEE LICENSE IN LICENSES.md",
  files: [...collections, "README.md", "LICENSES.md"],
  exports,
  sideEffects: ["**/*.css"],
  publishConfig: { access: "public" },
};
writeFileSync(
  path.join(output, "package.json"),
  JSON.stringify(pkg, null, 2) + "\n",
);
writeFileSync(
  path.join(output, "README.md"),
  `# Retro Icons Archive\n\nInstall: \`npm install @claserna/retro-icons-archive\`\n\nImport a stylesheet: \`import '@claserna/retro-icons-archive/famfamfam/silk.css';\`\n\nUse an icon: \`<span class="silk-add"></span>\`\n\nCollections: ${collections.join(", ")}.\n\nSee LICENSES.md for per-collection copyright and redistribution terms.\n`,
);
console.log(
  `Built @claserna/retro-icons-archive@${version} with ${collections.length} collections and ${sheetCount} CSS files at .npm-build/retro-icons-archive`,
);
console.log(
  "Before publishing: verify redistribution terms, especially FamFamFam Mini and third-party Fugue icons.",
);

