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
    // Clone the incoming position so we can keep a stable basePosition
    const clonedPosition = { x: position.x, y: position.y };
    super({
      position: clonedPosition,
      image,
      frames,
      sprites,
      animate,
    });
    // Save original base position to always return sprites here after animations
    this.basePosition = { x: clonedPosition.x, y: clonedPosition.y };
    this.health = 125;
    this.isEnemy = isEnemy;
    this.name = name;
    this.attacks = attacks;
    // Guard to prevent overlapping attack animations when player clicks fast
    this.isAnimating = false;
  }

  faint() {
    document.querySelector("#combatTextDiv").innerHTML =
      this.name + " FAINTED! ";

    const tl = gsap.timeline();

    // Ensure we start from the base position (prevents drift)
    if (this.basePosition) {
      gsap.set(this.position, {
        x: this.basePosition.x,
        y: this.basePosition.y,
      });
    }

    // small drop and fade out
    tl.to(this.position, {
      y: this.position.y + 20,
      duration: 0.4,
    });
    tl.to(
      this,
      {
        opacity: 0,
        duration: 0.5,
      },
      ">0"
    );

    // return y to base so when battle restarts or other logic runs, sprite is back
    tl.set(this.position, { x: this.basePosition.x, y: this.basePosition.y });

    console.log(this.name + " FAINTED!");
  }

  attack({ attack, recipient, renderedSprites }) {
    // Prevent overlapping attacks or actions when a Pokémon has fainted
    if (this.isAnimating || this.health <= 0 || recipient.health <= 0) return;
    this.isAnimating = true;

    document.querySelector("#attackSelectionDiv").style.display = "none";
    document.querySelector("#sideTextDiv").style.display = "none";
    document.querySelector("#combatTextDiv").style.display = "flex";
    document.querySelector("#combatTextDiv").innerHTML =
      this.name + " used " + attack.name + "!";

    // Kill any existing tweens affecting positions to avoid stacking offsets
    gsap.killTweensOf(this.position);
    gsap.killTweensOf(recipient.position);

    // Snap both combatants to their base positions before animating
    if (this.basePosition) {
      gsap.set(this.position, {
        x: this.basePosition.x,
        y: this.basePosition.y,
      });
    }
    if (recipient.basePosition) {
      gsap.set(recipient.position, {
        x: recipient.basePosition.x,
        y: recipient.basePosition.y,
      });
    }

    let healthBar = "#healthbarFoe";
    if (this.isEnemy) healthBar = "#healthbarPlayer";

    switch (attack.name) {
      case "Ember": {
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

        // Add ember to rendering array (in front of background)
        renderedSprites.splice(1, 0, ember);

        const isCriticalHit = Math.random() < 0.05;
        const damage = isCriticalHit
          ? Math.round(attack.damage * 2.75)
          : attack.damage;

        if (isCriticalHit) {
          queue.push(() => {
            document.querySelector("#combatTextDiv").innerHTML =
              "CRITICAL HIT!";
            document.querySelector("#combatTextDiv").style.display = "flex";
          });
        }

        gsap.to(ember.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          duration: 1.5,
          ease: "power4.out",
          onComplete: () => {
            recipient.health -= damage;
            recipient.health = Math.max(Math.round(recipient.health), 0);

            const healthbarWidth = (recipient.health / 125) * 24.4;

            gsap.to(healthBar, {
              width: healthbarWidth + "%",
              onComplete: () => {
                if (isCriticalHit) console.log("Critical Hit!");
              },
            });

            // Ensure recipient starts from its base position before hit shake
            if (recipient.basePosition) {
              gsap.set(recipient.position, {
                x: recipient.basePosition.x,
                y: recipient.basePosition.y,
              });
            }

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
              onComplete: () => {
                // restore recipient opacity and position
                if (recipient.basePosition) {
                  gsap.set(recipient.position, {
                    x: recipient.basePosition.x,
                    y: recipient.basePosition.y,
                  });
                }
                recipient.opacity = 1;
                // remove ember from render list
                const index = renderedSprites.indexOf(ember);
                if (index > -1) renderedSprites.splice(index, 1);
                // allow further animations
                this.isAnimating = false;
              },
            });
          },
        });
        break;
      }
      case "Tackle": {
        const tl = gsap.timeline();

        let movementDistance = 20;
        if (this.isEnemy) movementDistance = -20;

        const baseX = this.basePosition ? this.basePosition.x : this.position.x;

        tl.to(this.position, {
          x: baseX - movementDistance,
        })
          .to(this.position, {
            x: baseX + movementDistance * 2,
            duration: 0.1,
            onComplete: () => {
              const isCriticalHit = Math.random() < 0.1;
              const damage = isCriticalHit
                ? Math.round(attack.damage * 2.75)
                : attack.damage;

              if (isCriticalHit) {
                queue.push(() => {
                  document.querySelector("#combatTextDiv").innerHTML =
                    "Critical hit!";
                  document.querySelector("#combatTextDiv").style.display =
                    "flex";
                });
              }

              recipient.health -= damage;
              recipient.health = Math.max(Math.round(recipient.health), 0);

              const healthbarWidth = (recipient.health / 125) * 24.4;
              gsap.to(healthBar, {
                width: healthbarWidth + "%",
                onComplete: () => {
                  if (isCriticalHit) console.log("Critical Hit!");
                },
              });

              if (recipient.basePosition) {
                gsap.set(recipient.position, {
                  x: recipient.basePosition.x,
                  y: recipient.basePosition.y,
                });
              }

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
                onComplete: () => {
                  // restore recipient position & opacity
                  if (recipient.basePosition) {
                    gsap.set(recipient.position, {
                      x: recipient.basePosition.x,
                      y: recipient.basePosition.y,
                    });
                  }
                  recipient.opacity = 1;
                },
              });
            },
          })
          .to(
            this.position,
            {
              x: baseX,
            },
            ">" // ensure it runs after previous steps
          )
          .call(() => {
            // Mark that this attack animation finished so input can continue
            this.isAnimating = false;
          });
        break;
      }
      case "Water Gun": {
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

        const isCriticalHit = Math.random() < 0.05;
        const damage = isCriticalHit
          ? Math.round(attack.damage * 2.75)
          : attack.damage;

        if (isCriticalHit) {
          queue.push(() => {
            document.querySelector("#combatTextDiv").innerHTML =
              "Critical hit!";
            document.querySelector("#combatTextDiv").style.display = "flex";
          });
        }

        gsap.to(waterGun.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          duration: 1.75,
          ease: "power1.out",
          onComplete: () => {
            recipient.health -= damage;
            recipient.health = Math.max(Math.round(recipient.health), 0);

            const healthbarWidth = (recipient.health / 125) * 24.4;

            gsap.to(healthBar, {
              width: healthbarWidth + "%",
              onComplete: () => {
                if (isCriticalHit) console.log("Critical Hit!");
              },
            });

            if (recipient.basePosition) {
              gsap.set(recipient.position, {
                x: recipient.basePosition.x,
                y: recipient.basePosition.y,
              });
            }

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
              onComplete: () => {
                if (recipient.basePosition) {
                  gsap.set(recipient.position, {
                    x: recipient.basePosition.x,
                    y: recipient.basePosition.y,
                  });
                }
                recipient.opacity = 1;
                const index = renderedSprites.indexOf(waterGun);
                if (index > -1) renderedSprites.splice(index, 1);
                this.isAnimating = false;
              },
            });
          },
        });

        break;
      }
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
    c.fillStyle = "rgba(255,0,0,0)";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class Hill extends Boundary {
  constructor({ position }) {
    super({ position });
  }
}
