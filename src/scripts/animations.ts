import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import VanillaTilt from 'vanilla-tilt';
import Splitting from 'splitting';

const supportsWindow = typeof window !== 'undefined';
const reducedMotionQuery = supportsWindow ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
const lowThreadDevice = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency ?? 8) <= 4 : false;

const shouldSkipMotion = () => !!(reducedMotionQuery?.matches || lowThreadDevice);
let hasBootstrapped = false;

if (supportsWindow) {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);

  const bootstrapAnimations = () => {
    if (hasBootstrapped) return;

    if (shouldSkipMotion()) {
      document.documentElement.classList.add('prefers-reduced-motion');
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
      hasBootstrapped = true;
      return;
    }

    hasBootstrapped = true;
    initializeSplitTextAnimations();
    initializeAnimations();
    initializeInteractivity();
    initializeScrollEffects();
    initializeTiltEffects();
    initializeUnderlineAnimations();
    initializeRevealAnimations();
    initializeParallaxElements();
    initializeServicesPageAnimations();
  };

  document.addEventListener('DOMContentLoaded', () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(bootstrapAnimations, { timeout: 1200 });
    } else {
      window.setTimeout(bootstrapAnimations, 160);
    }
  });

  reducedMotionQuery?.addEventListener('change', bootstrapAnimations);
}

function initializeAnimations() {
  const heroContent = document.querySelector('.hero-surge__content');

  if (heroContent) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    gsap.set('[data-hero-slide]', { opacity: 0, visibility: 'hidden' });
    const firstSlide = document.querySelector('[data-hero-slide][data-slide-index="0"]');
    if (firstSlide) {
      gsap.set(firstSlide, { opacity: 1, visibility: 'visible' });
    }

    tl.from(heroContent, {
      y: 50,
      opacity: 0,
      duration: 1.1,
    })
      .from(
        '.hero-surge__headline',
        {
          y: 60,
          opacity: 0,
          duration: 1,
        },
        '-=0.7'
      )
      .from(
        '.hero-surge__summary',
        {
          y: 34,
          opacity: 0,
          duration: 0.9,
          ease: 'power2.out',
        },
        '-=0.7'
      )
      .from(
        '.hero-surge__cta',
        {
          y: 32,
          opacity: 0,
          duration: 0.65,
          ease: 'power2.out',
        },
        '-=0.45'
      );
    if (!isMobile) {
      tl.add(
        gsap.fromTo(
          '[data-hero-slide][data-slide-index="0"]',
          { opacity: 0, visibility: 'hidden' },
          {
            opacity: 1,
            visibility: 'visible',
            duration: 0.6,
            ease: 'power3.out',
          }
        ),
        '-=0.3'
      );
    }

    const headlineChars = document.querySelectorAll('.hero-surge__headline .char');
    if (headlineChars.length) {
      gsap.from(headlineChars, {
        yPercent: 120,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.015,
        delay: 0.15,
      });
    }

    gsap.from('.hero-surge__stage canvas', {
      scale: 0.92,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.5,
    });

    gsap.from('.hero-surge__stage', {
      y: 70,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      delay: 0.45,
    });

    const hero = document.querySelector('.hero-surge');
    if (hero) {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        const scrollTl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '+=130%',
            scrub: true,
            pin: true,
          },
        });

        scrollTl
          .to(hero, {
            '--hero-scene-scale': 1.18,
            '--hero-bg-shift': '-140px',
          }, 0)
          .to('.hero-surge__headline', {
            scale: 0.88,
            yPercent: -8,
            filter: 'blur(4px)',
          }, 0.3)
          .to('.hero-surge__summary', {
            opacity: 0,
          }, 0.3)
          .to('.hero-surge__content', {
            yPercent: -12,
            opacity: 0.3,
          }, 0.35)
          .to('.hero-surge__stage', {
            scale: 1.08,
            rotateZ: 3,
          }, 0.35);

        const slides = gsap.utils.toArray<HTMLElement>('[data-hero-slide]');
        slides.forEach((slide, index) => {
          const enterTime = 0.38 + index * 0.35;
          scrollTl
            .to(slide, {
              opacity: 1,
              visibility: 'visible',
              duration: 0.45,
            }, enterTime)
            .to(slide, {
              opacity: 0,
              visibility: 'hidden',
              duration: 0.35,
            }, enterTime + 0.35);
        });

        return () => {
          scrollTl.scrollTrigger?.kill();
          scrollTl.kill();
          gsap.set(hero, {
            '--hero-scene-scale': 1,
            '--hero-bg-shift': '0px',
          });
          gsap.set('.hero-surge__headline', { clearProps: 'scale,filter,yPercent' });
          gsap.set('.hero-surge__summary', { clearProps: 'opacity' });
          gsap.set('.hero-surge__content', { clearProps: 'yPercent,opacity' });
          slides.forEach((slide) => {
            gsap.set(slide, { opacity: 0, visibility: 'hidden' });
          });
          const firstSlide = document.querySelector('[data-hero-slide][data-slide-index="0"]');
          if (firstSlide) {
            gsap.set(firstSlide, { opacity: 1, visibility: 'visible' });
          }
        };
      });
    }
  }

  const hero = document.querySelector('.hero-surge');
  const heroCursor = document.querySelector<HTMLElement>('[data-hero-cursor]');
  if (hero && heroCursor && window.matchMedia('(pointer: fine)').matches) {
    const moveCursor = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      gsap.to(heroCursor, {
        x,
        y,
        duration: 0.35,
        ease: 'power2.out',
      });
    };

    hero.addEventListener('pointerenter', () => {
      heroCursor.style.opacity = '1';
    });
    hero.addEventListener('pointerleave', () => {
      heroCursor.style.opacity = '0';
    });
    hero.addEventListener('pointermove', moveCursor);
  }
}

