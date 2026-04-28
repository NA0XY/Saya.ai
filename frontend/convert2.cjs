const fs = require('fs');
let html = fs.readFileSync('koi.html', 'utf8');

// Extract everything inside body
const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/is);
if (!bodyMatch) {
  console.log('No body found');
  process.exit(1);
}
let bodyHtml = bodyMatch[1];

// Remove scripts
bodyHtml = bodyHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
// Remove iframes
bodyHtml = bodyHtml.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

// Replace text to Saya
bodyHtml = bodyHtml.replace(/Koi/g, 'Saya');
bodyHtml = bodyHtml.replace(/koi/g, 'saya');

// Replace videos with svgs
// Let's just convert any <video ...>...</video> into an <img> tag pointing to an svg
bodyHtml = bodyHtml.replace(/<video[^>]*>.*?<\/video>/gis, '<img src="/koi-assets/cloud02.svg" style="width: 100%; height: 100%; object-fit: cover;" />');

// Remove the w-webflow-badge
bodyHtml = bodyHtml.replace(/<a[^>]*w-webflow-badge.*?<\/a>/gis, '');

// Save to a json file so we can easily import it in React
fs.writeFileSync('src/app/koi_content.json', JSON.stringify({ html: bodyHtml }));
console.log('Done');
