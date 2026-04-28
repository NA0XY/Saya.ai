const fs = require('fs');
const https = require('https');
const path = require('path');

const html = fs.readFileSync('koi.html', 'utf8');
const regex = /https:\/\/cdn\.prod\.website-files\.com\/[^"'\s\)]+/g;
const matches = html.match(regex) || [];
const unique = [...new Set(matches)];

const dir = './scraped';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

let idx = 0;
for (const url of unique) {
  if (url.endsWith('.svg') || url.endsWith('.avif') || url.endsWith('.png') || url.endsWith('.json') || url.endsWith('.lottie')) {
    const filename = path.basename(decodeURIComponent(url));
    const filepath = path.join(dir, filename);
    
    https.get(url, (res) => {
        const file = fs.createWriteStream(filepath);
        res.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${filename}`);
        });
    }).on('error', (err) => {
        console.log(`Error: ${err.message}`);
    });
  }
}
