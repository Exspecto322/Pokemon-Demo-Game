const battleBackgroundImage = new Image();
battleBackgroundImage.src = "./assets/pokemonBattle.png";
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: battleBackgroundImage,
});

let charmander;
let squirtle;
let renderedSprites;
let battleAnimationId;
let queue;
let awaitingExit = false;
// Store references to dynamically attached event handlers so we can remove
// them between battles. Without this, each battle would add new listeners and
// a single click would trigger the handler multiple times.
let toggleElementsDisplayHandler;
let toggleElementsKeyHandler;

function initBattle() {
  charmander = new Pokemon(pkm.Charmander);
  squirtle = new Pokemon(pkm.Squirtle);
  renderedSprites = [squirtle, charmander];
  queue = [];

  // Flag to keep track of combatTextDiv visibility
  let combatTextVisible = true;

  const combatTextDiv = document.querySelector("#combatTextDiv");
  combatTextDiv.innerHTML = "WILD ENEMY APPEARED!";
  const attackSelectionDiv = document.querySelector("#attackSelectionDiv");
  const sideTextDiv = document.querySelector("#sideTextDiv");
  //Visibility for databoxes
  document.querySelector("#databoxPlayer").style.display = "flex";
  document.querySelector("#databoxFoe").style.display = "flex";
  //Reset healthbars
  document.querySelector("#healthbarPlayer").style.width = "24.4%";
  document.querySelector("#healthbarFoe").style.width = "24.4%";
  // Update health values // this was commented as it was not necessary will be removed next update
  // charmander.health = charmander.maxHealth;
  // squirtle.health = squirtle.maxHealth;

  // Remove previous event listeners if they exist to prevent stacking
  if (toggleElementsDisplayHandler) {
    combatTextDiv.removeEventListener("click", toggleElementsDisplayHandler);
    combatTextDiv.removeEventListener(
      "touchstart",
      toggleElementsDisplayHandler
    );
  }
  if (toggleElementsKeyHandler) {
    document.removeEventListener("keydown", toggleElementsKeyHandler);
  }

  // Function to toggle elements' display
  toggleElementsDisplayHandler = function toggleElementsDisplay() {
    if (combatTextVisible) {
      combatTextDiv.style.display = "none";
      combatTextVisible = false;

      attackSelectionDiv.style.display = "flex";
      sideTextDiv.style.display = "flex";
    } else {
      combatTextDiv.style.display = "flex";
      combatTextVisible = true;

      attackSelectionDiv.style.display = "none";
      sideTextDiv.style.display = "none";
    }
  };

  // Click event listener
  combatTextDiv.addEventListener("click", toggleElementsDisplayHandler);

  // Touchstart event listener
  combatTextDiv.addEventListener("touchstart", toggleElementsDisplayHandler);

  // Keypress event listener for the 'Z' key when attackSelectionDiv &
  // sideTextDiv are visible this keydown should do nothing.
  toggleElementsKeyHandler = function (event) {
    if (
      !(
        attackSelectionDiv.style.display === "flex" &&
        sideTextDiv.style.display === "flex"
      ) &&
      (event.key === "z" || event.key === "Z")
    ) {
      toggleElementsDisplayHandler();
    }
  };
  document.addEventListener("keydown", toggleElementsKeyHandler);

  // Other elements to change to display: flex after #overlappingDiv animation
  const interfaceBattle = [
    "#databoxFoe img",
    "#databoxPlayer img",
    "#lvFoe",
    "#lvPlayer",
    "#healthbarFoe",
    "#healthbarPlayer",
    "#combatTextDiv",
    ".databox-text-foe",
    ".databox-text-player",
    "#attackSelectionDiv img",
    // '#attackSelectionDiv',  commented as this is controlled by combatTextDiv visibility
    // '#sideTextDiv'
  ];

  // Set a delay of set seconds before changing the display property
  setTimeout(() => {
    interfaceBattle.forEach((element) => {
      const el = document.querySelector(element);
      if (el) {
        el.style.display = "flex";
      }
    });
  }, 100); // seconds delay (in milliseconds)

  // Clear existing buttons
  document.querySelectorAll(".attack-button").forEach((button) => {
    button.remove();
  });

  //Dynamically add attacks
  charmander.attacks.forEach((attack) => {
    const button = document.createElement("button");
    button.innerHTML = attack.name;
    button.classList.add("attack-button");
    button.setAttribute("title", attack.type); // Set the attack type as a tooltip
    document.querySelector("#attackSelectionDiv").append(button);
  });

  // event listeners for our buttons (attack)
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      charmander.attack({
        attack: selectedAttack,
        recipient: squirtle,
        renderedSprites,
      });

      // Enemy attacks
      queue.push(() => {
        const randomAttack =
          squirtle.attacks[Math.floor(Math.random() * squirtle.attacks.length)];

        squirtle.attack({
          attack: randomAttack,
          recipient: charmander,
          renderedSprites,
        });
      });
    });
  });
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle);
  battleBackground.draw();

  renderedSprites.forEach((sprite) => {
    sprite.draw();
  });
}

