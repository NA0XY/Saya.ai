const fs = require('fs');
let html = fs.readFileSync('koi.html', 'utf8');

// Extract everything inside body
const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/is);
if (!bodyMatch) {
  console.log('No body found');
  process.exit(1);
}
let bodyHtml = bodyMatch[1];

// Remove script tags
bodyHtml = bodyHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
// Remove iframe tags
bodyHtml = bodyHtml.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

// Convert class to className
bodyHtml = bodyHtml.replace(/class=/g, 'className=');
// Convert inline styles
// Webflow inline styles are like style="transform: translate3d(0px, 0px, 0px);"
// We will remove inline styles for now to avoid React errors, except we might need them for animations.
// Actually, to make it simple, let's remove inline styles that contain webkit or complex transforms which React doesn't like as strings.
bodyHtml = bodyHtml.replace(/style="[^"]*"/g, '');

// Self close img, br, input, hr
bodyHtml = bodyHtml.replace(/<img([^>]*)>/g, (match, p1) => {
  if (p1.endsWith('/')) return match;
  return <img />;
});
bodyHtml = bodyHtml.replace(/<br([^>]*)>/g, (match, p1) => {
  if (p1.endsWith('/')) return match;
  return <br />;
});
bodyHtml = bodyHtml.replace(/<input([^>]*)>/g, (match, p1) => {
  if (p1.endsWith('/')) return match;
  return <input />;
});
bodyHtml = bodyHtml.replace(/<hr([^>]*)>/g, (match, p1) => {
  if (p1.endsWith('/')) return match;
  return <hr />;
});

// Remove attributes React doesn't like like autocomplete="off" -> autoComplete="off", etc.
bodyHtml = bodyHtml.replace(/autocomplete=/g, 'autoComplete=');
bodyHtml = bodyHtml.replace(/tabindex=/g, 'tabIndex=');
bodyHtml = bodyHtml.replace(/maxlength=/g, 'maxLength=');

// Fix SVGs
bodyHtml = bodyHtml.replace(/xmlns:xlink/g, 'xmlnsXlink');
bodyHtml = bodyHtml.replace(/xml:space/g, 'xmlSpace');
bodyHtml = bodyHtml.replace(/viewbox/gi, 'viewBox');
bodyHtml = bodyHtml.replace(/stroke-width/g, 'strokeWidth');
bodyHtml = bodyHtml.replace(/stroke-linecap/g, 'strokeLinecap');
bodyHtml = bodyHtml.replace(/stroke-linejoin/g, 'strokeLinejoin');
bodyHtml = bodyHtml.replace(/fill-rule/g, 'fillRule');
bodyHtml = bodyHtml.replace(/clip-rule/g, 'clipRule');

// We have w-embed components that might contain complex stuff, we can leave them for now.

const jsx = 
import React from 'react';
import { AnnouncementBar } from "./AnnouncementBar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { DottedBackground } from "./DottedBackground";

export function LandingPage() {
  return (
    <>
      <DottedBackground />
      <div className="page-wrapper">
        
      </div>
    </>
  );
}
;

fs.writeFileSync('src/app/components/KoiLandingPage.tsx', jsx);
console.log('Done');
