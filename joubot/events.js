function JoeBotEvents(sprite, speech) {
  this.sprite = sprite;
  this.speech = speech;
  this.isDragging = false;
  this.dragOffset = { x: 0, y: 0 };
  this.dragThreshold = 5;
  this.startPos = { x: 0, y: 0 };
  this.hasMoved = false;
  this.clickCount = 0;
  this.clickTimer = null;
  this.onSingleClick = null;
  this.onDoubleClick = null;
  this.onDragStart = null;
  this.onDragMove = null;
  this.onDragEnd = null;
  this.onRightClick = null;
}

JoeBotEvents.prototype.init = function(spriteContainer) {
  var self = this;
  this.spriteContainer = spriteContainer;

  spriteContainer.addEventListener('mousedown', function(e) { self.handleMouseDown(e); });
  document.addEventListener('mousemove', function(e) { self.handleMouseMove(e); });
  document.addEventListener('mouseup', function(e) { self.handleMouseUp(e); });

  spriteContainer.addEventListener('touchstart', function(e) { self.handleTouchStart(e); }, { passive: false });
  document.addEventListener('touchmove', function(e) { self.handleTouchMove(e); }, { passive: false });
  document.addEventListener('touchend', function(e) { self.handleTouchEnd(e); });

  spriteContainer.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    if (self.onRightClick) self.onRightClick(e);
  });
};

JoeBotEvents.prototype.handleMouseDown = function(e) {
  e.preventDefault();
  this.startPos = { x: e.clientX, y: e.clientY };
  this.dragOffset = {
    x: e.clientX - this.spriteContainer.offsetLeft,
    y: e.clientY - this.spriteContainer.offsetTop
  };
  this.isDragging = false;
  this.hasMoved = false;
};

JoeBotEvents.prototype.handleMouseMove = function(e) {
  if (this.startPos.x === 0 && this.startPos.y === 0) return;
  var dx = e.clientX - this.startPos.x;
  var dy = e.clientY - this.startPos.y;
  if (Math.sqrt(dx * dx + dy * dy) > this.dragThreshold) {
    if (!this.isDragging) {
      this.isDragging = true;
      this.spriteContainer.classList.add('dragging');
      if (this.onDragStart) this.onDragStart();
    }
    this.hasMoved = true;
    if (dx < 0) {
      this.sprite.element.style.transform = 'scaleX(-1)';
    } else if (dx > 0) {
      this.sprite.element.style.transform = '';
    }
    this.spriteContainer.style.left = (e.clientX - this.dragOffset.x) + 'px';
    this.spriteContainer.style.top = (e.clientY - this.dragOffset.y) + 'px';
    this.spriteContainer.style.bottom = 'auto';
    if (this.onDragMove) this.onDragMove();
  }
};

JoeBotEvents.prototype.handleMouseUp = function(e) {
  if (this.startPos.x === 0 && this.startPos.y === 0) return;
  if (this.isDragging) {
    this.isDragging = false;
    this.spriteContainer.classList.remove('dragging');
    this.sprite.element.style.transform = '';
    if (this.onDragEnd) this.onDragEnd();
  } else if (!this.hasMoved) {
    this.handleClick(e);
  }
  this.startPos = { x: 0, y: 0 };
  this.hasMoved = false;
};

JoeBotEvents.prototype.handleTouchStart = function(e) {
  if (e.touches.length > 1) return;
  e.preventDefault();
  var touch = e.touches[0];
  this.startPos = { x: touch.clientX, y: touch.clientY };
  this.dragOffset = {
    x: touch.clientX - this.spriteContainer.offsetLeft,
    y: touch.clientY - this.spriteContainer.offsetTop
  };
  this.isDragging = false;
  this.hasMoved = false;
};

JoeBotEvents.prototype.handleTouchMove = function(e) {
  if (this.startPos.x === 0) return;
  var touch = e.touches[0];
  var dx = touch.clientX - this.startPos.x;
  var dy = touch.clientY - this.startPos.y;
  if (Math.sqrt(dx * dx + dy * dy) > this.dragThreshold) {
    if (!this.isDragging) {
      this.isDragging = true;
      this.spriteContainer.classList.add('dragging');
      if (this.onDragStart) this.onDragStart();
    }
    this.hasMoved = true;
    if (dx < 0) {
      this.sprite.element.style.transform = 'scaleX(-1)';
    } else if (dx > 0) {
      this.sprite.element.style.transform = '';
    }
    e.preventDefault();
    this.spriteContainer.style.left = (touch.clientX - this.dragOffset.x) + 'px';
    this.spriteContainer.style.top = (touch.clientY - this.dragOffset.y) + 'px';
    this.spriteContainer.style.bottom = 'auto';
  }
};

JoeBotEvents.prototype.handleTouchEnd = function(e) {
  if (this.startPos.x === 0) return;
  if (this.isDragging) {
    this.isDragging = false;
    this.spriteContainer.classList.remove('dragging');
    this.sprite.element.style.transform = '';
    if (this.onDragEnd) this.onDragEnd();
  } else if (!this.hasMoved) {
    this.handleClick(e);
  }
  this.startPos = { x: 0, y: 0 };
  this.hasMoved = false;
};

JoeBotEvents.prototype.handleClick = function(e) {
  var self = this;
  this.clickCount++;
  if (this.clickTimer) clearTimeout(this.clickTimer);
  this.clickTimer = setTimeout(function() {
    if (self.clickCount === 1) {
      if (self.onSingleClick) self.onSingleClick(e);
    } else if (self.clickCount >= 2) {
      if (self.onDoubleClick) self.onDoubleClick(e);
    }
    self.clickCount = 0;
  }, 250);
};
