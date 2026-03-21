import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = process.env.GOOGLE_MAPS_API_KEY || '';

const configContent = `window.PARK_CONFIG = {
    MAPS_KEY: "${apiKey}"
};`;

const outputPath = path.join(__dirname, 'scripts', 'config.js');

try {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, configContent);
    console.log('✅ Generated scripts/config.js');
} catch (err) {
    console.error('❌ Failed to generate config.js:', err);
    process.exit(1);
}
