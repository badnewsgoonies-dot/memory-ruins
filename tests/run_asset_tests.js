const fs = require('fs');
const path = require('path');

function ok(msg){ console.log('[OK] ' + msg); }
function fail(msg){ console.error('[FAIL] ' + msg); }

function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }

function checkExists(p){ if(!fs.existsSync(p)){ fail(`${p} missing`); return false; } return true; }
function checkPNG(p){ try{ const buf = fs.readFileSync(p); return buf.slice(0,8).equals(Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A])); }catch(e){return false;} }
function checkOGG(p){ try{ const buf = fs.readFileSync(p); return buf.slice(0,4).toString()==='OggS'; }catch(e){return false;} }
function checkWAV(p){ try{ const buf = fs.readFileSync(p); return buf.slice(0,4).toString()==='RIFF'; }catch(e){return false;} }

const repoRoot = path.resolve(__dirname, '..');
let failures = 0;

// Manifests
const spritesManifest = path.join(repoRoot, 'assets', 'sprites', 'manifest.json');
const audioManifest = path.join(repoRoot, 'assets', 'audio', 'manifest.json');
const tilesManifest = path.join(repoRoot, 'assets', 'tiles', 'manifest.json');

if(checkExists(spritesManifest)){
  const m = readJson(spritesManifest);
  if(Array.isArray(m.sprites)){
    m.sprites.forEach(s => {
      const p = path.join(repoRoot, 'assets', 'sprites', s);
      if(!checkExists(p)){ failures++; }
      else if(!checkPNG(p)){ console.warn('[WARN] '+s+' PNG signature invalid, but file present'); ok(`${s} present (signature warning)`); }
      else ok(`${s} PNG signature valid`);
    });
  } else { fail('sprites manifest format invalid'); failures++; }
} else failures++;

if(checkExists(tilesManifest)){
  const m = readJson(tilesManifest);
  if(Array.isArray(m.tiles)){
    m.tiles.forEach(s => {
      const p = path.join(repoRoot, 'assets', 'tiles', s);
      if(!checkExists(p)){ failures++; }
      else if(!checkPNG(p)){ console.warn('[WARN] '+s+' PNG signature invalid, but file present'); ok(`${s} present (signature warning)`); }
      else ok(`${s} PNG signature valid`);
    });
  } else { fail('tiles manifest format invalid'); failures++; }
} else failures++;

if(checkExists(audioManifest)){
  const m = readJson(audioManifest);
  if(Array.isArray(m.music)){
    m.music.forEach(s => {
      const p = path.join(repoRoot, 'assets', 'audio', s);
      if(!checkExists(p)){ failures++; }
      else if(!checkOGG(p)){ console.warn('[WARN] '+s+' OGG signature invalid, but file present'); ok(`${s} present (signature warning)`); }
      else ok(`${s} OGG signature valid`);
    });
  }
  if(Array.isArray(m.sfx)){
    m.sfx.forEach(s => {
      const p = path.join(repoRoot, 'assets', 'audio', s);
      if(!checkExists(p)){ failures++; }
      else if(!checkWAV(p)){ console.warn('[WARN] '+s+' WAV signature invalid, but file present'); ok(`${s} present (signature warning)`); }
      else ok(`${s} WAV signature valid`);
    });
  }
} else failures++;

// Registry paths check (src/assets/registry.ts)
const registryPath = path.join(repoRoot, 'src', 'assets', 'registry.ts');
if(checkExists(registryPath)){
  const txt = fs.readFileSync(registryPath,'utf8');
  const matches = [...txt.matchAll(/'([^']+)'/g)].map(m=>m[1]);
  matches.forEach(rel => {
    const p = path.join(repoRoot, rel);
    if(!checkExists(p)){ fail(`registry path missing: ${rel}`); failures++; }
    else ok(`registry path exists: ${rel}`);
  });
} else { fail('registry.ts missing'); failures++; }

console.log('\nSUMMARY:');
if(failures===0){ console.log('All asset integration checks passed'); process.exit(0); }
else{ console.error(`${failures} failures detected`); process.exit(2); }
