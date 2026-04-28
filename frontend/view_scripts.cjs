const fs = require('fs');
const html = fs.readFileSync('koi.html', 'utf8');
const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
scripts && scripts.forEach((s, i) => {
  if(!s.includes('src=')) console.log('\n--- Script ' + i + ' ---\n', s.substring(0, 1000));
});