function initializeRevealAnimations() {
  const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!elements.length || typeof IntersectionObserver === 'undefined') return;

  // Mobile optimization: trigger reveals earlier and with faster animations
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  // On mobile: reveal elements 150px before they enter viewport for snappier feel
  // On desktop: reveal at -5% for smoother experience
  const rootMargin = isMobile ? '0px 0px 150px 0px' : '0px 0px -5% 0px';
  const threshold = isMobile ? 0.05 : 0.1;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin, threshold }
  );

  elements.forEach((el) => {
    // Speed up animation duration on mobile for snappier reveals
    if (isMobile) {
      el.style.setProperty('--reveal-duration', '0.4s');
    }
    observer.observe(el);
  });
}

function initializeParallaxElements() {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (!elements.length) return;

  let ticking = false;

  const update = () => {
    elements.forEach((el) => {
      const speed = Number.parseFloat(el.dataset.parallax ?? '0.15');
      const rect = el.getBoundingClientRect();
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      const translate = -offset * speed;
      el.style.setProperty('--parallax-offset', `${translate}px`);
    });
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };

  update();
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
}

function initializeInteractivity() {
  const spotlight = document.querySelector<HTMLElement>('[data-spotlight]');

  if (spotlight && window.matchMedia('(pointer: fine)').matches) {
    const updateSpotlight = (xPercent: number, yPercent: number) => {
      gsap.to(spotlight, {
        duration: 0.6,
        ease: 'power3.out',
        '--spotlight-x': `${xPercent}%`,
        '--spotlight-y': `${yPercent}%`,
      });
    };

    updateSpotlight(50, 45);

    spotlight.addEventListener('mousemove', (event) => {
      const rect = spotlight.getBoundingClientRect();
      const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((event.clientY - rect.top) / rect.height) * 100;

      updateSpotlight(xPercent, yPercent);
    });

    spotlight.addEventListener('mouseleave', () => {
      updateSpotlight(50, 45);
    });
  }

  // Interactive cards hover effect
  document.querySelectorAll('.interactive-card, .pulse-card').forEach(card => {
    const cardElement = card as HTMLElement;
    
    cardElement.addEventListener('mouseenter', () => {
      gsap.to(cardElement, {
        scale: 1.05,
        rotationY: 5,
        rotationX: 2,
        duration: 0.4,
        ease: 'power2.out',
        transformOrigin: 'center center'
      });
      
      gsap.to(cardElement.querySelector('.card-glow'), {
        opacity: 0.6,
        scale: 1.2,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
    
    cardElement.addEventListener('mouseleave', () => {
      gsap.to(cardElement, {
        scale: 1,
        rotationY: 0,
        rotationX: 0,
        duration: 0.4,
        ease: 'power2.out'
      });
      
      gsap.to(cardElement.querySelector('.card-glow'), {
        opacity: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
    });

    // Tilt effect
    cardElement.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = cardElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
      
      gsap.to(cardElement, {
        rotationY: x * 0.5,
        rotationX: -y * 0.5,
        duration: 0.3,
        ease: 'power2.out',
        transformOrigin: 'center center'
      });
    });
  });

  // Button click animations
  document.querySelectorAll('.animated-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const button = btn as HTMLElement;
      const ripple = document.createElement('div');
      ripple.className = 'ripple-effect';
      
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = (e as MouseEvent).clientX - rect.left - size / 2;
      const y = (e as MouseEvent).clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        transform: scale(0);
      `;
      
      button.appendChild(ripple);
      
      gsap.to(ripple, {
        scale: 2,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      });
      
      // Navigate after animation
      setTimeout(() => {
        window.location.href = button.getAttribute('href') || '#';
      }, 300);
    });
  });
}

function initializeScrollEffects() {
  // Parallax backgrounds
  gsap.utils.toArray('.parallax-bg').forEach((element: any) => {
    gsap.to(element, {
      yPercent: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });

  // Reveal animations on scroll
  gsap.utils.toArray('.reveal-on-scroll').forEach((element: any) => {
    gsap.fromTo(element, 
      {
        y: 100,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // Stagger animations for groups
  gsap.utils.toArray('.stagger-children').forEach((container: any) => {
    const children = container.children;
    
    gsap.fromTo(children,
      {
        y: 80,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  // Card entrance animations
  gsap.utils.toArray('.glow-ring').forEach((card: any) => {
    gsap.from(card, {
      opacity: 0,
      y: 60,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
      },
    });
  });

  // Number counter animations
  document.querySelectorAll('.counter').forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target') || '0');
    
    ScrollTrigger.create({
      trigger: counter,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(counter, {
          innerHTML: target,
          duration: 2,
          ease: 'power2.out',
          snap: { innerHTML: 1 },
          onUpdate: function() {
            (counter as HTMLElement).innerHTML = Math.floor(this.targets()[0].innerHTML).toString();
          }
        });
      }
    });
  });

  // Header hide/show on scroll
  let lastScrollY = 0;
  const header = document.querySelector('header');
  
  if (header) {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const currentScrollY = self.scroll();
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down - hide header
          gsap.to(header, {
            yPercent: -100,
            duration: 0.3,
            ease: 'power2.out'
          });
        } else {
          // Scrolling up - show header
          gsap.to(header, {
            yPercent: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
        
        lastScrollY = currentScrollY;
      }
    });
  }

  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        progressBar.style.transform = `scaleX(${self.progress})`;
      },
    });
  }
}

function initializeTiltEffects() {
  const tiltElements = document.querySelectorAll<HTMLElement>('.tilt-card');

  if (!tiltElements.length) {
    return;
  }

  VanillaTilt.init(tiltElements as NodeListOf<Element>, {
    max: 8,
    speed: 500,
    glare: true,
    'max-glare': 0.25,
    perspective: 1200,
    gyroscope: true,
  });
}

function initializeSplitTextAnimations() {
  const results = Splitting({ target: '[data-split]', by: 'chars' }) as Array<{ el: HTMLElement; chars: HTMLElement[] }>;

  if (!results.length) {
    return;
  }

  results.forEach(({ el, chars }) => {
    gsap.set(chars, { yPercent: 140, opacity: 0 });

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(chars, {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.015,
        });
      },
      onLeaveBack: () => {
        gsap.to(chars, {
          yPercent: 140,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.in',
          stagger: { each: 0.012, from: 'end' },
        });
      },
    });
  });
}

function initializeUnderlineAnimations() {
  const underlines = document.querySelectorAll<HTMLElement>('[data-animate="underline"]');

  if (!underlines.length) {
    return;
  }

  underlines.forEach((element) => {
    ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      onEnter: () => element.setAttribute('data-active', 'true'),
      onLeaveBack: () => element.setAttribute('data-active', 'false'),
    });
  });
}

// Advanced cursor effect
class AdvancedCursor {
  private cursor!: HTMLElement;
  private follower!: HTMLElement;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private cursorX: number = 0;
  private cursorY: number = 0;
  private followerX: number = 0;
  private followerY: number = 0;

  constructor() {
    if (window.innerWidth > 1024) {
      this.createCursor();
      this.bindEvents();
      this.animate();
    }
  }

  createCursor() {
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    this.cursor.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 10px;
      height: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: difference;
    `;

    this.follower = document.createElement('div');
    this.follower.className = 'cursor-follower';
    this.follower.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 40px;
      height: 40px;
      border: 2px solid rgba(102, 126, 234, 0.4);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transition: all 0.15s ease;
    `;

    document.body.appendChild(this.cursor);
    document.body.appendChild(this.follower);
  }

  bindEvents() {
    document.addEventListener('mousemove', (e: MouseEvent) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    // Scale cursor on hover
    document.querySelectorAll('a, button, .interactive').forEach(el => {
      el.addEventListener('mouseenter', () => {
        gsap.to(this.follower, {
          scale: 1.5,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(this.follower, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  }

  animate() {
    // Smooth cursor following
    this.cursorX += (this.mouseX - this.cursorX) * 0.9;
    this.cursorY += (this.mouseY - this.cursorY) * 0.9;
    
    this.followerX += (this.mouseX - this.followerX) * 0.1;
    this.followerY += (this.mouseY - this.followerY) * 0.1;

    this.cursor.style.transform = `translate3d(${this.cursorX - 5}px, ${this.cursorY - 5}px, 0)`;
    this.follower.style.transform = `translate3d(${this.followerX - 20}px, ${this.followerY - 20}px, 0)`;

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize advanced cursor
if (typeof window !== 'undefined') {
  new AdvancedCursor();
}

function initializeServicesPageAnimations() {
  // Services page card animations with stagger
  gsap.utils.toArray('.services-basic__card').forEach((card: any, index: number) => {
    gsap.fromTo(card,
      {
        opacity: 0,
        y: 60,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        delay: index * 0.1
      }
    );
  });

  // Steps animation
  gsap.utils.toArray('.services-basic__step').forEach((step: any, index: number) => {
    const numberBadge = step.querySelector('span');
    
    gsap.fromTo(step,
      {
        opacity: 0,
        x: -50,
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: step,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        delay: index * 0.15
      }
    );

    // Animate number badge separately
    if (numberBadge) {
      gsap.fromTo(numberBadge,
        {
          scale: 0,
          rotation: -180,
        },
        {
          scale: 1,
          rotation: 0,
          duration: 0.6,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: step,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
          delay: index * 0.15 + 0.3
        }
      );
    }
  });

  // Delivery articles animation
  gsap.utils.toArray('.services-basic__delivery article').forEach((article: any, index: number) => {
    gsap.fromTo(article,
      {
        opacity: 0,
        y: 50,
        rotateX: 45,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: article,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        delay: index * 0.1
      }
    );
  });

  // List articles with cascade effect
  gsap.utils.toArray('.services-basic__list article').forEach((article: any, index: number) => {
    gsap.fromTo(article,
      {
        opacity: 0,
        scale: 0.9,
        y: 40,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.7,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: article,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        delay: index * 0.08
      }
    );
  });

  // FAQ items animation
  gsap.utils.toArray('.services-basic__faq-item').forEach((item: any, index: number) => {
    gsap.fromTo(item,
      {
        opacity: 0,
        x: -30,
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        },
        delay: index * 0.08
      }
    );
  });

  // Testimonial card animation
  const testimonialCard = document.querySelector('.services-basic__testimonial-card');
  if (testimonialCard) {
    gsap.fromTo(testimonialCard,
      {
        opacity: 0,
        scale: 0.95,
        y: 50,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: testimonialCard,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // CTA box animation
  const ctaBox = document.querySelector('.services-basic__cta-box');
  if (ctaBox) {
    gsap.fromTo(ctaBox,
      {
        opacity: 0,
        y: 60,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ctaBox,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // Animate headers with underline
  gsap.utils.toArray('.services-basic__header').forEach((header: any) => {
    const h2 = header.querySelector('h2');
    const p = header.querySelector('p');
    
    if (h2) {
      gsap.fromTo(h2,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Animate the underline
      const underline = h2.querySelector('::after');
      gsap.fromTo(h2,
        {
          '--underline-width': '0px',
        },
        {
          '--underline-width': '60px',
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
          delay: 0.4
        }
      );
    }
    
    if (p) {
      gsap.fromTo(p,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
          delay: 0.2
        }
      );
    }
  });

  // Buttons hover effects
  document.querySelectorAll('.services-basic__btn').forEach(btn => {
    const button = btn as HTMLElement;
    
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.3,
        ease: 'back.out(1.5)'
      });
    });
    
    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });

  // Parallax effect for hero
  const heroContent = document.querySelector('.services-basic__hero-content');
  if (heroContent) {
    gsap.to(heroContent, {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.services-basic__hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });
  }

  // Add reveal delays to elements
  document.querySelectorAll('[data-reveal]').forEach((el, index) => {
    (el as HTMLElement).style.setProperty('--reveal-delay', `${index * 0.05}s`);
  });
}

export {};
