// Gera public/ebook/guia-vinhos-centro-oeste.pdf a partir de ebook-src/guia.html
// usando o Edge/Chrome instalado (modo headless). Uso: npm run ebook
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = pathToFileURL(join(root, 'ebook-src', 'guia.html')).href;
const out = join(root, 'public', 'ebook', 'guia-vinhos-centro-oeste.pdf');
mkdirSync(dirname(out), { recursive: true });

const candidates = [
  process.env.BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error('Nenhum Edge/Chrome encontrado. Defina BROWSER=/caminho/do/navegador');
  process.exit(1);
}

execFileSync(browser, [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--allow-file-access-from-files',
  '--virtual-time-budget=15000',
  `--user-data-dir=${join(root, 'data', '.pdf-profile')}`,
  `--print-to-pdf=${out}`,
  src,
], { stdio: 'inherit' });

console.log(`PDF gerado: ${out} (${Math.round(statSync(out).size / 1024)} KB)`);
