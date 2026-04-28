const fs = require('fs');
const cheerio = require('cheerio');
const json = JSON.parse(fs.readFileSync('src/app/koi_content.json', 'utf8'));
const $ = cheerio.load(json.html);

// Find hero section
const hero = $('[class*="hero"]').first();
console.log('Hero classes:', hero.attr('class'));
console.log('Hero HTML (first 2000):', hero.html() && hero.html().substring(0, 2000));

// Look for images - let's look for the flagVideo replacement  
const flagImg = $('#flagVideo');
console.log('\nFlag video replacement:', flagImg.length ? 'found' : 'not found');
if (flagImg.length) {
  console.log('Flag img src:', flagImg.attr('src'));
  console.log('Flag img style:', flagImg.attr('style'));
  console.log('Flag img parent:', flagImg.parent().attr('class'));
  console.log('Flag img parent parent:', flagImg.parent().parent().attr('class'));
}

// Nav logo
const logo = $('[class*="nav_logo"]');
console.log('\nNav logo:', logo.length ? 'found' : 'not found');
console.log('Logo src:', logo.attr('src'));
console.log('Logo alt:', logo.attr('alt'));
