const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('koi.html', 'utf8');
const $ = cheerio.load(html);

// Remove scripts
$('script').remove();
$('[w-webflow-badge]').remove();

// ─── Step 1: Replace Videos FIRST (before text replacement, so IDs are intact) ─
$('video').each((i, el) => {
  const $video = $(el);
  const id = ($video.attr('id') || '').toLowerCase();
  const cls = ($video.attr('class') || '').toLowerCase();
  
  let imgSrc;

  if (id === 'islandred' || id.includes('red')) {
    imgSrc = '/koi-assets/island-left.avif';
  } else if (id === 'islandgold' || id.includes('gold')) {
    imgSrc = '/koi-assets/island-center.avif';
  } else if (id === 'islandblue' || id.includes('blue')) {
    imgSrc = '/koi-assets/island-right.avif';
  } else if (id === 'fishvideo') {
    imgSrc = '/koi-assets/island-center.avif';
  } else if (id === 'footervideo') {
    imgSrc = '/koi-assets/hero-balloon.avif';
  } else if (id === 'flagvideo') {
    imgSrc = '/koi-assets/hero-balloon.avif';
  } else if (id === 'shipvideo') {
    imgSrc = '/koi-assets/island-center.avif';
  } else {
    imgSrc = '/koi-assets/island-center.avif';
  }

  const $img = $('<img>');
  $img.attr('src', imgSrc);
  $img.attr('id', $video.attr('id') || '');
  if ($video.attr('class')) $img.attr('class', $video.attr('class'));
  $img.attr('style', 'width:100%; height:100%; object-fit:contain; object-position:center; display:block;');
  $video.replaceWith($img);
});

// ─── Step 2: Fix flagVideo and shipVideo specifically ────────────────────────
// flagVideo is the small balloon in top-left corner of hero
$('#flagVideo').each((i, el) => {
  $(el).attr('src', '/koi-assets/hero-balloon.avif');
  $(el).attr('style', 'width:180px; height:180px; object-fit:contain;');
});

// shipVideo is the big hero right-side visual  
$('#shipVideo').each((i, el) => {
  $(el).attr('src', '/koi-assets/island-center.avif');
  $(el).attr('style', 'width:100%; height:auto; max-width:680px; object-fit:contain; display:block;');
});

// ─── Step 3: Replace iframes (but keep vimeo) ────────────────────────────────
$('iframe').each((i, el) => {
  const $iframe = $(el);
  const src = $iframe.attr('src') || '';
  const id = $iframe.attr('id') || '';
  if (src.includes('vimeo') || id === 'vimeo-player') return; // keep vimeo
  const $img = $('<img>');
  $img.attr('src', '/koi-assets/6836d87262e4ca8706e98a77_coud01.svg');
  if ($iframe.attr('class')) $img.attr('class', $iframe.attr('class'));
  $img.attr('style', 'width:100%; height:100%; object-fit:cover;');
  $iframe.replaceWith($img);
});

// ─── Step 4: Fix Logo ─────────────────────────────────────────────────────────
$('.nav_logo').each((i, el) => {
  $(el).attr('src', '/koi-assets/saya-logo.svg');
  $(el).attr('alt', 'Saya logo');
  $(el).attr('style', 'height:32px; width:auto;');
});

// ─── Step 5: Fix blog/internal links ─────────────────────────────────────────
$('a[href*="koi.ai"]').each((i, el) => {
  const href = $(el).attr('href') || '';
  $(el).attr('href', href.replace('https://www.koi.ai', ''));
});

