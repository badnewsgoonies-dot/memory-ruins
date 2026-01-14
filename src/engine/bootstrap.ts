import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { IncomingMessage, ServerResponse } from 'http'; // For typing req and res
import { exec } from 'child_process'; // For opening the browser

// Canvas and player constants exposed for renderer modules
import { CANVAS_WIDTH, CANVAS_HEIGHT, DEFAULT_SERVER_PORT } from '../constants';

function bootstrap(port: number = DEFAULT_SERVER_PORT): http.Server {
  const SRC_DIR = path.join(process.cwd(), 'src');
  const RENDER_DIR = path.join(SRC_DIR, 'render');
  const INPUT_DIR = path.join(SRC_DIR, 'input');

  const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = (req.url || '/');

    // Serve the rendered index.html from src/render/
    if (url === '/' || url === '/index.html') {
      const indexPath = path.join(RENDER_DIR, 'index.html');
      if (fs.existsSync(indexPath)) {
        const html = fs.readFileSync(indexPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
        return;
      }
    }

    // Also serve root-relative requests from src/render/ (e.g. /main.js -> src/render/main.js)
    const relRequest = url.replace(/^\//, '');
    if (relRequest) {
      const renderCandidate = path.join(RENDER_DIR, relRequest);
      try {
        if (fs.existsSync(renderCandidate) && fs.lstatSync(renderCandidate).isFile()) {
          const ext: string = path.extname(renderCandidate).slice(1);
          const mime: Record<string, string> = { js: 'application/javascript', html: 'text/html', css: 'text/css' };
          res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
          res.end(fs.readFileSync(renderCandidate));
          return;
        }
      } catch (e) {
        // ignore and fall through to 404
      }
    }

    // Serve static assets from src/render and src/input directories
    if (url.startsWith('/render/') || url.startsWith('/input/')) {
      // Normalize path: remove leading slash and map to src/
      const rel = url.replace(/^\//, '');
      const filePath = path.join(SRC_DIR, rel);
      if (fs.existsSync(filePath)) {
        const ext: string = path.extname(filePath).slice(1);
        const mime: Record<string, string> = { js: 'application/javascript', html: 'text/html', css: 'text/css' };
        res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
        res.end(fs.readFileSync(filePath));
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}/`;
    const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    try { exec(opener + ' ' + url); } catch (e) { /* browser open failed; ignore */ }
  });

  return server;
}

export { bootstrap };
