import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');

// Create public directory
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// Folders to copy
const foldersToCopy = ['scripts', 'styles', 'assets', 'owner', 'verification'];

function copyRecursiveSync(src, dest) {
    if (!fs.existsSync(src)) return;
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// Copy folders
for (const folder of foldersToCopy) {
    copyRecursiveSync(path.join(__dirname, folder), path.join(publicDir, folder));
}

// Copy HTML and Favicon files
const rootFiles = fs.readdirSync(__dirname);
for (const file of rootFiles) {
    if (file.endsWith('.html') || file.startsWith('favicon')) {
        fs.copyFileSync(path.join(__dirname, file), path.join(publicDir, file));
    }
}

console.log('✅ Successfully built frontend to /public');
