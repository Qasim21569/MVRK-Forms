/**
 * Serve the static export the way Bluehost will: as plain files mounted at
 * /forms. Used to verify the build, not part of it.
 *
 *   node scripts/serve-out.mjs [port]
 *
 * Logs every 404 so a missing asset shows up here rather than in a console
 * the day after deploy.
 */
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const BASE = "/forms";
const PORT = Number(process.argv[2] || 4321);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  let path = decodeURIComponent(url.pathname);

  if (path === BASE) {
    res.writeHead(302, { Location: `${BASE}/` });
    res.end();
    return;
  }
  if (!path.startsWith(`${BASE}/`)) {
    console.log(`404 (outside basePath) ${req.url}`);
    res.writeHead(404).end("Not found");
    return;
  }

  path = path.slice(BASE.length);
  let file = join(OUT, path);

  if (existsSync(file) && statSync(file).isDirectory()) {
    file = join(file, "index.html");
  } else if (!existsSync(file) && existsSync(`${file}.html`)) {
    file = `${file}.html`;
  }

  if (!existsSync(file) || statSync(file).isDirectory()) {
    console.log(`404 ${req.url}`);
    res.writeHead(404, { "Content-Type": "text/html" });
    createReadStream(join(OUT, "404.html")).pipe(res);
    return;
  }

  res.writeHead(200, {
    "Content-Type": TYPES[extname(file)] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`out/ served at http://localhost:${PORT}${BASE}/`);
});
