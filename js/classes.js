class Sprite {
  constructor({
    position,
    image,
    frames = { max: 1, hold: 24 },
    sprites = [],
    animate = false,
  }) {
    this.position = position;
    this.image = image;
    this.frames = { ...frames, val: 0, elapsed: 0 };

    this.image.onload = () => {
      this.width = this.image.width / this.frames.max;
      this.height = this.image.height;
    };
    this.animate = animate;
    this.sprites = sprites;
  }
  draw() {
    c.drawImage(
      this.image,
      this.frames.val * this.width + 0.3, // added +0.3 offset as sprite image was showing artifacts, seemed to solve it.
      0,
      this.image.width / this.frames.max - 1, // -1 added as sprite seems to have artifact with the cropping
      this.image.height,
      this.position.x,
      this.position.y,
      this.image.width / this.frames.max + 1, //compensating for artifact
      this.image.height
    );
    if (!this.animate) return;

    if (this.frames.max > 1) {
      this.frames.elapsed++;
    }
    if (this.frames.elapsed % this.frames.hold === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++;
      else this.frames.val = 0; //player animation logic
    }
  } //Class to create map movement
}

class Boundary {
  static width = 88;
  static height = 88;
  constructor({ position }) {
    this.position = position;
    this.width = 84;
    this.height = 60; //changed the 88 in height to produce a perspective for the top part of the player
  }

  draw() {
    c.fillStyle = "rgba(255,0,0,0.0)";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}
