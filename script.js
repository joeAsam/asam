// LOADER
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    initAnimations();
  }, 1800);
});

document.body.style.overflow = 'hidden';

// CUSTOM CURSOR
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
const glowOrb = document.getElementById('glow-orb');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
  if (glowOrb) {
    glowOrb.style.left = mouseX + 'px';
    glowOrb.style.top = mouseY + 'px';
  }
});

function animateCursor() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

const hoverElements = document.querySelectorAll('a, button, .magnetic, input, textarea');
hoverElements.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hover');
    follower.classList.add('hover');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hover');
    follower.classList.remove('hover');
  });
});

// MAGNETIC EFFECT
const magneticElements = document.querySelectorAll('.magnetic');
magneticElements.forEach(el => {
  const strength = parseInt(el.dataset.strength) || 25;

  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * strength / 80}px, ${y * strength / 80}px)`;
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'translate(0, 0)';
    el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => { el.style.transition = ''; }, 600);
  });
});

// SCROLL REVEAL
function initAnimations() {
  const revealElements = document.querySelectorAll('.anim-reveal');
  const sectionElements = document.querySelectorAll('.section, .testimonial-section');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.05 });

  sectionElements.forEach(el => sectionObserver.observe(el));

  // Skill bars
  const skillFills = document.querySelectorAll('.skill-fill');
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const width = entry.target.dataset.width;
        entry.target.style.width = width + '%';
      }
    });
  }, { threshold: 0.5 });

  skillFills.forEach(el => skillObserver.observe(el));
}

// NAV SCROLL EFFECT
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// MOBILE MENU
const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// SMOOTH SCROLL WITH HEAVY EASE-OUT
var scrollState = {
  targetY: 0,
  animating: false,
  startTime: null,
  startY: 0,
  duration: 1000
};

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function smoothScrollTo(targetY, duration) {
  duration = duration || 1000;
  scrollState.startY = window.scrollY;
  scrollState.targetY = targetY;
  scrollState.startTime = null;
  scrollState.duration = duration;

  if (!scrollState.animating) {
    scrollState.animating = true;
    requestAnimationFrame(animateScroll);
  }
}

function animateScroll(timestamp) {
  if (!scrollState.startTime) scrollState.startTime = timestamp;
  var elapsed = timestamp - scrollState.startTime;
  var progress = Math.min(elapsed / scrollState.duration, 1);
  var ease = easeOutCubic(progress);
  var newY = scrollState.startY + (scrollState.targetY - scrollState.startY) * ease;
  window.scrollTo(0, newY);

  if (progress < 1) {
    requestAnimationFrame(animateScroll);
  } else {
    scrollState.animating = false;
  }
}

// Wheel smooth scroll (desktop only)
if (!('ontouchstart' in window)) {
  var wheelAccumulator = 0;
  var wheelTimer = null;

  document.addEventListener('wheel', function(e) {
    e.preventDefault();
    var delta = e.deltaY;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var current = window.scrollY;

    wheelAccumulator += delta;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(function() { wheelAccumulator = 0; }, 80);

    var target = current + wheelAccumulator * 1.5;
    target = Math.max(0, Math.min(target, maxScroll));
    smoothScrollTo(target, 900);
  }, { passive: false });
}

// Nav link smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    var href = this.getAttribute('href');
    var target = document.querySelector(href);
    if (target) {
      var offset = 80;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      smoothScrollTo(top, 1200);
    }
  });
});

// FORM HANDLER
const form = document.getElementById('contact-form');
form.addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('.submit-btn');
  btn.classList.add('loading');
  setTimeout(() => {
    btn.classList.remove('loading');
    btn.classList.add('success');
    this.reset();
    document.dispatchEvent(new CustomEvent('contact-form-success'));
    setTimeout(() => { btn.classList.remove('success'); }, 2500);
  }, 1500);
});

// TILT EFFECT ON PROJECTS
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 768) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-10px) scale(1.01)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)';
    card.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => { card.style.transition = ''; }, 700);
  });
});

// SERVICE CARD TILT
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 768) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)';
    card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => { card.style.transition = ''; }, 600);
  });
});

// TEXT SPLIT ANIMATION (Hero words)
function initHeroAnimation() {
  const words = document.querySelectorAll('.hero-word');
  words.forEach((word, i) => {
    word.style.opacity = '0';
    word.style.transform = 'translateY(100%)';
    word.style.transition = `opacity 0.6s ease ${0.1 + i * 0.08}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.08}s`;
  });

  setTimeout(() => {
    words.forEach(word => {
      word.style.opacity = '1';
      word.style.transform = 'translateY(0)';
    });
  }, 2000);
}

initHeroAnimation();

// CLOSE MOBILE MENU ON RESIZE
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    if (hamburger) hamburger.classList.remove('active');
    if (mobileMenu) mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// MOBILE ICON NAV - Active Section Tracking
const mobileIconNav = document.getElementById('mobile-icon-nav');
if (mobileIconNav) {
  const iconLinks = mobileIconNav.querySelectorAll('.mobile-icon-link');
  const sectionIds = Array.from(iconLinks).map(link => {
    const href = link.getAttribute('href');
    return href.includes('#') ? href.split('#')[1] : null;
  }).filter(Boolean);

  function updateActiveIcon() {
    let currentSection = 'hero';
    for (let i = sectionIds.length - 1; i >= 0; i--) {
      const el = document.getElementById(sectionIds[i]);
      if (el && el.getBoundingClientRect().top <= 120) {
        currentSection = sectionIds[i];
        break;
      }
    }
    iconLinks.forEach(link => {
      const href = link.getAttribute('href');
      const section = href.includes('#') ? href.split('#')[1] : null;
      if (section === currentSection) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveIcon, { passive: true });
  updateActiveIcon();
}