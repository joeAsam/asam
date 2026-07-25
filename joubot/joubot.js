/* ============================================
   JOEBOT — Interactive Portfolio Mascot
   Phases 1-8: Core, Speech, Load, Scroll,
   Interaction, Idle, Chat, Easter Eggs
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // CONFIG
  // ============================================
  const CONFIG = {
    idleTimeout: 20000,
    blinkInterval: [2000, 6000],
    tipInterval: 25000,
    speechDuration: 4000,
    loadSequenceDelay: 2000,
    scrollOffset: 100,
    danceClickCount: 10,
    danceResetTime: 3000,
  };

  // ============================================
  // STATE
  // ============================================
  const state = {
    currentState: 'idle',
    previousState: null,
    mouseX: 0,
    mouseY: 0,
    isHovering: false,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    dragMoved: false,
    idleTimer: null,
    blinkTimer: null,
    tipTimer: null,
    speechQueue: [],
    speechActive: false,
    currentSection: 'hero',
    clickCount: 0,
    clickTimer: null,
    isDancing: false,
    isSleeping: false,
    isChatOpen: false,
    hasLoaded: false,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };

  // ============================================
  // DOM REFERENCES
  // ============================================
  const dom = {};

  function cacheDom() {
    dom.wrapper = document.getElementById('joubot');
    dom.character = document.getElementById('joubot-character');
    dom.bodyGroup = dom.character ? dom.character.querySelector('.joubot-body-group') : null;
    dom.speech = document.getElementById('joubot-speech');
    dom.speechText = document.getElementById('joubot-speech-text');
    dom.speechClose = document.getElementById('joubot-speech-close');
    dom.mouth = document.getElementById('joubot-mouth');
    dom.pupilL = document.getElementById('joubot-pupil-l');
    dom.pupilR = document.getElementById('joubot-pupil-r');
    dom.eyeL = document.getElementById('joubot-eye-l');
    dom.eyeR = document.getElementById('joubot-eye-r');
    dom.armL = document.getElementById('joubot-arm-l');
    dom.armR = document.getElementById('joubot-arm-r');
    dom.handL = document.getElementById('joubot-hand-l');
    dom.handR = document.getElementById('joubot-hand-r');
    dom.legL = dom.character ? dom.character.querySelector('.joubot-leg-l') : null;
    dom.legR = dom.character ? dom.character.querySelector('.joubot-leg-r') : null;
    dom.zzz = document.getElementById('joubot-zzz');
    dom.chatBtn = document.getElementById('joubot-chat-btn');
    dom.chatPanel = document.getElementById('joubot-chat-panel');
    dom.chatClose = document.getElementById('joubot-chat-close');
    dom.chatMessages = document.getElementById('joubot-chat-messages');
    dom.chatInput = document.getElementById('joubot-chat-input');
    dom.chatSend = document.getElementById('joubot-chat-send');
    dom.chatSuggestions = document.getElementById('joubot-chat-suggestions');
  }

  // ============================================
  // SPEECH SYSTEM (Phase 2)
  // ============================================
  function showSpeech(text, duration) {
    if (!dom.speech || !dom.speechText) return;
    dom.speechText.textContent = text;
    dom.speech.classList.remove('hidden', 'fade-out');
    dom.speech.classList.add('visible');
    state.speechActive = true;
    clearTimeout(state.speechTimer);
    if (duration) {
      state.speechTimer = setTimeout(() => hideSpeech(), duration);
    }
  }

  function hideSpeech() {
    if (!dom.speech) return;
    dom.speech.classList.add('fade-out');
    state.speechActive = false;
    setTimeout(() => {
      dom.speech.classList.remove('visible', 'fade-out');
      processSpeechQueue();
    }, 400);
  }

  function queueSpeech(text, duration) {
    state.speechQueue.push({ text, duration: duration || CONFIG.speechDuration });
    if (!state.speechActive) processSpeechQueue();
  }

  function processSpeechQueue() {
    if (state.speechQueue.length === 0) return;
    const next = state.speechQueue.shift();
    showSpeech(next.text, next.duration);
  }

  // ============================================
  // STATE MACHINE (Phase 1)
  // ============================================
  function setState(newState, silent) {
    if (state.currentState === newState) return;
    state.previousState = state.currentState;
    state.currentState = newState;
    dom.wrapper.setAttribute('data-state', newState);

    // Clear all state classes
    const states = ['idle', 'wave', 'happy', 'thinking', 'sleeping', 'excited', 'surprised', 'dancing', 'stretching', 'pointing', 'yawning', 'sitting'];
    states.forEach(s => dom.wrapper.classList.remove('state-' + s));

    // Apply new state class
    dom.wrapper.classList.add('state-' + newState);

    // Reset body tilt for states that animate the body
    if (['dancing', 'waving', 'stretching', 'sitting', 'pointing'].includes(newState) && dom.bodyGroup) {
      dom.bodyGroup.style.transform = '';
    }

    // State-specific actions
    switch (newState) {
      case 'wave':
        if (!silent) queueSpeech("👋 Hi! I'm JoeBot.", 3000);
        break;
      case 'sleeping':
        state.isSleeping = true;
        dom.zzz.classList.add('visible');
        break;
      case 'stretching':
        if (!silent) queueSpeech("Good morning! Ready to explore?", 3000);
        break;
      case 'dancing':
        state.isDancing = true;
        break;
      case 'sitting':
        if (!silent) queueSpeech("Thanks for visiting ❤️", 4000);
        break;
    }
  }

  // ============================================
  // EYE TRACKING (Phase 1)
  // ============================================
  function updateEyes() {
    if (state.isSleeping || !dom.pupilL) return;

    const rect = dom.character.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (state.mouseX - centerX) / window.innerWidth;
    const deltaY = (state.mouseY - centerY) / window.innerHeight;

    const range = 3;
    const px = deltaX * range;
    const py = deltaY * range;

    dom.pupilL.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
    dom.pupilR.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;

    const scaleX = 1 + Math.abs(deltaX) * 0.12;
    const scaleY = 1 + Math.abs(deltaY) * 0.08;
    dom.eyeL.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`;
    dom.eyeR.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`;

    // Arms follow mouse (skip during state animations)
    if (dom.armL && dom.armR && !state.isDragging) {
      const skipArmStates = ['wave', 'dancing', 'pointing', 'stretching', 'sitting'];
      if (!skipArmStates.includes(state.currentState)) {
        const armSwing = deltaX * 12;
        dom.armL.style.transform = `rotate(${armSwing}deg)`;
        dom.armR.style.transform = `rotate(${-armSwing}deg)`;
      }
    }

    // Legs shift weight (skip during state animations)
    if (dom.legL && dom.legR && !state.isDragging) {
      const skipLegStates = ['dancing', 'sitting'];
      if (!skipLegStates.includes(state.currentState)) {
        const legShift = deltaX * 4;
        dom.legL.style.transform = `rotate(${legShift}deg)`;
        dom.legR.style.transform = `rotate(${-legShift}deg)`;
      }
    }

    // Body follows mouse — subtle tilt and lean
    if (dom.bodyGroup && !state.isDragging) {
      const tiltX = deltaX * 5;
      const tiltY = deltaY * 3;
      dom.bodyGroup.style.transform = `rotate(${tiltX}deg) translate(${tiltX * 0.8}px, ${tiltY * 0.5}px)`;
    }
  }

  // ============================================
  // BLINKING (Phase 1)
  // ============================================
  function blink() {
    if (state.isSleeping) return;
    dom.eyeL.classList.add('blink');
    dom.eyeR.classList.add('blink');
    setTimeout(() => {
      dom.eyeL.classList.remove('blink');
      dom.eyeR.classList.remove('blink');
    }, 150);
    scheduleBlink();
  }

  function scheduleBlink() {
    const [min, max] = CONFIG.blinkInterval;
    const delay = min + Math.random() * (max - min);
    state.blinkTimer = setTimeout(blink, delay);
  }

  // ============================================
  // IDLE DETECTION (Phase 6)
  // ============================================
  function resetIdleTimer() {
    clearTimeout(state.idleTimer);
    if (state.isSleeping) {
      wakeUp();
    }
    state.idleTimer = setTimeout(startYawn, CONFIG.idleTimeout);
  }

  function startYawn() {
    if (state.isDancing || state.isChatOpen) return;
    setState('yawning');
    queueSpeech("*yawn*...", 2000);
    setTimeout(() => {
      setState('sleeping');
      queueSpeech("Zzz...", 0);
    }, 2500);
  }

  function wakeUp() {
    state.isSleeping = false;
    dom.zzz.classList.remove('visible');
    setState('stretching');
    setTimeout(() => {
      setState('happy');
      queueSpeech("Oh! You're still here? Let's go!", 3000);
      setTimeout(() => setState('idle'), 3000);
    }, 1500);
    resetIdleTimer();
  }

  // ============================================
  // SCROLL BEHAVIOR (Phase 4)
  // ============================================
  const sectionDialogues = {
    hero: "Welcome!",
    services: "He designs brands and builds websites.",
    work: "These are some of our favourite works.",
    experience: "Check out his professional journey.",
    about: "Want to know more about Joe?",
    contact: "Let's build something amazing together.",
  };

  function handleScroll() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    // Determine current section
    const sections = ['contact', 'about', 'experience', 'work', 'services', 'hero'];
    let detected = 'hero';

    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.6 && rect.bottom > vh * 0.2) {
          detected = id;
          break;
        }
      }
    }

    // Check footer
    const footer = document.querySelector('.footer');
    if (footer) {
      const footerRect = footer.getBoundingClientRect();
      if (footerRect.top < vh * 0.8) {
        detected = 'footer';
      }
    }

    if (detected !== state.currentSection) {
      state.currentSection = detected;

      // Don't interrupt sleeping or dancing
      if (state.isSleeping || state.isDancing) return;

      if (detected === 'footer') {
        setState('sitting');
      } else if (sectionDialogues[detected]) {
        setState('happy');
        queueSpeech(sectionDialogues[detected], 3500);
        setTimeout(() => {
          if (state.currentState === 'happy') setState('idle');
        }, 3500);
      }
    }

    // Floating effect — subtle parallax
    if (dom.character && !state.reducedMotion) {
      const floatOffset = Math.sin(scrollY * 0.005) * 6;
      dom.character.style.transform = `translateY(${floatOffset}px)`;
    }
  }

  // ============================================
  // DRAG TO MOVE
  // ============================================
  function handleDragStart(e) {
    // Don't drag if clicking buttons, links, chat, speech close
    if (e.target.closest('button, a, .joubot-chat-btn, .joubot-chat-panel, .joubot-speech-close')) return;

    const point = e.touches ? e.touches[0] : e;
    const rect = dom.wrapper.getBoundingClientRect();

    state.dragStartX = point.clientX;
    state.dragStartY = point.clientY;
    state.dragOffsetX = point.clientX - rect.left;
    state.dragOffsetY = point.clientY - rect.top;
    state.dragMoved = false;

    const onMove = (ev) => {
      const p = ev.touches ? ev.touches[0] : ev;
      const dx = p.clientX - state.dragStartX;
      const dy = p.clientY - state.dragStartY;

      // Only start dragging after 5px threshold
      if (!state.isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        state.isDragging = true;
        dom.wrapper.classList.add('dragging');
        dom.wrapper.style.animationPlayState = 'paused';
      }

      if (!state.isDragging) return;

      if (ev.cancelable) ev.preventDefault();
      state.dragMoved = true;

      let newLeft = p.clientX - state.dragOffsetX;
      let newTop = p.clientY - state.dragOffsetY;

      // Clamp to viewport
      const w = dom.wrapper.offsetWidth;
      const h = dom.wrapper.offsetHeight;
      newLeft = Math.max(0, Math.min(window.innerWidth - w, newLeft));
      newTop = Math.max(0, Math.min(window.innerHeight - h, newTop));

      dom.wrapper.style.left = newLeft + 'px';
      dom.wrapper.style.top = newTop + 'px';
      dom.wrapper.style.bottom = 'auto';

      // Reposition chat panel and chat button
      reposition附属Elements(newLeft, newTop, w, h);
    };

    const onEnd = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);

      if (state.isDragging) {
        state.isDragging = false;
        dom.wrapper.classList.remove('dragging');
        dom.wrapper.style.animationPlayState = '';
        savePosition();
      }
    };

    document.addEventListener('mousemove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }

  function reposition附属Elements(left, top, w, h) {
    // Chat button: to the right of the bot
    if (dom.chatBtn) {
      dom.chatBtn.style.left = (left + w + 10) + 'px';
      dom.chatBtn.style.top = (top + h / 2 - 24) + 'px';
      dom.chatBtn.style.bottom = 'auto';
    }

      // Chat panel: below the chat button
      if (dom.chatPanel && state.isChatOpen) {
        const btnRect = dom.chatBtn.getBoundingClientRect();
        dom.chatPanel.style.left = btnRect.left + 'px';
        dom.chatPanel.style.top = (btnRect.top - 10 - dom.chatPanel.offsetHeight) + 'px';
        dom.chatPanel.style.bottom = 'auto';
      }
  }

  function savePosition() {
    try {
      const rect = dom.wrapper.getBoundingClientRect();
      localStorage.setItem('joubot-pos', JSON.stringify({
        left: rect.left,
        top: rect.top
      }));
    } catch (e) {}
  }

  function loadPosition() {
    try {
      const saved = JSON.parse(localStorage.getItem('joubot-pos'));
      if (saved && typeof saved.left === 'number' && typeof saved.top === 'number') {
        const w = dom.wrapper.offsetWidth || 90;
        const h = dom.wrapper.offsetHeight || 140;
        const left = Math.max(0, Math.min(window.innerWidth - w, saved.left));
        const top = Math.max(0, Math.min(window.innerHeight - h, saved.top));

        dom.wrapper.style.left = left + 'px';
        dom.wrapper.style.top = top + 'px';
        dom.wrapper.style.bottom = 'auto';

        reposition附属Elements(left, top, w, h);
        return true;
      }
    } catch (e) {}
    return false;
  }

  // ============================================
  // MOUSE INTERACTIONS (Phase 5)
  // ============================================
  function handleMouseMove(e) {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
    updateEyes();
    resetIdleTimer();
  }

  function handleMouseHover(e) {
    const target = e.target.closest('.project-card, .service-card, .hero-cta, .hero-cta-outline, .contact-link, a[href]');
    if (target) {
      if (state.isSleeping || state.isDancing) return;

      if (target.closest('.project-card')) {
        setState('pointing');
        queueSpeech("This one's worth checking out!", 3000);
      } else if (target.closest('.hero-cta-outline') || target.closest('a[href="#contact"]')) {
        setState('excited');
        queueSpeech("Let's talk!", 2500);
      } else if (target.textContent.toLowerCase().includes('download') || target.textContent.toLowerCase().includes('cv')) {
        setState('happy');
        queueSpeech("Great choice.", 2500);
      }
    }
  }

  function handleClick(e) {
    // Don't process clicks after a drag
    if (state.dragMoved) return;

    if (state.isSleeping) {
      wakeUp();
      return;
    }

    // Check if clicked on JoeBot
    if (dom.wrapper.contains(e.target)) {
      e.stopPropagation();

      // Easter egg: dance on 10 clicks
      state.clickCount++;
      clearTimeout(state.clickTimer);
      state.clickTimer = setTimeout(() => { state.clickCount = 0; }, CONFIG.danceResetTime);

      if (state.clickCount >= CONFIG.danceClickCount && !state.isDancing) {
        setState('dancing');
        queueSpeech("🕺 You found my dance mode!", 4000);
        setTimeout(() => {
          state.isDancing = false;
          setState('happy');
          setTimeout(() => setState('idle'), 2000);
        }, 5000);
        state.clickCount = 0;
        return;
      }

      // Normal click reactions
      const reactions = ['happy', 'excited', 'surprised'];
      const reaction = reactions[Math.floor(Math.random() * reactions.length)];
      setState(reaction);

      const phrases = [
        "Hey! That tickles!",
        "Click click!",
        "Need help finding something?",
        "I'm here to help!",
        "Explore the portfolio!",
        "Joe made me with ❤️",
      ];
      queueSpeech(phrases[Math.floor(Math.random() * phrases.length)], 3000);
      setTimeout(() => {
        if (!state.isDancing && !state.isSleeping) setState('idle');
      }, 3000);
    }
  }

  // ============================================
  // PAGE LOAD SEQUENCE (Phase 3)
  // ============================================
  function runLoadSequence() {
    if (state.hasLoaded) return;
    state.hasLoaded = true;

    setState('wave', true);

    setTimeout(() => {
      showSpeech("👋 Hi! I'm JoeBot.", 3000);
    }, CONFIG.loadSequenceDelay);

    setTimeout(() => {
      showSpeech("Welcome to my creator's portfolio.", 3000);
    }, CONFIG.loadSequenceDelay + 3500);

    setTimeout(() => {
      showSpeech("I'll help you explore.", 3000);
    }, CONFIG.loadSequenceDelay + 7000);

    setTimeout(() => {
      hideSpeech();
      setState('idle');
    }, CONFIG.loadSequenceDelay + 10500);
  }

  // ============================================
  // CHAT SYSTEM (Phase 7)
  // ============================================
  const chatResponses = {
    'who is joe?': "Joseph Asam is a multidisciplinary creative specializing in graphic design, motion design, UI/UX design, and frontend development. Based in Lagos, Nigeria.",
    'show branding projects': "Let me show you Joe's branding work! Scrolling now...",
    'show ui projects': "Here are Joe's UI/UX projects! Let me scroll to them...",
    'show motion graphics': "Check out Joe's motion design work! Scrolling...",
    'what tools does joe use?': "Joe uses: Photoshop, Corel Draw, Figma, Illustrator, After Effects, and VS Code.",
    'how can i hire joe?': "You can reach Joe through the contact form or email him at joeasam2.00@gmail.com. He's available for freelance projects and collaborations!",
    'download cv': "You can download Joe's CV from his Behance profile. Let me take you there!",
    'contact joe': "Let me scroll to the contact section for you!",
  };

  function handleChatSend() {
    const input = dom.chatInput;
    const text = input.value.trim();
    if (!text) return;

    addChatMessage(text, 'user');
    input.value = '';

    // Hide suggestions after first message
    dom.chatSuggestions.style.display = 'none';

    // Find response
    const lower = text.toLowerCase();
    let response = "I'm not sure about that, but you can ask me about Joe's work, skills, or how to contact him!";

    for (const [key, val] of Object.entries(chatResponses)) {
      if (lower.includes(key) || key.includes(lower)) {
        response = val;
        break;
      }
    }

    // Check for project-related queries
    if (lower.includes('brand') || lower.includes('logo')) {
      response = chatResponses['show branding projects'];
      setTimeout(() => scrollToSection('work'), 1500);
    } else if (lower.includes('ui') || lower.includes('ux') || lower.includes('design')) {
      response = chatResponses['show ui projects'];
      setTimeout(() => scrollToSection('work'), 1500);
    } else if (lower.includes('motion') || lower.includes('animation')) {
      response = chatResponses['show motion graphics'];
      setTimeout(() => scrollToSection('work'), 1500);
    } else if (lower.includes('tool') || lower.includes('software')) {
      response = chatResponses['what tools does joe use?'];
    } else if (lower.includes('hire') || lower.includes('available') || lower.includes('freelance')) {
      response = chatResponses['how can i hire joe?'];
    } else if (lower.includes('contact') || lower.includes('email') || lower.includes('reach')) {
      response = chatResponses['contact joe'];
      setTimeout(() => scrollToSection('contact'), 1500);
    } else if (lower.includes('cv') || lower.includes('resume')) {
      response = chatResponses['download cv'];
    }

    // Simulate typing delay
    setTimeout(() => {
      addChatMessage(response, 'bot');
    }, 800 + Math.random() * 600);
  }

  function addChatMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `joubot-chat-msg joubot-chat-msg-${sender}`;
    msg.textContent = text;
    dom.chatMessages.appendChild(msg);
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function toggleChat() {
    state.isChatOpen = !state.isChatOpen;
    dom.chatPanel.classList.toggle('open', state.isChatOpen);
    dom.chatBtn.classList.toggle('active', state.isChatOpen);

    if (state.isChatOpen && dom.chatMessages.children.length === 0) {
      addChatMessage("Hey! I'm JoeBot 👋 Ask me anything about Joe's work or skills.", 'bot');
      dom.chatSuggestions.style.display = 'flex';
    }

    if (state.isChatOpen) {
      dom.chatInput.focus();
    }
  }

  // ============================================
  // CONFETTI (Phase 8)
  // ============================================
  function triggerConfetti() {
    const colors = ['#e8e8e8', '#e85d3a', '#a882ff', '#6ee7a0', '#f59e42'];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'joubot-confetti';
      confetti.style.cssText = `
        left: ${50 + (Math.random() - 0.5) * 60}vw;
        top: -10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-delay: ${Math.random() * 0.5}s;
        animation-duration: ${2 + Math.random() * 2}s;
      `;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4500);
    }
  }

  // ============================================
  // RANDOM TIPS (Phase 8)
  // ============================================
  const tips = [
    "Did you know? Joe specializes in brand identity design.",
    "Pro tip: Check out the project case studies for deeper insights.",
    "Fun fact: Joe has worked with 50+ clients worldwide.",
    "Tip: You can ask me anything by clicking the chat button!",
    "Did you know? Joe also does frontend web development.",
    "Pro tip: Each project has a detailed case study.",
  ];

  function showRandomTip() {
    if (state.isSleeping || state.isDancing || state.isChatOpen) return;
    if (state.currentSection === 'contact') return;
    const tip = tips[Math.floor(Math.random() * tips.length)];
    setState('curious');
    queueSpeech(tip, 5000);
    setTimeout(() => {
      if (state.currentState === 'curious') setState('idle');
    }, 5000);
  }

  // ============================================
  // CONTACT FORM CONFETTI
  // ============================================
  function watchContactForm() {
    document.addEventListener('contact-form-success', () => {
      triggerConfetti();
      setState('excited');
      queueSpeech("Message sent! Joe will get back to you soon!", 4000);
      setTimeout(() => setState('idle'), 4000);
    });
  }

  // ============================================
  // EVENT BINDING
  // ============================================
  function bindEvents() {
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('click', handleClick);
    document.addEventListener('mouseover', handleMouseHover, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Drag to move
    dom.wrapper.addEventListener('mousedown', handleDragStart);
    dom.wrapper.addEventListener('touchstart', handleDragStart, { passive: true });

    dom.speechClose.addEventListener('click', (e) => {
      e.stopPropagation();
      hideSpeech();
    });

    dom.chatBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleChat();
    });

    dom.chatClose.addEventListener('click', toggleChat);

    dom.chatSend.addEventListener('click', handleChatSend);
    dom.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleChatSend();
    });

    dom.chatSuggestions.addEventListener('click', (e) => {
      const btn = e.target.closest('.joubot-suggestion');
      if (btn) {
        dom.chatInput.value = btn.dataset.query;
        handleChatSend();
      }
    });

    // Pause animations when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearTimeout(state.blinkTimer);
        clearTimeout(state.idleTimer);
      } else {
        scheduleBlink();
        resetIdleTimer();
      }
    });

    // Reduced motion
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      state.reducedMotion = e.matches;
    });
  }

  // ============================================
  // INIT
  // ============================================
  function init() {
    cacheDom();
    if (!dom.wrapper) return;

    dom.wrapper.setAttribute('data-state', 'idle');
    bindEvents();
    scheduleBlink();
    resetIdleTimer();
    handleScroll();
    watchContactForm();

    // Set initial position (use saved or default)
    if (!loadPosition()) {
      // Default: bottom-left
      const w = dom.wrapper.offsetWidth || 90;
      const h = dom.wrapper.offsetHeight || 140;
      const left = 40;
      const top = window.innerHeight - h - 40;
      dom.wrapper.style.left = left + 'px';
      dom.wrapper.style.top = top + 'px';
      dom.wrapper.style.bottom = 'auto';
      reposition附属Elements(left, top, w, h);
    }

    // Random tips
    state.tipTimer = setInterval(showRandomTip, CONFIG.tipInterval);

    // Start load sequence after a short delay
    setTimeout(runLoadSequence, 800);
  }

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
