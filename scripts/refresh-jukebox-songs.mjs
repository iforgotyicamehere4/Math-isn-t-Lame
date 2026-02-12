import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('public/audio/jukebox');
const outFile = path.resolve('src/data/jukeboxSongs.js');

if (!fs.existsSync(dir)) {
  console.error(`Missing folder: ${path.relative(process.cwd(), dir)}`);
  process.exit(1);
}

const all = fs.readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isFile() && d.name.toLowerCase().endsWith('.mp3'))
  .map((d) => d.name);

const originals = all
  .filter((name) => !/^\d{2}-[a-z0-9-]+\.mp3$/i.test(name))
  .sort((a, b) => a.localeCompare(b));

const slugify = (name) => {
  const base = name.replace(/\.mp3$/i, '').trim();
  return base
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'"`]/g, '')
    .replace(/&/g, ' and ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'song';
};

const songs = originals.map((originalName, index) => {
  const n = String(index + 1).padStart(2, '0');
  const slug = slugify(originalName);
  const safeName = `${n}-${slug}.mp3`;

  const from = path.join(dir, originalName);
  const to = path.join(dir, safeName);
  if (!fs.existsSync(to)) fs.copyFileSync(from, to);

  return {
    id: `song-${n}`,
    label: originalName.replace(/\.mp3$/i, '').trim(),
    filename: safeName,
    originalFilename: originalName
  };
});

const out = `export const JUKEBOX_SONGS = ${JSON.stringify(songs, null, 2)};\n`;
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out, 'utf8');

console.log(`Songs: ${songs.length}`);
console.log(`Manifest: ${path.relative(process.cwd(), outFile)}`);
console.log('Safe names generated/kept in public/audio/jukebox');
