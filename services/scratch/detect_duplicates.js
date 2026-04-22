import fs from 'fs';
import path from 'path';

function findDuplicates(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findDuplicates(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const importBlocks = content.match(/import\s*\{([\s\S]*?)\}\s*from\s*['"]lucide-react['"]/g);
      
      if (importBlocks) {
        importBlocks.forEach(block => {
          const icons = block.match(/\{([\s\S]*?)\}/)[1]
            .split(',')
            .map(i => i.trim())
            .filter(i => i !== '');
          
          const seen = new Set();
          const duplicates = [];
          icons.forEach(icon => {
            if (seen.has(icon)) {
              duplicates.push(icon);
            }
            seen.add(icon);
          });
          
          if (duplicates.length > 0) {
            console.log(`DUPLICATES in ${filePath}: ${duplicates.join(', ')}`);
          }
        });
      }
    }
  });
}

findDuplicates('AdminPanel/src');