// ─── Step 6: Text replacements ────────────────────────────────────────────────
function replaceText(node) {
  if (node.type === 'text') {
    let t = node.data;

    // Announcement bar
    t = t.replace(/Palo Alto Networks Completes Acquisition of Koi to Secure the Agentic Endpoint/gi, 'SAYA TO JOIN PALO ALTO NETWORKS');
    t = t.replace(/Read the press release/gi, 'READ THE PRESS RELEASE');

    // Hero headline - fix piece by piece
    t = t.replace(/^SECURE$/g, 'CARE FOR');
    t = t.replace(/^anything$/g, 'YOUR PARENTS');
    t = t.replace(/with AN\u00a0INSTALL BUTTON/g, 'WITH REAL PROTECTION');
    t = t.replace(/AN\u00a0INSTALL BUTTON/g, 'REAL PROTECTION');
    t = t.replace(/with AN INSTALL BUTTON/g, 'WITH REAL PROTECTION');

    // Descriptions
    t = t.replace(/Use the Koi Endpoint Security Platform to secure any software install, allowing your teams to fly free\./gi,
      'Use the Saya Companion Platform to protect your parents every day, allowing them to live freely.');
    t = t.replace(/Govern all software, packages, MCPs, extensions, AI models, AI[\u00a0 ]agents, and containers, securing everything before it reaches your endpoints\./gi,
      'Monitor health, prevent scams, govern devices, and ensure their safety every single day.');

    // Buttons
    t = t.replace(/See Koi in Action/gi, 'See Saya in Action');
    t = t.replace(/SEE KOI IN ACTION/gi, 'SEE SAYA IN ACTION');

    // Section headers
    t = t.replace(/The world's leading security teams use Koi/gi, 'FAMILIES TRUST SYSTEMS THAT ACT BEFORE PROBLEMS');
    t = t.replace(/Cambia Health Solutions brings/gi, 'CAMBIA HEALTH SOLUTIONS BRINGS');
    t = t.replace(/"secure every install"/gi, '"CARE THAT NEVER SLEEPS"');
    t = t.replace(/to life with Koi/gi, 'TO LIFE WITH SAYA');
    t = t.replace(/Unprecedented endpoint visibility into/gi, 'UNPRECEDENTED VISIBILITY INTO');
    t = t.replace(/every type of non-binary software\./gi, "EVERY ASPECT OF YOUR PARENTS' DAILY LIFE.");
    t = t.replace(/ARE HAVING A BALL\./gi, 'ARE HAPPENING SILENTLY.');
    t = t.replace(/Like most companies, you.?re probably stuck between three bad options/gi,
      "LIKE MOST FAMILIES, YOU'RE PROBABLY STUCK BETWEEN THREE BAD OPTIONS");
    t = t.replace(/How do you stay productive and secure\?/gi, 'HOW DO YOU STAY SAFE AND CONNECTED?');
    t = t.replace(/One unified platform to secure/gi, 'ONE UNIFIED PLATFORM TO PROTECT');
    t = t.replace(/Watch a 3-minute demo/gi, 'WATCH A 3-MINUTE DEMO');
    t = t.replace(/See how Koi secures all software.+making your environment bulletproof\./gi,
      "See how Saya protects your parents' daily lives—from preventing scams to monitoring health—making their world safer.");

    // Generic final replacements
    t = t.replace(/Koi/g, 'Saya');
    t = t.replace(/koi/g, 'saya');
    t = t.replace(/KOI/g, 'SAYA');
    // Fix SECURE→CARE FOR and anything→YOUR PARENTS in generic text
    t = t.replace(/\bSECURE\b/g, 'CARE FOR');

    node.data = t;
  } else if (node.type === 'tag') {
    if (node.children) node.children.forEach(replaceText);
  }
}

$('body').each((i, el) => { replaceText(el); });

// ─── Step 7: Fix alt texts referencing Koi ────────────────────────────────
$('[alt*="Koi"], [alt*="koi"], [alt*="KOI"]').each((i, el) => {
  const alt = $(el).attr('alt') || '';
  $(el).attr('alt', alt.replace(/Koi/gi, 'Saya').replace(/koi/gi, 'saya').replace(/KOI/gi, 'SAYA'));
});

// ─── Output ──────────────────────────────────────────────────────────────────
const innerHtml = $('.page-wrapper').parent().html();
fs.writeFileSync('src/app/koi_content.json', JSON.stringify({ html: innerHtml }));
fs.writeFileSync('public/koi_content.html', innerHtml);
console.log('Conversion done! Files written.');
