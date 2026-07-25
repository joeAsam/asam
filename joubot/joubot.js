(function() {
  var GREETINGS = [
    "hi there! i'm JoeBot :)",
    "welcome to Joseph's portfolio!",
    "feel free to explore around"
  ];

  var SECTION_LINES = {
    about: ["this is Joseph!", "a creative developer from Nigeria"],
    skills: ["check out what Joseph can do!"],
    projects: ["some cool projects here!"],
    contact: ["want to get in touch?"]
  }; 

  var CLICK_REACTIONS = [
    "hey! that tickles :P",
    "ooh what was that for?",
    "hehe, again again!",
    "you found me!",
    "i see you :)",
    "*giggles*",
    "that's my spot!",
    "beep boop!",
    "i'm just a bot, chill :D"
  ];

  var DRAG_REACTIONS = [
    "wheee!",
    "put me down!",
    "i'm getting dizzy!",
    "whoa this is fun!",
    "ok that's enough!",
    "i trusted you!",
    "NOT THE FACE!",
    "this wasn't in my contract!"
  ];

  var DOUBLE_CLICK_REACTIONS = [
    "that really tickles!",
    "ok ok I yield!",
    "you're persistent huh?",
    "alright alright, no more!",
    "my circuits! :P"
  ];

  var TIPS = [
    "try dragging me around!",
    "double click me for a surprise!",
    "scroll down to see more of Joseph's work",
    "right click me for a special action"
  ];

  var sprite, speech, brain, events;
  var chatVisible = false;

  function init() {
    sprite = new JoeBotSprite('pet');
    speech = new JoeBotSpeech(sprite);
    brain = new JoeBotBrain(sprite, speech);
    events = new JoeBotEvents(sprite, speech);

    var container = document.getElementById('joubot');
    events.init(container);
    brain.startActivityMonitor();

    setupEventHandlers();
    setupScrollDialogue();
    setupChatPanel();

    setTimeout(function() {
      speech.show(GREETINGS[0], 3000);
      sprite.play('wave');
      sprite.onAnimationEnd = function() { sprite.play('idle'); };
    }, 2500);

    setInterval(function() {
      if (!brain.isSleeping && !events.isDragging) {
        var tip = TIPS[Math.floor(Math.random() * TIPS.length)];
        speech.show(tip, 5000);
      }
    }, 30000);

    brain.onRandomAction(function(action) {
      if (action !== 'wave' && action !== 'sleep') {
        var line = SECTION_LINES.skills[Math.floor(Math.random() * SECTION_LINES.skills.length)];
        speech.show(line, 4000);
      }
    });
  }

  function setupEventHandlers() {
    events.onSingleClick = function() {
      if (brain.isSleeping) { brain.wakeUp(); return; }
      brain.lastActivity = Date.now();
      // speech.show(CLICK_REACTIONS[Math.floor(Math.random() * CLICK_REACTIONS.length)], 3000);
      sprite.stop();
      sprite.play('wave');
      sprite.onAnimationEnd = function() { sprite.play('idle'); };
    };

    events.onDoubleClick = function() {
      brain.lastActivity = Date.now();
      speech.show(DOUBLE_CLICK_REACTIONS[Math.floor(Math.random() * DOUBLE_CLICK_REACTIONS.length)], 3000);
      sprite.stop();
      sprite.play('action1');
      sprite.onAnimationEnd = function() { sprite.play('idle'); };
    };

    events.onDragStart = function() {
      if (brain.isSleeping) brain.wakeUp();
      brain.lastActivity = Date.now();
      sprite.stop();
      sprite.play('walk');
      // speech.show(DRAG_REACTIONS[Math.floor(Math.random() * DRAG_REACTIONS.length)], 3000);
    };

    events.onDragMove = function() {
      brain.lastActivity = Date.now();
    };

    events.onDragEnd = function() {
      brain.lastActivity = Date.now();
      sprite.stop();
      sprite.play('idle');
      var container = document.getElementById('joubot');
      localStorage.setItem('joubot-position', JSON.stringify({
        x: container.offsetLeft,
        y: container.offsetTop
      }));
    };

    // events.onRightClick = function() {
    //   brain.lastActivity = Date.now();
    //   sprite.flip();
    //   speech.show("look, i can go backwards!", 3000);
    // };
  }

  function setupScrollDialogue() {
    var sections = document.querySelectorAll('section[id]');
    var spoken = {};

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !spoken[entry.target.id]) {
          spoken[entry.target.id] = true;
          var lines = SECTION_LINES[entry.target.id];
          if (lines) {
            var line = lines[Math.floor(Math.random() * lines.length)];
            speech.show(line, 4000);
            brain.lastActivity = Date.now();
            if (entry.target.id !== 'about') {
              sprite.stop();
              sprite.play('thinking');
              sprite.onAnimationEnd = function() { sprite.play('idle'); };
            }
          }
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(function(section) { observer.observe(section); });
  }

  function setupChatPanel() {
    var toggle = document.getElementById('chat-toggle');
    var panel = document.getElementById('chat-panel');
    var input = document.getElementById('chat-input');
    var sendBtn = document.getElementById('chat-send');
    var messages = document.getElementById('chat-messages');

    if (!toggle || !panel) return;

    toggle.addEventListener('click', function() {
      chatVisible = !chatVisible;
      panel.classList.toggle('open', chatVisible);
      if (chatVisible) {
        sprite.stop();
        sprite.play('wave');
        speech.show("let's chat!", 2000);
        sprite.onAnimationEnd = function() { sprite.play('idle'); };
        if (input) input.focus();
      }
    });

    if (sendBtn && input) {
      sendBtn.addEventListener('click', function() { sendChatMessage(); });
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendChatMessage();
      });
    }
  }

  function sendChatMessage() {
    var input = document.getElementById('chat-input');
    var messages = document.getElementById('chat-messages');
    var text = input.value.trim();
    if (!text) return;

    var userDiv = document.createElement('div');
    userDiv.className = 'chat-message user';
    userDiv.textContent = text;
    messages.appendChild(userDiv);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    brain.lastActivity = Date.now();
    sprite.stop();
    sprite.play('thinking');

    setTimeout(function() {
      var response = getPreWrittenResponse(text);
      var botDiv = document.createElement('div');
      botDiv.className = 'chat-message bot';
      botDiv.textContent = response;
      messages.appendChild(botDiv);
      messages.scrollTop = messages.scrollHeight;
      speech.show(response, 4000);
      sprite.stop();
      sprite.play('idle');
    }, 800 + Math.random() * 1000);
  }

  function getPreWrittenResponse(input) {
    var lower = input.toLowerCase();
    if (lower.match(/hello|hi |hey/)) return "hey there! how's it going?";
    if (lower.match(/who|name/)) return "i'm JoeBot, Joseph's digital assistant!";
    if (lower.match(/what do you do|purpose/)) return "i'm here to make Joseph's portfolio more fun!";
    if (lower.match(/contact|email|reach/)) return "you can reach Joseph through the contact form below!";
    if (lower.match(/project|work/)) return "check out the projects section - some cool stuff there!";
    if (lower.match(/skill|tech/)) return "Joseph knows a lot of cool tech - scroll to skills to see!";
    if (lower.match(/help/)) return "try dragging me, double-clicking, or just chat with me!";
    if (lower.match(/bye|goodbye/)) return "see you around! come back soon!";
    if (lower.match(/cool|awesome|nice/)) return "thanks! Joseph worked really hard on this!";
    if (lower.match(/joke/)) return "why do programmers prefer dark mode? because light attracts bugs!";
    if (lower.match(/thank/)) return "you're welcome! happy to help :)";
    var responses = [
      "that's interesting! tell me more",
      "hmm, let me think about that...",
      "cool! what else?",
      "i'm just a bot, but i appreciate the conversation!",
      "Joseph would know more about that!",
      "have you checked out the projects section?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  function loadSavedPosition() {
    var saved = localStorage.getItem('joubot-position');
    if (saved) {
      var pos = JSON.parse(saved);
      var container = document.getElementById('joubot');
      if (container) {
        container.style.left = pos.x + 'px';
        container.style.top = pos.y + 'px';
        container.style.bottom = 'auto';
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    loadSavedPosition();
    init();
  });
})();