document.querySelector("#combatTextDiv").addEventListener("click", (e) => {
  if (awaitingExit) {
    // Player clicked to confirm faint and exit battle
    e.currentTarget.style.display = "none";
    gsap.to("#overlappingDiv", {
      opacity: 1,
      onComplete: () => {
        cancelAnimationFrame(battleAnimationId);
        animate();
        // Hide BattleUI Elements
        document
          .querySelectorAll(
            ".battleUI, .databox-text-foe, .databox-text-player"
          )
          .forEach((element) => {
            element.style.display = "none";
          });
        gsap.to("#overlappingDiv", {
          opacity: 0,
        });
        battle.initiated = false;
        awaitingExit = false;
      },
    });
    return;
  }

  if (charmander.health <= 0) {
    // Show faint animation/text and wait for player to click to exit
    charmander.faint();
    queue.length = 0; // Clear any remaining actions in the queue
    awaitingExit = true;
    e.currentTarget.style.display = "flex";
    return; // Stop further actions until player confirms
  } else if (squirtle.health <= 0) {
    // Show faint animation/text and wait for player to click to exit
    squirtle.faint();
    queue.length = 0; // Clear any remaining actions in the queue
    awaitingExit = true;
    e.currentTarget.style.display = "flex";
    return; // Stop further actions until player confirms
  }

  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    e.currentTarget.style.display = "none";
    console.log("Clicked dialogue");
  }
});

document.querySelector("#combatTextDiv").addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (awaitingExit) {
    // Player confirmed faint via touch; perform exit
    e.currentTarget.style.display = "none";

    gsap.to("#overlappingDiv", {
      opacity: 1,
      onComplete: () => {
        cancelAnimationFrame(battleAnimationId);
        animate();

        document
          .querySelectorAll(
            ".battleUI, .databox-text-foe, .databox-text-player"
          )
          .forEach((element) => {
            element.style.display = "none";
          });

        gsap.to("#overlappingDiv", {
          opacity: 0,
        });
        battle.initiated = false;
        awaitingExit = false;
      },
    });

    return;
  }

  if (charmander.health <= 0) {
    // Show faint animation/text and wait for player to confirm via touch
    charmander.faint();
    queue.length = 0;
    awaitingExit = true;
    e.currentTarget.style.display = "flex";

    return;
  } else if (squirtle.health <= 0) {
    // Show faint animation/text and wait for player to confirm via touch
    squirtle.faint();
    queue.length = 0;
    awaitingExit = true;
    e.currentTarget.style.display = "flex";

    return;
  }

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
    if (awaitingExit) {
      // Player pressed 'Z' to confirm faint and exit
      document.querySelector("#combatTextDiv").style.display = "none";

      gsap.to("#overlappingDiv", {
        opacity: 1,
        onComplete: () => {
          cancelAnimationFrame(battleAnimationId);
          animate();

          document
            .querySelectorAll(
              ".battleUI, .databox-text-foe, .databox-text-player"
            )
            .forEach((element) => {
              element.style.display = "none";
            });

          gsap.to("#overlappingDiv", {
            opacity: 0,
          });
          battle.initiated = false;
          awaitingExit = false;
        },
      });

      return;
    }

    if (charmander.health <= 0) {
      // Show faint animation/text and wait for player to confirm via Z key
      charmander.faint();
      queue.length = 0;
      awaitingExit = true;
      document.querySelector("#combatTextDiv").style.display = "flex";

      return;
    } else if (squirtle.health <= 0) {
      // Show faint animation/text and wait for player to confirm via Z key
      squirtle.faint();
      queue.length = 0;
      awaitingExit = true;
      document.querySelector("#combatTextDiv").style.display = "flex";

      return;
    }

    if (queue.length > 0) {
      queue[0]();
      queue.shift();
    } else {
      document.querySelector("#combatTextDiv").style.display = "none";
      console.log("Z key pressed");
    }
  }
});
