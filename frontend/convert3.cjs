const fs = require('fs');

let html = fs.readFileSync('koi.html', 'utf8');

// Get body content
const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/is);
if (!bodyMatch) {
  console.log('No body found');
  process.exit(1);
}
let bodyHtml = bodyMatch[1];

// Remove scripts and iframes
bodyHtml = bodyHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
bodyHtml = bodyHtml.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

// Convert common HTML attributes to React attributes
bodyHtml = bodyHtml.replace(/class=/g, 'className=');
bodyHtml = bodyHtml.replace(/for=/g, 'htmlFor=');
bodyHtml = bodyHtml.replace(/autocomplete=/gi, 'autoComplete=');
bodyHtml = bodyHtml.replace(/tabindex=/gi, 'tabIndex=');
bodyHtml = bodyHtml.replace(/maxlength=/gi, 'maxLength=');
bodyHtml = bodyHtml.replace(/autoplay=""/gi, 'autoPlay');
bodyHtml = bodyHtml.replace(/playsinline=""/gi, 'playsInline');
bodyHtml = bodyHtml.replace(/muted=""/gi, 'muted');
bodyHtml = bodyHtml.replace(/loop=""/gi, 'loop');

// SVGs
bodyHtml = bodyHtml.replace(/xmlns:xlink/g, 'xmlnsXlink');
bodyHtml = bodyHtml.replace(/xml:space/g, 'xmlSpace');
bodyHtml = bodyHtml.replace(/viewbox/gi, 'viewBox');
bodyHtml = bodyHtml.replace(/stroke-width/gi, 'strokeWidth');
bodyHtml = bodyHtml.replace(/stroke-linecap/gi, 'strokeLinecap');
bodyHtml = bodyHtml.replace(/stroke-linejoin/gi, 'strokeLinejoin');
bodyHtml = bodyHtml.replace(/fill-rule/gi, 'fillRule');
bodyHtml = bodyHtml.replace(/clip-rule/gi, 'clipRule');
bodyHtml = bodyHtml.replace(/stroke-dasharray/gi, 'strokeDasharray');
bodyHtml = bodyHtml.replace(/stroke-dashoffset/gi, 'strokeDashoffset');
bodyHtml = bodyHtml.replace(/stop-color/gi, 'stopColor');
bodyHtml = bodyHtml.replace(/stop-opacity/gi, 'stopOpacity');

// Remove styles entirely to avoid react style object errors, but webflow uses style for data-w-id initial states sometimes.
// Webflow's initial animation states: style="opacity:0;transform:translate3d(...)"
// We can convert these simple string styles to React style objects, or just let Webflow JS handle the initial states since Webflow JS reads data-w-id and applies styles. Actually Webflow JS might need them. Let's just remove them and see, or better, we convert them.
// Safest is to just remove style="..."
bodyHtml = bodyHtml.replace(/style="[^"]*"/gi, '');

// Self closing tags
bodyHtml = bodyHtml.replace(/<img([^>]*)>/g, (m, p1) => p1.endsWith('/') ? m : <img />);
bodyHtml = bodyHtml.replace(/<br([^>]*)>/g, (m, p1) => p1.endsWith('/') ? m : <br />);
bodyHtml = bodyHtml.replace(/<input([^>]*)>/g, (m, p1) => p1.endsWith('/') ? m : <input />);
bodyHtml = bodyHtml.replace(/<hr([^>]*)>/g, (m, p1) => p1.endsWith('/') ? m : <hr />);
bodyHtml = bodyHtml.replace(/<source([^>]*)>/g, (m, p1) => p1.endsWith('/') ? m : <source />);

// Remove w-webflow-badge
bodyHtml = bodyHtml.replace(/<a[^>]*w-webflow-badge.*?<\/a>/gis, '');

// REPLACE TEXT WITH SAYA TEXT
// Hero
bodyHtml = bodyHtml.replace(/Palo Alto Networks Completes Acquisition of Koi to Secure the Agentic Endpoint/gi, 'SAYA TO JOIN PALO ALTO NETWORKS');
bodyHtml = bodyHtml.replace(/Read the press release/gi, 'READ THE PRESS RELEASE');
bodyHtml = bodyHtml.replace(/SECURE <span className="text-color-black">anything<\/span> with AN INSTALL BUTTON/gi, '<span className="text-[#f93f12]">CARE FOR</span> YOUR PARENTS <br/><span className="text-color-black">WITH</span> <span className="text-[#f93f12]">REAL PROTECTION</span>');
bodyHtml = bodyHtml.replace(/Use the Koi Endpoint Security Platform to secure any software install, allowing your teams to fly free\. Govern all software, packages, MCPs, extensions, AI models, AI agents, and containers, securing everything before it reaches your endpoints\./gi, 'Use the Saya Companion Platform to secure their daily lives, allowing them to live free. Monitor health, prevent scams, govern devices, and ensure their safety every single day.');

