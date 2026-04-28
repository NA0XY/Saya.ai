const fs = require('fs');
const json = JSON.parse(fs.readFileSync('src/app/koi_content.json', 'utf8'));
fs.writeFileSync('public/koi_content.html', json.html);
