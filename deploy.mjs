import { mkdirSync, copyFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const docs = join(root, 'docs');
mkdirSync(docs, { recursive: true });

const files = ['index.html','style.css','app.js','sw.js','manifest.webmanifest','favicon.ico','icon-192.png','icon-512.png'];

for (const f of files) {
    const src = join(root, f);
    if (existsSync(src)) copyFileSync(src, join(docs, f));
}

function copyDir(srcDir, dstDir) {
    if (!existsSync(srcDir)) return;
    mkdirSync(dstDir, { recursive: true });
    for (const name of readdirSync(srcDir)) {
        const s = join(srcDir, name);
        const d = join(dstDir, name);
        const st = statSync(s);
        if (st.isDirectory()) copyDir(s, d);
        else copyFileSync(s, d);
    }
}

// Copy common asset dirs if present
for (const folder of ['assets','images','img']) {
    copyDir(join(root, folder), join(docs, folder));
}

console.log('✅ Deployed files to /docs');