// Trust Logos Title
bodyHtml = bodyHtml.replace(/The world’s leading security teams use Koi/gi, 'FAMILIES TRUST SYSTEMS THAT ACT BEFORE PROBLEMS');

// Customer Story
bodyHtml = bodyHtml.replace(/Cambia Health Solutions brings <span className="u-text-color-orange">“secure every install”<\/span> to life with Koi/gi, 'CAMBIA HEALTH SOLUTIONS BRINGS <span className="u-text-color-orange">“SECURE EVERY INSTALL”</span> TO LIFE WITH SAYA');

// Slider
bodyHtml = bodyHtml.replace(/Unprecedented endpoint visibility into <span className="text-color-black">every type of non-binary software\.<\/span>/gi, 'UNPRECEDENTED ENDPOINT VISIBILITY INTO <span className="text-color-black">EVERY TYPE OF NON-BINARY SOFTWARE.</span>');

// Threats
bodyHtml = bodyHtml.replace(/THREAT ACTORS <span className="text-color-yellow">ARE HAVING A BALL\.<\/span>/gi, 'THREAT ACTORS <span className="text-color-yellow">ARE HAPPENING SILENTLY.</span>');

// Options
bodyHtml = bodyHtml.replace(/Like most companies, you’re probably stuck between three bad options/gi, 'LIKE MOST FAMILIES, YOU’RE PROBABLY STUCK BETWEEN THREE BAD OPTIONS');
bodyHtml = bodyHtml.replace(/How do you stay productive and secure\?/gi, 'HOW DO YOU STAY SAFE AND CONNECTED?');

// Unified Platform
bodyHtml = bodyHtml.replace(/One unified platform to secure <span className="text-color-black">all software<\/span>/gi, 'ONE UNIFIED PLATFORM TO SECURE <span className="text-color-black">ALL SOFTWARE</span>');

// Demo
bodyHtml = bodyHtml.replace(/Watch a 3-minute demo/gi, 'WATCH A 3-MINUTE DEMO');
bodyHtml = bodyHtml.replace(/See how Koi secures all software—from the browser to the OS—making your environment bulletproof\./gi, 'See how Saya secures your parents daily lives—from preventing scams to monitoring health—making their world safer.');

// General 'Koi' -> 'Saya'
bodyHtml = bodyHtml.replace(/Koi/g, 'Saya');
bodyHtml = bodyHtml.replace(/koi/g, 'saya');

// Replace videos with svgs
// Let's replace the whole <div ...><video>...</video></div> with <img src="..." className="..." />
// Wait, the Webflow animations are on the wrapper divs, so we shouldn't replace the wrappers.
// Webflow videos:
// 1. Hero video: 
bodyHtml = bodyHtml.replace(/<video[^>]*id="[^\"]*7b80-video"[^>]*>.*?<\/video>/gis, '<img src="/koi-assets/67cff79fcaed643331eecdea_ico.svg" className="absolute inset-0 w-full h-full object-cover" />');
// 2. Island 1:
bodyHtml = bodyHtml.replace(/<video[^>]*id="[^\"]*f197-video"[^>]*>.*?<\/video>/gis, '<img src="/koi-assets/6836d87262e4ca8706e98a77_coud01.svg" className="absolute inset-0 w-full h-full object-cover" />');
// 3. Island 2:
bodyHtml = bodyHtml.replace(/<video[^>]*id="[^\"]*d6ca-video"[^>]*>.*?<\/video>/gis, '<img src="/koi-assets/6836d873d735542d459f0382_cloud02.svg" className="absolute inset-0 w-full h-full object-cover" />');
// 4. Island 3:
bodyHtml = bodyHtml.replace(/<video[^>]*id="[^\"]*8da0-video"[^>]*>.*?<\/video>/gis, '<img src="/koi-assets/684784407bdfce7b70bc9062_icon12.svg" className="absolute inset-0 w-full h-full object-cover" />');

// CS Video placeholder image (if there's a poster we can leave it)
// We also replace <video> with <img> generally just in case
bodyHtml = bodyHtml.replace(/<video[^>]*>.*?<\/video>/gis, '<img src="/koi-assets/684784407bdfce7b70bc9062_icon12.svg" className="absolute inset-0 w-full h-full object-cover" />');


const jsx = 
import React, { useEffect } from 'react';
import { DottedBackground } from "./DottedBackground";

export function LandingPage() {
  useEffect(() => {
    // Re-initialize Webflow animations
    if (window.Webflow) {
      window.Webflow.destroy();
      window.Webflow.ready();
      window.Webflow.require('ix2').init();
    }
  }, []);

  return (
    <>
      <DottedBackground />
      <div className="page-wrapper relative z-10">
        
      </div>
    </>
  );
}
;

fs.writeFileSync('src/app/components/LandingPage.tsx', jsx);
console.log('Conversion successful!');
