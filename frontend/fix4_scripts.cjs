const fs = require('fs');
let code = fs.readFileSync('src/app/koi_scripts.js', 'utf8');

// Remove JSON-LD block
code = code.replace(/\{\s*"@context"[\s\S]*?\}/g, '');

// Also, the other error I had before "});"
// The problem is that "if(true) {" was used previously! Wait, in fix2 I extracted from koi.html again.
// So there are no "if(true) {" left.
// Let's check for any remaining syntax errors.

fs.writeFileSync('src/app/koi_scripts.js', code);
