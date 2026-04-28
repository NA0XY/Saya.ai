const fs = require('fs');
let code = fs.readFileSync('src/app/koi_scripts.js', 'utf8');

// Restore DOMContentLoaded logic but with a delay instead!
// Actually we already replaced it with "if(true) {". Let me extract from HTML again!

const html = fs.readFileSync('koi.html', 'utf8');
const scriptsMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
let allScripts = '';
if (scriptsMatch) {
  scriptsMatch.forEach(s => {
    if (!s.includes('src=')) {
      const contentMatch = s.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
      if (contentMatch && contentMatch[1].trim()) {
        allScripts += '\n\n// --- Script ---\n' + contentMatch[1];
      }
    }
  });
}

// Replace DOMContentLoaded with a setTimeout to run immediately but keep the bracket syntax intact
allScripts = allScripts.replace(/document\.addEventListener\(['"]DOMContentLoaded['"],\s*\(\)\s*=>\s*\{/g, 'setTimeout(() => {');
// Wait, some might use unction() instead of () => {
allScripts = allScripts.replace(/document\.addEventListener\(['"]DOMContentLoaded['"],\s*function\s*\(\)\s*\{/g, 'setTimeout(function() {');

fs.writeFileSync('src/app/koi_scripts.js', 'export function initKoiScripts() {\n' + allScripts + '\n}');
