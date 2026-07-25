function JoeBotBrain(sprite, speech) {
  this.sprite = sprite;
  this.speech = speech;
  this.maxIdle = 10;
  this.sleepTime = 25;
  this.sleepTimer = null;
  this.idleTimer = null;
  this.isSleeping = false;
  this.lastActivity = Date.now();
  this.behaviourCallbacks = [];
  this.randomActions = ['wave', 'action1', 'action2', 'action3', 'action4'];
}

JoeBotBrain.prototype.onRandomAction = function(callback) {
  this.behaviourCallbacks.push(callback);
};

JoeBotBrain.prototype.startActivityMonitor = function() {
  var self = this;
  this.idleTimer = setInterval(function() {
    if (self.isSleeping) return;
    var elapsed = (Date.now() - self.lastActivity) / 1000;
    if (elapsed >= self.sleepTime) {
      self.goToSleep();
    } else if (elapsed >= self.maxIdle) {
      self.doRandomAction();
    }
  }, 1000);
};

JoeBotBrain.prototype.stopActivityMonitor = function() {
  if (this.idleTimer) { clearInterval(this.idleTimer); this.idleTimer = null; }
};

JoeBotBrain.prototype.goToSleep = function() {
  if (this.isSleeping) return;
  this.isSleeping = true;
  this.sprite.stop();
  this.sprite.play('sleep');
  this.speech.show('zzz', 5000);
  var self = this;
  if (this.sleepTimer) clearTimeout(this.sleepTimer);
  this.sleepTimer = setTimeout(function() {
    if (self.isSleeping) self.wakeUp();
  }, 10000);
};

JoeBotBrain.prototype.wakeUp = function() {
  if (!this.isSleeping) return;
  this.isSleeping = false;
  this.sprite.stop();
  this.sprite.play('idle');
  this.speech.show('oh hi! :)', 3000);
  this.lastActivity = Date.now();
  var self = this;
  if (this.sleepTimer) clearTimeout(this.sleepTimer);
  this.sleepTimer = setTimeout(function() {
    if (!self.isSleeping) self.goToSleep();
  }, this.sleepTime * 1000);
};

JoeBotBrain.prototype.doRandomAction = function() {
  if (this.isSleeping) return;
  var action = this.randomActions[Math.floor(Math.random() * this.randomActions.length)];
  this.sprite.stop();
  this.sprite.play(action);
  for (var i = 0; i < this.behaviourCallbacks.length; i++) {
    this.behaviourCallbacks[i](action);
  }
  this.lastActivity = Date.now();
};

JoeBotBrain.prototype.destroy = function() {
  this.stopActivityMonitor();
  if (this.sleepTimer) clearTimeout(this.sleepTimer);
};
