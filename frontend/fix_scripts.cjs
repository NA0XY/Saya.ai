const fs = require('fs');
let code = fs.readFileSync('src/app/koi_scripts.js', 'utf8');

// Replace DOMContentLoaded
code = code.replace(/document\.addEventListener\(['"]DOMContentLoaded['"],\s*\(\)\s*=>\s*\{/g, 'if(true) {');

fs.writeFileSync('src/app/koi_scripts.js', code);
