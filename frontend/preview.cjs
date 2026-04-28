const fs = require('fs');
const path = require('path');
const files = fs.readdirSync('scraped').filter(f => f.match(/\.(png|jpg|jpeg|gif|svg|avif)$/));

let html = `<html><body style="background: #e0e0e0; font-family: sans-serif; display: flex; flex-wrap: wrap;">`;
for (let f of files) {
  html += `<div style="margin: 10px; border: 1px solid #ccc; padding: 10px; background: white; max-width: 300px;">`;
  html += `<h4>${f}</h4>`;
  html += `<img src="public/koi-assets/${f}" style="max-width: 100%; height: auto;" />`;
  html += `</div>`;
}
html += `</body></html>`;
fs.writeFileSync('preview.html', html);
