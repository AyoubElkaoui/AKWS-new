import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

// Initialize when DOM is loaded
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeAnimations();
    initializeInteractivity();
    initializeScrollEffects();
  });
}

function initializeAnimations() {
  // Hero text reveal animation
  gsap.timeline()
    .from('.hero-title', {
      y: 100,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out'
    })
    .from('.hero-subtitle', {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power2.out'
    }, '-=0.6')
    .from('.hero-cta', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.4')
    .from('.trust-indicators', {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.2');

  // Floating background orbs
  gsap.to('.floating-orb-1', {
    y: -30,
    x: 20,
    duration: 4,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1
  });

  gsap.to('.floating-orb-2', {
    y: 20,
    x: -15,
    duration: 3,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1,
    delay: 1
  });
}

function initializeInteractivity() {
  // Magnetic buttons effect
  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    const button = btn as HTMLElement;
    
    button.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
      
      gsap.to(button, {
        x: x,
        y: y,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    });
  });

  // Interactive cards hover effect
  document.querySelectorAll('.interactive-card').forEach(card => {
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

export {};
