function JoeBotSpeech(sprite) {
  this.sprite = sprite;
  this.speechElement = document.getElementById('speech');
  this.hideTimeout = null;
}

JoeBotSpeech.prototype.show = function(text, duration) {
  if (!this.speechElement) return;
  this.speechElement.textContent = text;
  this.speechElement.classList.add('visible');
};

JoeBotSpeech.prototype.hide = function() {
  if (!this.speechElement) return;
  this.speechElement.classList.remove('visible');
};

JoeBotSpeech.prototype.updatePosition = function() {}; /* positioned via CSS */
