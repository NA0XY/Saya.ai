export function initKoiScripts() {


// --- Script ---
!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);

// --- Script ---

  // Function to load the CookieConsent library
  function loadCookieConsent() {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.umd.js';
    script.onload = initCookieConsent;
    document.body.appendChild(script);
  }

  // Initialize CookieConsent after it's loaded
  function initCookieConsent() {
    CookieConsent.run({
      categories: {
        necessary: {
          enabled: true,
          readOnly: true
        },
        analytics: {}
      },
      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: 'We use cookies',
              description: 'This website uses cookies to enhance your browsing experience and analyze site traffic.',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              showPreferencesBtn: 'Manage preferences'
            },
            preferencesModal: {
              title: 'Manage cookie preferences',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              savePreferencesBtn: 'Save preferences',
              closeIconLabel: 'Close modal',
              sections: [
                {
                  title: 'Cookie Usage',
                  description: 'We use cookies to ensure the website functions properly and to analyze our traffic.'
                },
                {
                  title: 'Strictly Necessary cookies',
                  description: 'These cookies are essential for the proper functioning of the website and cannot be disabled.',
                  linkedCategory: 'necessary'
                },
                {
                  title: 'Analytics cookies',
                  description: 'These cookies collect information about how you use our website through Google Analytics. All data is anonymized.',
                  linkedCategory: 'analytics'
                },
                {
                  title: 'More information',
                  description: 'For any questions about our cookie policy, please <a href="#contact">contact us</a>.'
                }
              ]
            }
          }
        }
      },
      onConsent: function() {
        if (CookieConsent.acceptedCategory('analytics')) {
          loadGoogleAnalytics();
        }
      }
    });
  }
  
  function loadGoogleAnalytics() {
    // Add the Google Analytics script tag to HEAD
    var gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-J6G1Z71J31';
    document.head.appendChild(gtagScript);
    
    // Add the initialization code
    var inlineScript = document.createElement('script');
    inlineScript.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-J6G1Z71J31');
    `;
    document.head.appendChild(inlineScript);
  }

  // Load CookieConsent when the page is ready
  window.addEventListener('load', loadCookieConsent);


// --- Script ---

  function resizeIframe(obj) {
    obj.style.height = obj.contentWindow.document.documentElement.scrollHeight + 'px';
  }


// --- Script ---




// --- Script ---

  setTimeout(() => {
    const headers = document.querySelectorAll(".koi_tab_header");
    const visuals = document.querySelectorAll(".koi_tab_visual");

    if (!headers.length || !visuals.length) {
      console.warn("KOI Tabs: headers or visuals missing");
      return;
    }

    function resetTabs() {
      headers.forEach(h => h.classList.remove("is_active"));
      visuals.forEach(v => v.classList.remove("is_active"));
    }

    function activateTab(index) {
      resetTabs();

      if (headers[index]) headers[index].classList.add("is_active");
      if (visuals[index]) visuals[index].classList.add("is_active");
    }

    // Default active
    activateTab(0);

    headers.forEach((header, index) => {
      header.addEventListener("click", () => {
        activateTab(index);
      });
    });
  });


// --- Script ---

  let formSubmitted = false; // 🔑 flag

  // --- 1. Handle HubSpot form submit ---
  hbspt.forms.create({
    portalId: "145837766",
    formId: "35ceb746-cc72-400e-be92-1e3848d46757",
    region: "eu1",
    onFormSubmitted: function() {
      formSubmitted = true; // ✅ set flag to true

      const lightBox = document.querySelector(".demo_light-box");
      const formHolder = document.querySelector(".demo-form_full-screen");
      const playButton = document.querySelector(".demo_play-button");
      const iframe = lightBox?.querySelector("iframe");

      if (lightBox) lightBox.classList.remove("hide-vimeo");
      if (formHolder) formHolder.classList.remove("show"); // ❌ hide form
      if (playButton) playButton.classList.remove("hidden"); // ✅ show button

      if (iframe && window.Vimeo) {
        const player = new Vimeo.Player(iframe);
        player.setVolume(1); // 🔊 force volume on
        player.play().catch(err => console.error("Vimeo play error:", err));
      }
    }
  });

  // --- 2. Handle play button click ---
  setTimeout(() => {
    const playButton = document.querySelector(".demo_play-button");
    const formHolder = document.querySelector(".demo-form_full-screen");
    const lightBox = document.querySelector(".demo_light-box");
    const closeDemo = document.querySelector("[close-demo]"); // 🔑 new selector


    if (playButton) {
      playButton.addEventListener("click", () => {
        const iframe = lightBox?.querySelector("iframe");

        if (formSubmitted) {
          // ✅ After form submitted → open video directly
          if (lightBox) lightBox.classList.remove("hide-vimeo");
          if (iframe && window.Vimeo) {
            const player = new Vimeo.Player(iframe);
            player.setVolume(1); // 🔊 force volume on
            player.play().catch(err => console.error("Vimeo play error:", err));
          }
        } else {
          // ❌ Before form submitted → show form
          playButton.classList.add("hidden"); // ⛔ hide button
          if (formHolder) formHolder.classList.add("show"); // ✅ show form
          if (iframe && window.Vimeo) {
            const player = new Vimeo.Player(iframe);
            player.pause().catch(err => console.error("Vimeo pause error:", err));
          }
        }
      });
    }
               			 if (closeDemo && formHolder) {
               				   closeDemo.addEventListener("click", () => {
                        playButton.classList.remove("hidden"); // ⛔ hide button
                  		  formHolder.classList.remove("show");
  });
}

  });

  // --- 3. Handle lightbox click ---
  setTimeout(() => {
    const lightBox = document.querySelector(".demo_light-box");

    if (lightBox) {
      lightBox.addEventListener("click", (event) => {
        if (event.target.tagName.toLowerCase() === "iframe") return;

        const iframe = lightBox.querySelector("iframe");
        if (iframe && window.Vimeo) {
          const player = new Vimeo.Player(iframe);
          player.pause().catch(err => console.error("Vimeo pause error:", err));
        }

        lightBox.classList.add("hide-vimeo");
      });
    }
  });


// --- Script ---

setTimeout(() => {
  const text = document.querySelector(".demo-button_text");
  const playButton = document.querySelector(".demo_play-button");
  const animatedArea = document.querySelector(".demo-button_animated-area");

  let angle = 0;
  let normalSpeed = 0.1;             // base speed
  let hoverSpeed = normalSpeed * 4;  // 4x faster
  let speed = normalSpeed;

  // Rotation loop
  function rotate() {
    angle += (speed * 360) / 60; // ~60fps
    text.style.transform = `rotate(${angle}deg)`;
    requestAnimationFrame(rotate);
  }
  rotate();

  // --- only attach hover events if desktop ---
  if (window.innerWidth >= 992) {
    playButton.addEventListener("mouseenter", () => {
      // Scale up with transition
      animatedArea.style.transition = "transform 0.3s ease";
      animatedArea.style.transform = "scale(1.1)";

      // Boost rotation speed
      speed = hoverSpeed;

      // Reset speed after transition finishes
      const handleTransitionEnd = () => {
        speed = normalSpeed;
        animatedArea.removeEventListener("transitionend", handleTransitionEnd);
      };
      animatedArea.addEventListener("transitionend", handleTransitionEnd);
    });

    playButton.addEventListener("mouseleave", () => {
      animatedArea.style.transform = "scale(1)";
    });
  }
});


// --- Script ---
gsap.registerPlugin(ScrollTrigger,Observer,ScrollSmoother);

// --- Script ---

  const path = window.location.pathname;
	const isExcluded = path.startsWith("/blog/") || path.startsWith("/incident/");

  if (!isExcluded) {
    const lenis = new Lenis();
    const dotsContainer = document.querySelector(".dots-container");
    const speed = 0.5; // adjust speed here

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    lenis.on("scroll", ({ scroll }) => {
      if (dotsContainer) {
        dotsContainer.style.backgroundPosition = `center ${scroll * speed}px`;
        // or: dotsContainer.style.transform = `translateY(${scroll * speed}px)`;
      }
    });
  }


// --- Script ---

//Islands slider
class Custom3DCarousel {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.wrapper = this.container.querySelector(".swiper-wrapper");
    this.slides = this.container.querySelectorAll(".swiper-slide");
    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.touchEnabled = true;
    this.isDragging = false;
    this.dragStartX = 0;

    // Video elements
    this.videoIds = ["#islandRed", "#islandGold", "#islandBlue"];

    // Logo slider elements
    this.logoWrapper = document.querySelector('.slider-logos-wrapper');
    this.logoSliders = document.querySelectorAll('.slider_logos');

    this.positions = {
      left: 0,
      center: 1,
      right: 2,
    };

    this.init();
  }

  init() {
    this.setInitialPositions();
    this.addEventListeners();
    this.updateActiveVideo();
    this.initLogoSlider();

    console.log("Carousel initialized with", this.totalSlides, "slides");
  }

  initLogoSlider() {
    // Hide all logo sliders initially
    this.logoSliders.forEach((slider, index) => {
      slider.style.display = 'none';
      slider.style.opacity = '0';
      slider.style.transition = 'opacity 0.5s ease-in-out';
    });

    // Show the logo slider for the center position
    const centerIndex = this.positions.center;
    if (this.logoSliders[centerIndex]) {
      this.logoSliders[centerIndex].style.display = 'flex';
      setTimeout(() => {
        this.logoSliders[centerIndex].style.opacity = '1';
      }, 50);
    }
    
    // Update alignment for initial position
    this.updateLogoAlignment(centerIndex);
  }

  setInitialPositions() {
    this.slides.forEach((slide) => {
      slide.className = slide.className.replace(/position-\w+/g, "");
      slide.classList.add("position-none");
    });

    this.slides[this.positions.left].classList.replace(
      "position-none",
      "position-left"
    );
    this.slides[this.positions.center].classList.replace(
      "position-none",
      "position-center"
    );
    this.slides[this.positions.right].classList.replace(
      "position-none",
      "position-right"
    );
  }

  slideLeft() {
    if (!this.touchEnabled) return;
    this.touchEnabled = false;

    this.updatePositions(-1);

    setTimeout(() => {
      this.touchEnabled = true;
    }, 600);
  }

  slideRight() {
    if (!this.touchEnabled) return;
    this.touchEnabled = false;

    this.updatePositions(1);

    setTimeout(() => {
      this.touchEnabled = true;
    }, 600);
  }

  updatePositions(direction) {
    // Store the current center position before updating
    const previousCenterIndex = this.positions.center;
    
    this.slides.forEach((slide) => {
      slide.className = slide.className.replace(/position-\w+/g, "");
      slide.classList.add("position-none");
    });

    Object.keys(this.positions).forEach((key) => {
      this.positions[key] =
        (this.positions[key] + direction + this.totalSlides) % this.totalSlides;
    });

    this.slides[this.positions.left].classList.replace(
      "position-none",
      "position-left"
    );
    this.slides[this.positions.center].classList.replace(
      "position-none",
      "position-center"
    );
    this.slides[this.positions.right].classList.replace(
      "position-none",
      "position-right"
    );

    this.updateActiveVideo();
    this.updateLogoSlider(previousCenterIndex);
  }

  updateLogoSlider(previousIndex = null) {
    const activeIndex = this.positions.center;
    
    // Ensure activeIndex is valid
    if (activeIndex < 0 || activeIndex >= this.logoSliders.length) {
      console.error('Invalid logo slider index:', activeIndex);
      return;
    }
    
    // Fade out all logo sliders
    this.logoSliders.forEach((slider, index) => {
      if (slider.style.opacity === '1' || slider.style.display === 'flex') {
        slider.style.opacity = '0';
      }
    });

    // After fade out completes, hide all and show the new one
    setTimeout(() => {
      this.logoSliders.forEach((slider) => {
        slider.style.display = 'none';
      });
      
      // Show and fade in the corresponding logo slider
      if (this.logoSliders[activeIndex]) {
        this.logoSliders[activeIndex].style.display = 'flex';
        // Force reflow before setting opacity
        void this.logoSliders[activeIndex].offsetHeight;
        setTimeout(() => {
          this.logoSliders[activeIndex].style.opacity = '1';
        }, 50);
      }
    }, 300);

    // Update alignment based on position
    this.updateLogoAlignment(activeIndex);
  }

  updateLogoAlignment(index) {
    if (!this.logoWrapper) return;

    // Remove all alignment classes
    this.logoWrapper.style.justifyContent = '';

    // Apply alignment based on slide position
    switch(index) {
      case 0: // First slide - align left
        this.logoWrapper.style.justifyContent = 'flex-start';
        break;
      case 1: // Second slide - align center
        this.logoWrapper.style.justifyContent = 'center';
        break;
      case 2: // Third slide - align right
        this.logoWrapper.style.justifyContent = 'flex-end';
        break;
      default:
        this.logoWrapper.style.justifyContent = 'center';
    }
  }

  updateActiveVideo() {
    // Pause all videos
    this.slides.forEach((slide) => {
      const videos = slide.querySelectorAll("video");
      videos.forEach((video) => {
        if (video && typeof video.pause === "function") {
          video.pause();
        }
      });
    });

    // Play only the video on the active slide
    const activeSlide = this.slides[this.positions.center];
    const videos = activeSlide.querySelectorAll("video");
    videos.forEach((video) => {
      if (video && typeof video.play === "function") {
        video.currentTime = 0;
        video.play().catch((e) => console.log("Video play error:", e));
      }
    });
  }

  addEventListeners() {
    // Navigation arrows
    const nextBtn = document.querySelector("#arrowNext");
    const prevBtn = document.querySelector("#arrowPrev");

    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.slideRight());
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.slideLeft());
    }

    let startX = 0;
    let startY = 0;
    let isScrolling = false;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isScrolling = false;
    };

    const handleTouchMove = (e) => {
      if (!isScrolling) {
        const diffY = Math.abs(e.touches[0].clientY - startY);
        const diffX = Math.abs(e.touches[0].clientX - startX);

        if (diffY > diffX) {
          isScrolling = true;
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (isScrolling) return;

      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        console.log("Swipe detected:", diff > 0 ? "left" : "right");
        if (diff > 0) {
          this.slideRight();
        } else {
          this.slideLeft();
        }
      }
    };

    const handleMouseDown = (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX;
      document.body.style.userSelect = "none";
    };

    const handleMouseMove = (e) => {
      if (!this.isDragging) return;
    };

    const handleMouseUp = (e) => {
      if (!this.isDragging) return;

      const dragEndX = e.clientX;
      const diff = this.dragStartX - dragEndX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.slideRight();
        } else {
          this.slideLeft();
        }
      }

      this.isDragging = false;
      document.body.style.userSelect = "";
    };

    const handleMouseLeave = () => {
      if (this.isDragging) {
        this.isDragging = false;
        document.body.style.userSelect = "";
      }
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    this.container.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
  }
}

initCarousel();

function initCarousel() {
  const carousel = new Custom3DCarousel(".swiper");

  window.carousel = carousel;

  console.log(
    "Custom 3D Carousel initialized with logo slider integration"
  );
}

//Clouds
const movementTypes = [
  {
    animation: (element) => {
      gsap.to(element, {
        x: "+=30",
        duration: 8 + Math.random() * 5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
  },
  {
    animation: (element) => {
      gsap.to(element, {
        x: "+=25",
        y: "-=15",
        duration: 10 + Math.random() * 6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
  },
  {
    animation: (element) => {
      gsap.to(element, {
        x: "+=25",
        y: "+=15",
        duration: 10 + Math.random() * 6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
  },
  {
    animation: (element) => {
      gsap.to(element, {
        x: "-=25",
        y: "-=15",
        duration: 10 + Math.random() * 6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
  },
  {
    animation: (element) => {
      gsap.to(element, {
        x: "-=25",
        y: "+=15",
        duration: 10 + Math.random() * 6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
  },
];

const clouds = document.querySelectorAll(".cloud");

clouds.forEach((cloud) => {
  const randomType = Math.floor(Math.random() * movementTypes.length);

  gsap.delayedCall(Math.random() * 2, () => {
    movementTypes[randomType].animation(cloud);
  });
});

//Rain
var drops = [];
var maxDrops = 300; // Total number of raindrops
var canvasOpacity = 0.3; // Opacity multiplier for rain

function setup() {
  let parentElement =
    document.getElementById("rain-container") || document.body;
  let canvas = createCanvas(
    parentElement.offsetWidth,
    parentElement.offsetHeight
  );
  canvas.parent(parentElement);
  canvas.style("background-color", "transparent");
}

function windowResized() {
  let parentElement =
    document.getElementById("rain-container") || document.body;
  resizeCanvas(parentElement.offsetWidth, parentElement.offsetHeight);

  for (var i = 0; i < drops.length; i++) {
    drops[i].reset();
  }
}

function draw() {
  clear(); 

  if (drops.length < maxDrops) {
    let dropsToAddThisFrame = Math.min(5, maxDrops - drops.length);
    for (let k = 0; k < dropsToAddThisFrame; k++) {
      drops.push(new Drop()); 
    }
  }

  for (var i = 0; i < drops.length; i++) {
    drops[i].show();
    drops[i].update();
  }
}

function Drop() {
  this.reset = function () {
    this.x = random(0, width + 100); 
    this.y = random(-300, -50); 
    this.length = random(20, 50); 
    this.thickness = random(1, 3); 
    this.speed = random(5, 10); 
    this.gravity = 0.5;
  };

  this.reset(); 

  this.angle = -PI / 12; 

  this.show = function () {
    let endX = this.x + this.length * sin(this.angle); 
    let endY = this.y + this.length * cos(this.angle); 

    let segments = 5; 
    let xStep = (endX - this.x) / segments;
    let yStep = (endY - this.y) / segments;

    push(); 

    for (let i = 0; i < segments; i++) {
      let segStartX = this.x + i * xStep;
      let segStartY = this.y + i * yStep;
      let segEndX = this.x + (i + 1) * xStep;
      let segEndY = this.y + (i + 1) * yStep;

      let progress = segments > 1 ? i / (segments - 1) : 1;
      let opacity = map(progress, 0, 1, 20, 255) * canvasOpacity;

      let r = 217;
      let g = 217;
      let b = 217;

      stroke(r, g, b, opacity); 
      strokeWeight(this.thickness);
      line(segStartX, segStartY, segEndX, segEndY);
    }

    noStroke();
    fill(217, 217, 217, 255 * canvasOpacity); 
    ellipse(endX, endY, this.thickness * 1.5, this.thickness * 1.5);

    pop();
  };

  this.update = function () {
    this.x += this.speed * this.gravity * sin(this.angle);
    this.y += this.speed * this.gravity * cos(this.angle);

    if (
      this.y > height + this.length ||
      this.x < -this.length - 100 ||
      this.x > width + 100 + this.length
    ) {
      this.x = random(0, width + 100); 
      this.y = random(-200, -50); 

      this.length = random(20, 50);
      this.thickness = random(1, 3);
      this.speed = random(5, 10);
    }
  };
}

//Swiper slider
const initIntroSlider = () => {
  if (window.innerWidth < 991) {
    const introSwiper = new Swiper(".intro_component", {
      slideClass: "intro_card",
      wrapperClass: "intro_wrapper",
      centeredSlides: false,
      loop: false,
      slidesPerView: 1.5,
      navigation: {
        nextEl: "#introRight",
        prevEl: "#introLeft"
      },
      breakpoints: {
        480: {
          slidesPerView: 1,
          spaceBetween: 28,
        },
        320: {
          slidesPerView: 1,
          spaceBetween: 28,
        },
      },
    });
    
    return introSwiper;
  }
  return null;
};

let introSwiper = initIntroSlider();

window.addEventListener('resize', () => {
  if (window.innerWidth < 991) {
    if (!introSwiper) {
      introSwiper = initIntroSlider();
    }
  } else {
    if (introSwiper) {
      introSwiper.destroy(true, true);
      introSwiper = null;
    }
  }
});


// --- Script ---

const popup = document.getElementById('vimeo-popup');
const triggers = document.querySelectorAll('#open-video, #open-video-banner');
const iframe = document.getElementById('vimeo-player');
const player = new Vimeo.Player(iframe);
const closeVideoButtons = document.querySelectorAll('[close-video-popup]');

// OPEN VIDEO (both triggers)
triggers.forEach(trigger => {
  trigger.addEventListener('click', () => {
    popup.style.display = 'flex';
    player.setVolume(1);
    player.setCurrentTime(0);
    player.play();
  });
});

// CLOSE VIDEO
closeVideoButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    popup.style.display = 'none';
    player.pause();
    player.setCurrentTime(0);
  });
});

}