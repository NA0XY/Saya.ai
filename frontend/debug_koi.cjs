const fs = require('fs');
const cheerio = require('cheerio');
const json = JSON.parse(fs.readFileSync('src/app/koi_content.json', 'utf8'));
const $ = cheerio.load(json.html);

// Find "INTRODUCING" text and surrounding context
$('*').each((i, el) => {
  const text = $(el).text().trim();
  if (text.includes('INTRODUCING') && text.length < 200) {
    console.log('\n--- INTRODUCING element ---');
    console.log('Tag:', el.tagName);
    console.log('Class:', $(el).attr('class'));
    console.log('HTML:', $.html(el).substring(0, 500));
  }
});

// Find koidex
$('*').each((i, el) => {
  const text = $(el).text().trim();
  if (text === 'KOIDEX' || text === 'KOI DEX' || (text.includes('KOIDEX') && text.length < 50)) {
    console.log('\n--- KOIDEX element ---');
    console.log('Tag:', el.tagName);
    console.log('Class:', $(el).attr('class'));
    console.log('HTML:', $.html(el).substring(0, 300));
    console.log('Parent:', $(el).parent().attr('class'));
  }
});
