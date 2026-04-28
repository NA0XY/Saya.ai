const fs = require('fs');
let code = fs.readFileSync('src/app/koi_scripts.js', 'utf8');

// The carousel script uses this pattern:
// if (document.readyState === "loading") {
//   document.addEventListener("DOMContentLoaded", initCarousel);
// } else {
//   initCarousel();
// }

// We just force it to call initCarousel immediately
code = code.replace(/if\s*\(\s*document\.readyState\s*===\s*["']loading["']\s*\)\s*\{\s*document\.addEventListener\(['"]DOMContentLoaded['"],\s*initCarousel\);\s*\}\s*else\s*\{\s*initCarousel\(\);\s*\}/g, 'initCarousel();');

fs.writeFileSync('src/app/koi_scripts.js', code);
