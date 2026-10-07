#!/usr/bin/env node
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const port = Number(process.env.PORT || 8787);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf",
  ".pkpass": "application/vnd.apple.pkpass",
  ".json": "application/json",
};

createServer((req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${port}`);
  let path = url.pathname === "/" ? "/badge.html" : url.pathname;
  const candidates = [
    join(publicDir, path),
    join(root, "dist", path.replace(/^\//, "")),
    join(root, "assets", path.replace(/^\//, "")),
  ];
  const file = candidates.find((p) => existsSync(p));
  if (!file) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const body = readFileSync(file);
  res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
  res.end(body);
}).listen(port, () => {
  console.log(`VORPC badge preview: http://localhost:${port}/`);
  console.log(`Open that URL on your iPhone (same network) for the digital badge.`);
});
