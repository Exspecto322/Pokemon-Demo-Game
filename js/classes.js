class Sprite {
  constructor({
    position,
    image,
    frames = { max: 1, hold: 24 },
    sprites = [],
    animate = false,
  }) {
    this.position = position;
    this.image = new Image();
    this.frames = { ...frames, val: 0, elapsed: 0 };
    this.image.onload = () => {
      this.width = this.image.width / this.frames.max;
      this.height = this.image.height;
    };
    this.image.src = image.src;

    this.animate = animate;
    this.sprites = sprites;
    this.opacity = 1;
  }
  draw() {
    c.save();
    c.globalAlpha = this.opacity;
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
    c.restore();

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

class Pokemon extends Sprite {
  constructor({
    position,
    image,
    frames = { max: 1, hold: 24 },
    sprites = [],
    animate = false,
    isEnemy = false,
    name,
    attacks,
  }) {
    super({
      position,
      image,
      frames,
      sprites,
      animate,
    });
    this.health = 125;
    this.isEnemy = isEnemy;
    this.name = name;
    this.attacks = attacks;
  }

  faint() {
    document.querySelector("#combatTextDiv").innerHTML =
      this.name + " FAINTED! ";
    gsap.to(this.position, {
      y: this.position.y + 20,
    });
    gsap.to(this, {
      opacity: 0,
    });
    console.log(this.name + " FAINTED!");
  }

  attack({ attack, recipient, renderedSprites }) {
    document.querySelector("#attackSelectionDiv").style.display = "none";
    document.querySelector("#sideTextDiv").style.display = "none";
    document.querySelector("#combatTextDiv").style.display = "flex";
    document.querySelector("#combatTextDiv").innerHTML =
      this.name + " used " + attack.name + "!";

    let healthBar = "#healthbarFoe";
    if (this.isEnemy) healthBar = "#healthbarPlayer";

    switch (attack.name) {
      case "Ember":
        const emberImage = new Image();
        emberImage.src = "./assets/ember.png";
        const ember = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y,
          },
          image: emberImage,
          frames: {
            max: 15,
            hold: 15,
          },
          animate: true,
        });

        renderedSprites.splice(1, 0, ember);

        gsap.to(ember.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          duration: 1.5,
          ease: "power4.out",
          onComplete: () => {
            //Enemy gets hit
            // Check for a critical hit with a 5% probability
            const isCriticalHit = Math.random() < 0.05;

            // Calculate the damage based on whether it's a critical hit or not
            const damage = isCriticalHit ? attack.damage * 2.75 : attack.damage;

            // Calculate the new health
            recipient.health -= damage;

            // Ensure the health doesn't go below 0
            recipient.health = Math.max(recipient.health, 0);

            // Calculate the new health bar width based on the updated health percentage
            const healthbarWidth = (recipient.health / 125) * 24.4; // 24.4% max width

            // Animate the health bar width change
            gsap.to(healthBar, {
              width: healthbarWidth + "%",
              onComplete: () => {
                // Output it's a critical hit
                if (isCriticalHit) {
                  console.log("Critical Hit!");
                }
              },
            });

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });
            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08,
            });
            renderedSprites.splice(1, 1);
          },
        });

        break;
      case "Tackle":
        const tl = gsap.timeline();

        let movementDistance = 20;
        if (this.isEnemy) movementDistance = -20;

        tl.to(this.position, {
          x: this.position.x - movementDistance,
        })
          .to(this.position, {
            x: this.position.x + movementDistance * 2,
            duration: 0.1,
            onComplete: () => {
              //Enemy gets hit
              // Check for a critical hit with a 10% probability
              const isCriticalHit = Math.random() < 0.1;

              // Calculate the damage based on whether it's a critical hit or not
              const damage = isCriticalHit
                ? attack.damage * 2.75
                : attack.damage;

              // Calculate the new health
              recipient.health -= damage;

              // Ensure the health doesn't go below 0
              recipient.health = Math.max(recipient.health, 0);

              // Calculate the new health bar width based on the updated health percentage
              const healthbarWidth = (recipient.health / 125) * 24.4; // 24.4% max width

              // Animate the health bar width change
              gsap.to(healthBar, {
                width: healthbarWidth + "%",
                onComplete: () => {
                  // Output it's a critical hit
                  if (isCriticalHit) {
                    console.log("Critical Hit!");
                  }
                },
              });

              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08,
              });
              gsap.to(recipient, {
                opacity: 0,
                repeat: 5,
                yoyo: true,
                duration: 0.08,
              });
            },
          })
          .to(this.position, {
            x: this.position.x,
          });
        break;

      case "Water Gun":
        const waterGunImage = new Image();
        waterGunImage.src = "./assets/watergun.png";
        const waterGun = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y,
          },
          image: waterGunImage,
          frames: {
            max: 5,
            hold: 50,
          },
          animate: true,
        });

        renderedSprites.splice(1, 0, waterGun);

        gsap.to(waterGun.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          duration: 1.75,
          ease: "power1.out",
          onComplete: () => {
            //Enemy gets hit
            // Check for a critical hit with a 5% probability
            const isCriticalHit = Math.random() < 0.05;

            // Calculate the damage based on whether it's a critical hit or not
            const damage = isCriticalHit ? attack.damage * 2.75 : attack.damage;

            // Calculate the new health
            recipient.health -= damage;

            // Ensure the health doesn't go below 0
            recipient.health = Math.max(recipient.health, 0);

            // Calculate the new health bar width based on the updated health percentage
            const healthbarWidth = (recipient.health / 125) * 24.4; // 24.4% max width

            // Animate the health bar width change
            gsap.to(healthBar, {
              width: healthbarWidth + "%",
              onComplete: () => {
                // Output it's a critical hit
                if (isCriticalHit) {
                  console.log("Critical Hit!");
                }
              },
            });

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });
            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08,
            });
            renderedSprites.splice(1, 1);
          },
        });

        break;
    }
    console.log(this.name + "'s remaining health: " + this.health);
    console.log(recipient.name + "'s remaining health: " + recipient.health);
  }
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
