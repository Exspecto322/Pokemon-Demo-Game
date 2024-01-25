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

function initBattle() {
  charmander = new Pokemon(pkm.Charmander);
  squirtle = new Pokemon(pkm.Squirtle);
  renderedSprites = [squirtle, charmander];
  queue = [];

  // Flag to keep track of combatTextDiv visibility
  let combatTextVisible = true;

  const combatTextDiv = document.querySelector("#combatTextDiv");
  const attackSelectionDiv = document.querySelector("#attackSelectionDiv");
  const sideTextDiv = document.querySelector("#sideTextDiv");

  // Function to toggle elements' display
  function toggleElementsDisplay() {
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
  }

  // Click event listener
  combatTextDiv.addEventListener("click", toggleElementsDisplay);

  // Touchstart event listener
  combatTextDiv.addEventListener("touchstart", toggleElementsDisplay);

  // Keypress event listener for the 'Z' key when attackSelectionDiv & sideTextDiv this keydown should do nothing.
  document.addEventListener("keydown", function (event) {
    if (
      !(
        attackSelectionDiv.style.display === "flex" &&
        sideTextDiv.style.display === "flex"
      ) &&
      (event.key === "z" || event.key === "Z")
    ) {
      toggleElementsDisplay();
    }
  });

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
  if (charmander.health <= 0) {
    charmander.faint();
    queue.length = 0; // Clear any remaining actions in the queue
    e.currentTarget.style.display = "none";
    //fade back to black
    gsap.to("#overlappingDiv", {
      opacity: 1,
      onComplete: () => {
        cancelAnimationFrame(battleAnimationId);
        animate();
        battle.initiated = false;
        //Hide BattleUI Elements
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
      },
    });
    return; // Stop further actions
  } else if (squirtle.health <= 0) {
    squirtle.faint();
    queue.length = 0; // Clear any remaining actions in the queue
    e.currentTarget.style.display = "none";
    //fade back to black
    gsap.to("#overlappingDiv", {
      opacity: 1,
      onComplete: () => {
        cancelAnimationFrame(battleAnimationId);
        animate();
        battle.initiated = false;
        //Hide BattleUI Elements
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
      },
    });
    return; // Stop further actions
  }

  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    e.currentTarget.style.display = "none";
    console.log("Clicked dialogue");
  }
});

// animate();
// animateBattle();

// document.querySelector("#combatTextDiv").addEventListener("touchstart", (e) => {
//   if (charmander.health <= 0) {
//     charmander.faint();
//     queue.length = 0;
//     e.currentTarget.style.display = "none";

//     // Fade back to black with GSAP animation
//     gsap.to("#overlappingDiv", {
//       opacity: 1,
//       onComplete: () => {
//         // Additional actions after fading back to black for Charmander
//         cancelAnimationFrame(battleAnimationId);
//         animate();
//         battle.initiated = false;

//         // Hide BattleUI Elements
//         document
//           .querySelectorAll(
//             ".battleUI, .databox-text-foe, .databox-text-player"
//           )
//           .forEach((element) => {
//             element.style.display = "none";
//           });

//         // Fade out the black overlay
//         gsap.to("#overlappingDiv", {
//           opacity: 0,
//         });
//       },
//     });

//     return;
//   } else if (squirtle.health <= 0) {
//     squirtle.faint();
//     queue.length = 0;
//     e.currentTarget.style.display = "none";

//     // Fade back to black with GSAP animation
//     gsap.to("#overlappingDiv", {
//       opacity: 1,
//       onComplete: () => {
//         // Additional actions after fading back to black for Squirtle
//         cancelAnimationFrame(battleAnimationId);
//         animate();
//         battle.initiated = false;

//         // Hide BattleUI Elements
//         document
//           .querySelectorAll(
//             ".battleUI, .databox-text-foe, .databox-text-player"
//           )
//           .forEach((element) => {
//             element.style.display = "none";
//           });

//         // Fade out the black overlay
//         gsap.to("#overlappingDiv", {
//           opacity: 0,
//         });
//       },
//     });

//     return;
//   }

//   if (queue.length > 0) {
//     queue[0]();
//     queue.shift();
//   } else {
//     e.currentTarget.style.display = "none";
//     console.log("Touched dialogue");
//   }
// });

// document.addEventListener("keydown", (e) => {
//   if (e.key === "z" || e.key === "Z") {
//     if (charmander.health <= 0) {
//       charmander.faint();
//       queue.length = 0;
//       document.querySelector("#combatTextDiv").style.display = "none";

//       // Fade back to black with GSAP animation
//       gsap.to("#overlappingDiv", {
//         opacity: 1,
//         onComplete: () => {
//           // Additional actions after fading back to black for Charmander
//           cancelAnimationFrame(battleAnimationId);
//           animate();
//           battle.initiated = false;

//           // Hide BattleUI Elements
//           document
//             .querySelectorAll(
//               ".battleUI, .databox-text-foe, .databox-text-player"
//             )
//             .forEach((element) => {
//               element.style.display = "none";
//             });

//           // Fade out the black overlay
//           gsap.to("#overlappingDiv", {
//             opacity: 0,
//           });
//         },
//       });

//       return;
//     } else if (squirtle.health <= 0) {
//       squirtle.faint();
//       queue.length = 0;
//       document.querySelector("#combatTextDiv").style.display = "none";

//       // Fade back to black with GSAP animation
//       gsap.to("#overlappingDiv", {
//         opacity: 1,
//         onComplete: () => {
//           // Additional actions after fading back to black for Squirtle
//           cancelAnimationFrame(battleAnimationId);
//           animate();
//           battle.initiated = false;

//           // Hide BattleUI Elements
//           document
//             .querySelectorAll(
//               ".battleUI, .databox-text-foe, .databox-text-player"
//             )
//             .forEach((element) => {
//               element.style.display = "none";
//             });

//           // Fade out the black overlay
//           gsap.to("#overlappingDiv", {
//             opacity: 0,
//           });
//         },
//       });

//       return;
//     }

//     if (queue.length > 0) {
//       queue[0]();
//       queue.shift();
//     } else {
//       document.querySelector("#combatTextDiv").style.display = "none";
//       console.log("Z key pressed");
//     }
//   }
// });
