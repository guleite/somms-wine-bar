// Apaga o banco SQLite para que o seed rode de novo na próxima inicialização.
// Uso: pare o servidor e rode  npm run reset-db
import { rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = process.env.DB_PATH || join(root, 'data', 'somms.db');

let removed = 0;
for (const f of [dbPath, `${dbPath}-wal`, `${dbPath}-shm`]) {
  if (!existsSync(f)) continue;
  try {
    rmSync(f);
    removed++;
  } catch (err) {
    console.error(`Não consegui apagar ${f} (${err.code}). O servidor ainda está rodando? Pare-o e tente de novo.`);
    process.exit(1);
  }
}
console.log(removed ? `Banco apagado (${dbPath}). Ele será recriado com o conteúdo de exemplo ao iniciar o servidor.` : 'Nenhum banco encontrado — nada a fazer.');
