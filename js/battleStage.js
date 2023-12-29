const battleBackgroundImage = new Image();
battleBackgroundImage.src = "./assets/pokemonBattle.png";
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: battleBackgroundImage,
});

const charmander = new Pokemon(pkm.Charmander);
const squirtle = new Pokemon(pkm.Squirtle);
console.log(charmander);

const renderedSprites = [squirtle, charmander];

charmander.attacks.forEach((attack) => {
  const button = document.createElement("button");
  button.innerHTML = attack.name;
  button.classList.add("attack-button");
  document.querySelector("#attackSelectionDiv").append(button);
});

function animateBattle() {
  window.requestAnimationFrame(animateBattle);
  battleBackground.draw();

  renderedSprites.forEach((sprite) => {
    sprite.draw();
  });
}

animate();
// animateBattle()

const queue = [];

// event listeners for our buttons (attack)
document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", (e) => {
    const selectedAttack = attacks[e.currentTarget.innerHTML];
    charmander.attack({
      attack: selectedAttack,
      recipient: squirtle,
      renderedSprites,
    });

    const randomAttack =
      squirtle.attacks[Math.floor(Math.random() * squirtle.attacks.length)];

    queue.push(() => {
      squirtle.attack({
        attack: randomAttack,
        recipient: charmander,
        renderedSprites,
      });
    });
  });
});

document.querySelector("#combatTextDiv").addEventListener("click", (e) => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    e.currentTarget.style.display = "none";

    console.log("Clicked dialogue");
  }
});

document.querySelector("#combatTextDiv").addEventListener("touchstart", (e) => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    e.currentTarget.style.display = "none";

    console.log("Touched dialogue");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "z" || e.key === "Z") {
    if (queue.length > 0) {
      queue[0]();
      queue.shift();
    } else {
      document.querySelector("#combatTextDiv").style.display = "none";
      console.log("Z key pressed");
    }
  }
});
