import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const devCachePath = resolve(".next", "dev");

if (existsSync(devCachePath)) {
  rmSync(devCachePath, { recursive: true, force: true });
  console.log("Removed .next/dev cache");
}
