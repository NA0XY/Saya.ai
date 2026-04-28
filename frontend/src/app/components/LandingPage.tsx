import { useRef, useEffect, useState } from 'react';
import { useLenisScroll } from '../hooks/useLenisScroll';
import { useCloudDrift } from '../hooks/useCloudDrift';
import { AnnouncementBar } from './AnnouncementBar';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { TrustLogos } from './TrustLogos';
import { CaseStudy } from './CaseStudy';
import { IslandCarousel } from './IslandCarousel';
import { BlueAlertSection } from './BlueAlertSection';
import { ProblemFraming } from './ProblemFraming';
import { IntroSection } from './IntroSection';
import { UnifiedPlatformSection } from './UnifiedPlatformSection';
import { FlagsSection } from './FlagsSection';
import { DemoSection } from './DemoSection';
import { WingsSection } from './WingsSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';

declare global {
  interface Window {
    Webflow?: any;
    gsap?: any;
    ScrollTrigger?: any;
    Observer?: any;
    ScrollSmoother?: any;
  }
}

export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize smooth scroll
  useLenisScroll();

  // Initialize cloud drift animations
  useCloudDrift(pageRef);

  // Register GSAP plugins
  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger, window.Observer, window.ScrollSmoother);
    }
    // Set ready after a small delay to ensure styles and components are settled
    const timer = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="smooth-wrapper" className="page-wrapper" ref={pageRef} style={{ opacity: isReady ? 1 : 0, transition: 'opacity 0.4s ease-in-out' }}>
      {/* Global styles embed (responsive utilities) */}
      <div className="global-styles w-embed" style={{ display: 'none' }}></div>

      {/* Navbar area */}
      <div className="navbar">
        <AnnouncementBar />
        <Navbar />
      </div>

      {/* Main scrollable content */}
      <div id="smooth-content" className="dots-wrapper">
        <div data-speed="0.5" className="dots-container"></div>
        <main className="main-wrapper">
          <HeroSection />
          <IslandCarousel />
          <BlueAlertSection />
          <ProblemFraming />
          <IntroSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
