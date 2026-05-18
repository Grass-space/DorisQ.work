const fs = require("fs");
const http = require("http");
const path = require("path");

const port = 8080;
const root = process.cwd();
const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".woff2": "font/woff2"
};

http
  .createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const decodedPath = decodeURIComponent(url.pathname);
    const pathname =
      decodedPath === "/" || decodedPath.endsWith("/")
        ? `${decodedPath}index.html`
        : decodedPath;
    const filePath = path.join(root, pathname);

    if (!filePath.startsWith(root)) {
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
        "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream"
      });
      response.end(data);
    });
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`Listening on http://127.0.0.1:${port}/`);
  });
