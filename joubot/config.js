/* Animation configuration - mapped from the spritesheet */
var JOEBOT_CONFIG = {
  animations: {
    idle: {
      row: 0,
      frames: [0, 1, 2, 3, 2, 1],
      speed: 150,
      loop: true
    },
    walk: {
      row: 1,
      frames: [0, 1, 2, 3, 4, 5, 6, 7],
      speed: 100,
      loop: true
    },
    action1: {
      row: 2,
      frames: [0, 1, 2, 3, 4, 5, 6, 7],
      speed: 120,
      loop: false
    },
    wave: {
      row: 3,
      frames: [0, 1, 2, 3],
      speed: 180,
      loop: false

    },
    action2: {
      row: 4,
      frames: [0, 1, 2, 3, 4, 5, 6, 7],
      speed: 120,
      loop: false

    },
    sleep: {
      row: 5,
      frames: [0, 1, 2, 3, 4, 5, 6, 7],
      speed: 180,
      loop: true

    },
    action3: {
      row: 6,
      frames: [0, 1, 2, 3, 4, 5, 6, 7],
      speed: 120,
      loop: false

    },
    action4: {
      row: 7,
      frames: [0, 1, 2, 3, 4, 5],
      speed: 120,
      loop: true

    },
    thinking: {
      row: 8,
      frames: [0, 1, 2, 3, 4, 5],
      speed: 180,
      loop: true

    }
  },
  frameWidth: 192,
  frameHeight: 208,
  columns: 8,
  rows: 9,
  scale: 0.55,
};
