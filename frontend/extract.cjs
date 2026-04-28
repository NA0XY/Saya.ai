const fs = require('fs');
const html = fs.readFileSync('koi.html', 'utf8');
const regex = /https:\/\/cdn\.prod\.website-files\.com\/[^"'\s\)]+/g;
const matches = html.match(regex) || [];
const unique = [...new Set(matches)];
console.log(unique.join('\n'));
