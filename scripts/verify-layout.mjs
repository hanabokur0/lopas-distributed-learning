import { existsSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const required = [
  "src/learning/rii.ts",
  "src/learning/local-outcome.ts",
  "src/distributed/evidence.ts",
  "src/distributed/pilot.ts",
  "src/receipts/integrity.ts",
  "src/receipts/store.ts",
  "tests/smoke.mjs",
  ".github/workflows/ci.yml",
  ".github/workflows/contracts.yml",
];

const errors = [];

for (const path of required) {
  if (!existsSync(path)) {
    errors.push(`missing required path: ${path}`);
  }
}

if (existsSync("docs/.github")) {
  errors.push(
    "docs/.github must not exist; GitHub workflows belong in .github/workflows/"
  );
}

function walk(dir) {
  if (!existsSync(dir)) return;

  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = relative(".", full).replaceAll("\\", "/");

    for (const segment of rel.split("/")) {
      if (segment !== segment.trim()) {
        errors.push(`path contains leading/trailing whitespace: "${rel}"`);
      }
    }

    if (statSync(full).isDirectory()) {
      walk(full);
      continue;
    }

    if (rel.startsWith("src/") && extname(rel) !== ".ts") {
      errors.push(`src file must use .ts: ${rel}`);
    }

    if (rel.startsWith("docs/") && extname(rel) !== ".md") {
      errors.push(`docs file must use .md: ${rel}`);
    }

    if (
      rel.startsWith("schemas/") &&
      name !== "README.md" &&
      !rel.endsWith(".schema.json")
    ) {
      errors.push(`schema must use .schema.json: ${rel}`);
    }

    if (
      rel.startsWith("examples/") &&
      name !== "README.md" &&
      extname(rel) !== ".json"
    ) {
      errors.push(`example must use .json: ${rel}`);
    }
  }
}

for (const dir of ["src", "tests", "docs", "schemas", "examples", ".github"]) {
  walk(dir);
}

if (errors.length) {
  console.error("Repository layout verification failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("repository layout OK");
