// Serve o dist/ como o Static Web Apps serviria (fallback para index.html nas rotas do SPA).
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = "dist";
const port = Number(process.env.PORT ?? 4173);
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json", ".png": "image/png" };

createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(root, path);
  if (!existsSync(file) || statSync(file).isDirectory()) {
    file = existsSync(join(file, "index.html")) && !path.startsWith("/mfe-") ? join(file, "index.html") : join(root, "index.html");
  }
  res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream", "access-control-allow-origin": "*" });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`MovieHub em http://localhost:${port}`));
