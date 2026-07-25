function JoeBotSprite(elementId) {
  var cfg = JOEBOT_CONFIG;
  this.element = document.getElementById(elementId);
  if (!this.element) return;

  this.currentAnimation = 'idle';
  this.currentFrame = 0;
  this.animationInterval = null;
  this.isPlaying = false;
  this.position = { x: 0, y: 0 };
  this.isFlipped = false;
  this.onAnimationEnd = null;

  this.element.style.backgroundImage = 'url(joubot/spritesheet.webp)';
  this.element.style.backgroundRepeat = 'no-repeat';
  this.element.style.imageRendering = 'pixelated';
  this.element.style.backgroundSize = (cfg.columns * cfg.frameWidth) + 'px ' + (cfg.rows * cfg.frameHeight) + 'px';
  this.element.style.width = cfg.frameWidth + 'px';
  this.element.style.height = cfg.frameHeight + 'px';
  this.element.style.display = 'block';

  var frame = this.getFrame(0, 0);
  this.element.style.backgroundPosition = '-' + frame.x + 'px -' + frame.y + 'px';
}

JoeBotSprite.prototype.getFrame = function(row, col) {
  return {
    x: col * JOEBOT_CONFIG.frameWidth,
    y: row * JOEBOT_CONFIG.frameHeight
  };
};

JoeBotSprite.prototype.play = function(animationName) {
  if (animationName) {
    this.setAnimation(animationName);
  } else if (this.isPlaying) {
    return;
  }
  this.startAnimation();
};

JoeBotSprite.prototype.setAnimation = function(animationName) {
  var anims = JOEBOT_CONFIG.animations;
  if (anims[animationName]) {
    this.currentAnimation = animationName;
    this.currentFrame = 0;
    this.update();
  }
};

JoeBotSprite.prototype.startAnimation = function() {
  var self = this;
  var anims = JOEBOT_CONFIG.animations;
  if (this.animationInterval) clearInterval(this.animationInterval);
  this.isPlaying = true;
  var anim = anims[this.currentAnimation];
  this.animationInterval = setInterval(function() {
    self.currentFrame++;
    if (self.currentFrame >= anim.frames.length) {
      if (anim.loop) {
        self.currentFrame = 0;
      } else {
        self.currentFrame = anim.frames.length - 1;
        self.stop();
        if (self.onAnimationEnd) self.onAnimationEnd(self.currentAnimation);
        return;
      }
    }
    self.update();
  }, anim.speed);
};

JoeBotSprite.prototype.update = function() {
  var anims = JOEBOT_CONFIG.animations;
  var anim = anims[this.currentAnimation];
  var frameIndex = anim.frames[this.currentFrame];
  var frame = this.getFrame(anim.row, frameIndex);
  this.element.style.backgroundPosition = '-' + frame.x + 'px -' + frame.y + 'px';
};

JoeBotSprite.prototype.stop = function() {
  if (this.animationInterval) {
    clearInterval(this.animationInterval);
    this.animationInterval = null;
  }
  this.isPlaying = false;
};

JoeBotSprite.prototype.pause = function() {
  this.stop();
};

JoeBotSprite.prototype.flip = function() {
  this.isFlipped = !this.isFlipped;
  this.element.style.transform = this.isFlipped ? 'scaleX(-1)' : '';
};
