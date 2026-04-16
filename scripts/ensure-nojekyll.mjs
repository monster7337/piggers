import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";

if (process.env.STATIC_EXPORT !== "true") {
  process.exit(0);
}

const outDir = path.join(process.cwd(), "out");

if (!existsSync(outDir)) {
  process.exit(0);
}

writeFileSync(path.join(outDir, ".nojekyll"), "");
