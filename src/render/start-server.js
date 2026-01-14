const http = require('http');
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(process.cwd(), 'src');
const ASSETS_DIR = path.join(process.cwd(), 'assets');
const PORT = process.env.PORT || 3000;

const mime = { js: 'application/javascript', html: 'text/html', css: 'text/css', json: 'application/json', png: 'image/png', wav: 'audio/wav', mp3: 'audio/mpeg' };

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  
  if (url === '/' || url === '/index.html') {
    const indexPath = path.join(SRC_DIR, 'render', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(indexPath, 'utf8'));
      return;
    }
  }

  // Serve from assets directory
  if (url.startsWith('/assets/')) {
    const filePath = path.join(process.cwd(), url);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).slice(1);
      res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(filePath));
      return;
    }
  }

  // Serve any file from src directory
  const srcPath = path.join(SRC_DIR, url);
  if (fs.existsSync(srcPath) && fs.statSync(srcPath).isFile()) {
    const ext = path.extname(srcPath).slice(1);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(fs.readFileSync(srcPath));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Game server running at http://0.0.0.0:${PORT}/`);
});
