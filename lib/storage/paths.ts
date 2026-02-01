import os from "os";
import path from "path";
import fs from "fs";

export function getDataDir() {
  const dir = path.join(os.homedir(), ".vibemd");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getExportsDir() {
  const dir = path.join(getDataDir(), "exports");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}
