"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const port = 48771;

const markdown = fs.readFileSync(
  path.join(projectRoot, "sample", "arabic-sample.md"),
  "utf8"
);
const catalogs = Object.fromEntries(["en", "ar"].map((locale) => [
  locale, JSON.parse(fs.readFileSync(path.join(projectRoot, "_locales", locale, "messages.json"), "utf8"))
]));
const previewScripts = `<script>globalThis.RTLMarkdownPreviewCatalogs = ${JSON.stringify(catalogs).replaceAll("<", "\\u003c")};</script>
    <script src="/tests/i18n-mock.js"></script>
    <script src="/tests/popup-browser-mock.js"></script>`;

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Integration test</title>
    <link rel="stylesheet" href="/src/content.css">
  </head>
  <body>
    <pre>${escapeHtml(markdown)}</pre>
    ${previewScripts}
    <script src="/vendor/purify.min.js"></script>
    <script src="/vendor/marked.umd.js"></script>
    <script src="/vendor/highlight.min.js"></script>
    <script src="/src/shared.js"></script>
    <script src="/src/i18n.js"></script>
    <script src="/src/content.js"></script>
  </body>
</html>`;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8"
};

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent((request.url || "/").split("?")[0]);
  if (requestPath === "/integration.md") {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(html);
    return;
  }

  if (requestPath === "/popup/preview.html") {
    const popup = fs.readFileSync(path.join(projectRoot, "popup", "popup.html"), "utf8");
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(popup.replace(
      '<script src="../src/shared.js"></script>',
      `${previewScripts}\n    $&`
    ));
    return;
  }
  const filePath = path.resolve(projectRoot, `.${requestPath}`);
  if (!filePath.startsWith(`${projectRoot}${path.sep}`)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`http://127.0.0.1:${port}/integration.md\n`);
  process.stdout.write(`http://127.0.0.1:${port}/popup/preview.html\n`);
  process.stdout.write(`http://127.0.0.1:${port}/popup/preview.html?lang=ar&active\n`);
  process.stdout.write(`http://127.0.0.1:${port}/integration.md?lang=ar\n`);
});

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
