"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAYER_SIZE = exports.CANVAS_HEIGHT = exports.CANVAS_WIDTH = void 0;
exports.bootstrap = bootstrap;
const http = __importStar(require("http"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process"); // For opening the browser
// Canvas and player constants exposed for renderer modules
const CANVAS_WIDTH = 800;
exports.CANVAS_WIDTH = CANVAS_WIDTH;
const CANVAS_HEIGHT = 600;
exports.CANVAS_HEIGHT = CANVAS_HEIGHT;
const PLAYER_SIZE = 40;
exports.PLAYER_SIZE = PLAYER_SIZE;
function bootstrap(port = 3000) {
    const SRC_DIR = path.join(process.cwd(), 'src');
    const RENDER_DIR = path.join(SRC_DIR, 'render');
    const INPUT_DIR = path.join(SRC_DIR, 'input');
    const server = http.createServer((req, res) => {
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
                    const ext = path.extname(renderCandidate).slice(1);
                    const mime = { js: 'application/javascript', html: 'text/html', css: 'text/css' };
                    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
                    res.end(fs.readFileSync(renderCandidate));
                    return;
                }
            }
            catch (e) {
                // ignore and fall through to 404
            }
        }
        // Serve static assets from src/render and src/input directories
        if (url.startsWith('/render/') || url.startsWith('/input/')) {
            // Normalize path: remove leading slash and map to src/
            const rel = url.replace(/^\//, '');
            const filePath = path.join(SRC_DIR, rel);
            if (fs.existsSync(filePath)) {
                const ext = path.extname(filePath).slice(1);
                const mime = { js: 'application/javascript', html: 'text/html', css: 'text/css' };
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
        console.log(`Prototype server running at ${url}`);
        const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
        try {
            (0, child_process_1.exec)(opener + ' ' + url);
        }
        catch (e) {
            console.log('Open browser manually:', url);
        }
    });
    return server;
}
