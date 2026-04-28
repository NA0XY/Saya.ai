const fs = require('fs');
const html = fs.readFileSync('koi.html', 'utf8');
const scriptsMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
let allScripts = '';
if (scriptsMatch) {
  scriptsMatch.forEach(s => {
    if (!s.includes('src=')) {
      // Extract the content inside the script tag
      const contentMatch = s.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
      if (contentMatch && contentMatch[1].trim()) {
        allScripts += '\n\n// --- Script ---\n' + contentMatch[1];
      }
    }
  });
}
fs.writeFileSync('src/app/koi_scripts.js', 'export function initKoiScripts() {\n' + allScripts + '\n}');
console.log('Scripts extracted!');
