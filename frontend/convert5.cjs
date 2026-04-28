const fs = require('fs');

let html = fs.readFileSync('koi.html', 'utf8');

const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/is);
if (!bodyMatch) {
  process.exit(1);
}
let bodyHtml = bodyMatch[1];

// Remove scripts and iframes
bodyHtml = bodyHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
bodyHtml = bodyHtml.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

// REPLACE TEXT WITH SAYA TEXT
bodyHtml = bodyHtml.replace(/Palo Alto Networks Completes Acquisition of Koi to Secure the Agentic Endpoint/gi, 'SAYA TO JOIN PALO ALTO NETWORKS');
bodyHtml = bodyHtml.replace(/Read the press release/gi, 'READ THE PRESS RELEASE');
bodyHtml = bodyHtml.replace(/SECURE <span class="text-color-black">anything<\/span> with AN INSTALL BUTTON/gi, '<span class="text-[#f93f12]">CARE FOR</span> YOUR PARENTS <br/><span class="text-color-black">WITH</span> <span class="text-[#f93f12]">REAL PROTECTION</span>');
bodyHtml = bodyHtml.replace(/Use the Koi Endpoint Security Platform to secure any software install, allowing your teams to fly free\. Govern all software, packages, MCPs, extensions, AI models, AI agents, and containers, securing everything before it reaches your endpoints\./gi, 'Use the Saya Companion Platform to secure their daily lives, allowing them to live free. Monitor health, prevent scams, govern devices, and ensure their safety every single day.');
bodyHtml = bodyHtml.replace(/The world’s leading security teams use Koi/gi, 'FAMILIES TRUST SYSTEMS THAT ACT BEFORE PROBLEMS');
bodyHtml = bodyHtml.replace(/Cambia Health Solutions brings <span class="u-text-color-orange">“secure every install”<\/span> to life with Koi/gi, 'CAMBIA HEALTH SOLUTIONS BRINGS <span class="u-text-color-orange">“SECURE EVERY INSTALL”</span> TO LIFE WITH SAYA');
bodyHtml = bodyHtml.replace(/Unprecedented endpoint visibility into <span class="text-color-black">every type of non-binary software\.<\/span>/gi, 'UNPRECEDENTED ENDPOINT VISIBILITY INTO <span class="text-color-black">EVERY TYPE OF NON-BINARY SOFTWARE.</span>');
bodyHtml = bodyHtml.replace(/THREAT ACTORS <span class="text-color-yellow">ARE HAVING A BALL\.<\/span>/gi, 'THREAT ACTORS <span class="text-color-yellow">ARE HAPPENING SILENTLY.</span>');
bodyHtml = bodyHtml.replace(/Like most companies, you’re probably stuck between three bad options/gi, 'LIKE MOST FAMILIES, YOU’RE PROBABLY STUCK BETWEEN THREE BAD OPTIONS');
bodyHtml = bodyHtml.replace(/How do you stay productive and secure\?/gi, 'HOW DO YOU STAY SAFE AND CONNECTED?');
bodyHtml = bodyHtml.replace(/One unified platform to secure <span class="text-color-black">all software<\/span>/gi, 'ONE UNIFIED PLATFORM TO SECURE <span class="text-color-black">ALL SOFTWARE</span>');
bodyHtml = bodyHtml.replace(/Watch a 3-minute demo/gi, 'WATCH A 3-MINUTE DEMO');
bodyHtml = bodyHtml.replace(/See how Koi secures all software—from the browser to the OS—making your environment bulletproof\./gi, 'See how Saya secures your parents daily lives—from preventing scams to monitoring health—making their world safer.');

bodyHtml = bodyHtml.replace(/Koi/g, 'Saya');
bodyHtml = bodyHtml.replace(/koi/g, 'saya');

// Replace ALL <video> tags with an SVG image. We will just use cloud02.svg for all of them for now, but with object-fit cover.
// To replace <video> ... </video> with <img>:
bodyHtml = bodyHtml.replace(/<video[^>]*>.*?<\/video>/gis, '<img src="/koi-assets/6836d873d735542d459f0382_cloud02.svg" style="width:100%;height:100%;object-fit:cover;object-position:center;" />');

// Write to JSON file
fs.writeFileSync('src/app/koi_content.json', JSON.stringify({ html: bodyHtml }));
console.log('Conversion successful!');
