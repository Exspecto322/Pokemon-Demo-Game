const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1276;
canvas.height = 840;

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 36) {
  collisionsMap.push(collisions.slice(i, 36 + i)); // adds collision to rows with the info from the json Map
}

const hillsMap = [];
for (let i = 0; i < hills.length; i += 36) {
  hillsMap.push(hills.slice(i, 36 + i)); // adds hills to rows with the info from the json Map
}

const hillsList = [];

const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 36) {
  battleZonesMap.push(battleZonesData.slice(i, 36 + i)); // adds battle zones to rows with the info from the json Map
}
// console.log(battleZonesMap)

const boundaries = [];
const offset = {
  x: -579,
  y: -2660,
};

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 4817)
      //collision value from array
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y, // collisions with size, 88 is the 32x32 pixels that the map and assets, as they are made at 275% zoom
          },
        })
      );
  });
});

hillsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 4817) {
      // hill collision value from array
      hillsList.push(
        new Hill({
          position: {
            x: j * Hill.width + offset.x,
            y: i * Hill.height + offset.y, // hills with size, 88 is the 32x32 pixels that the map and assets, as they are made at 275% zoom
          },
        })
      );
    }
  });
});

const battleZones = [];

battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 4817)
      //collision value from array
      battleZones.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y, // collisions with size, 88 is the 32x32 pixels that the map and assets, as they are made at 275% zoom
          },
        })
      );
  });
});

// console.log(battleZones)

const image = new Image();
image.src = "./assets/pokemonStyleGameMap.png";

const foregroundImage = new Image();
foregroundImage.src = "./assets/foreground.png";

const playerDownImage = new Image();
playerDownImage.src = "./assets/boywalkdown.png";

const playerUpImage = new Image();
playerUpImage.src = "./assets/boywalkup.png";

const playerLeftImage = new Image();
playerLeftImage.src = "./assets/boywalkleft.png";

const playerRightImage = new Image();
playerRightImage.src = "./assets/boywalkright.png";

window.addEventListener(
  "keydown",
  function (e) {
    if (
      ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
        e.code
      ) > -1
    ) {
      e.preventDefault();
    }
  },
  false
); //Disable scrolling with arrow keys

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 352 / 2.45 / 2,
    y: canvas.height / 2 - 120 / 4.5, //arbitrary size mod as assets are not perfect
  },
  image: playerDownImage,
  frames: {
    max: 4,
    hold: 24,
  },
  sprites: {
    up: playerUpImage,
    down: playerDownImage,
    left: playerLeftImage,
    right: playerRightImage,
  },
});
player.isJumping = false;
console.log(player);

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: image,
}); //Added background to set illusion of movement

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: foregroundImage,
}); //Added image to set illusion of foreground

const keys = {
  ArrowUp: {
    pressed: false,
  },
  ArrowDown: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
};

const movables = [
  background,
  ...boundaries,
  ...hillsList,
  foreground,
  ...battleZones,
];

function playerJump() {
  const jumpDistance = Hill.height;
  player.isJumping = true;
  player.animate = true;
  const positions = movables.map((movable) => movable.position);
  gsap.to(positions, {
    y: `-=${jumpDistance}`,
    duration: 0.3,
    onComplete: () => {
      player.isJumping = false;
    },
  });
}

// Check collision against hills in a given direction.
// Hills behave like boundaries on the sides and when walking up them,
// but walking down onto a hill triggers a jump animation instead of a hard stop.
function checkHillCollision(direction) {
  const offsets = {
    up: { x: 0, y: 3 },
    down: { x: 0, y: -3 },
    left: { x: 3, y: 0 },
    right: { x: -3, y: 0 },
  };
  const offset = offsets[direction];

  for (let i = 0; i < hillsList.length; i++) {
    const hill = hillsList[i];
    if (
      rectangularCollision({
        rectangle1: player,
        rectangle2: {
          ...hill,
          position: {
            x: hill.position.x + offset.x,
            y: hill.position.y + offset.y,
          },
        },
      })
    ) {
      if (direction === "down") playerJump();
      return true;
    }
  }
  return false;
}

function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y
  );
}
const battle = {
  initiated: false,
};

function animate() {
  const animationId = window.requestAnimationFrame(animate);
  // console.log(animationId)
  background.draw();
  boundaries.forEach((boundary) => {
    boundary.draw();
  });
  hillsList.forEach((hill) => {
    hill.draw();
  });
  battleZones.forEach((battleZone) => {
    battleZone.draw();
  });
  player.draw();
  foreground.draw();

  let moving = true;
  player.animate = false;

  // console.log(animationId)
  if (battle.initiated || player.isJumping) return;
  //battle activation
  if (
    keys.ArrowUp.pressed ||
    keys.ArrowDown.pressed ||
    keys.ArrowLeft.pressed ||
    keys.ArrowRight.pressed
  ) {
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i];
      const overlapThreshold = 0.25; // threshold
      const overlappingArea = // geometry of the area overlapping
        (Math.min(
          player.position.x + player.width,
          battleZone.position.x + battleZone.width
        ) -
          Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(
          player.position.y + player.height,
          battleZone.position.y + battleZone.height
        ) -
          Math.max(player.position.y, battleZone.position.y));
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: battleZone,
        }) &&
        overlappingArea > player.width * player.height * overlapThreshold &&
        Math.random() < 0.01
      ) {
        console.log("Battle Collision");

        //deactivate animation loop
        window.cancelAnimationFrame(animationId);

        battle.initiated = true;
        gsap.to("#overlappingDiv", {
          opacity: 1,
          repeat: 3,
          yoyo: true,
          duration: 0.4,
          onComplete() {
            gsap.to("#overlappingDiv", {
              opacity: 1,
              duration: 0.4,
              onComplete() {
                //new animation loop
                initBattle();
                animateBattle();
                gsap.to("#overlappingDiv", {
                  opacity: 0,
                  duration: 0.4,
                });
              },
            });
          },
        });
        break;
      }
    }
  }

  if (keys.ArrowUp.pressed && lastKey === "ArrowUp") {
    player.animate = true;
    player.image = player.sprites.up;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + 3,
            },
          },
        })
      ) {
        console.log("colliding");
        moving = false;
        break;
      }
    }
    if (checkHillCollision("up")) moving = false;

    if (moving)
      movables.forEach((movable) => {
        movable.position.y += 3;
      });
  } else if (keys.ArrowDown.pressed && lastKey === "ArrowDown") {
    player.animate = true;
    player.image = player.sprites.down;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - 3,
            },
          },
        })
      ) {
        console.log("colliding");
        moving = false;
        break;
      }
    }
    if (checkHillCollision("down")) {
      moving = false;
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.y -= 3;
      });
  } else if (keys.ArrowLeft.pressed && lastKey === "ArrowLeft") {
    player.animate = true;
    player.image = player.sprites.left;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x + 3,
              y: boundary.position.y,
            },
          },
        })
      ) {
        console.log("colliding");
        moving = false;
        break;
      }
    }
    if (checkHillCollision("left")) moving = false;

    if (moving)
      movables.forEach((movable) => {
        movable.position.x += 3;
      });
  } else if (keys.ArrowRight.pressed && lastKey === "ArrowRight") {
    player.animate = true;
    player.image = player.sprites.right;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - 3,
              y: boundary.position.y,
            },
          },
        })
      ) {
        console.log("colliding");
        moving = false;
        break;
      }
    }
    if (checkHillCollision("right")) moving = false;

    if (moving)
      movables.forEach((movable) => {
        movable.position.x -= 3;
      });
  }
}
animate();

let lastKey = "";
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      keys.ArrowUp.pressed = true;
      lastKey = "ArrowUp";
      break;
    case "ArrowDown":
      keys.ArrowDown.pressed = true;
      lastKey = "ArrowDown";
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = true;
      lastKey = "ArrowLeft";
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = true;
      lastKey = "ArrowRight";
      break;
  } //Event listener for Arrow Keys Down for movement
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "ArrowUp":
      keys.ArrowUp.pressed = false;
      break;
    case "ArrowDown":
      keys.ArrowDown.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
  } //Event listener for Arrow Keys Up to stop
});

// Mobile virtual controls

// Detect if the user is on a mobile device
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
  // Show the virtual buttons for mobile devices
  document.querySelector("#arrow-buttons").style.display = "block";
} else {
  // Hide the virtual buttons on desktop devices
  document.querySelector("#arrow-buttons").style.display = "none";
}

// Function to start pressing arrow keys on button press
function startPressArrowKey(key) {
  keys[key].pressed = true;
  lastKey = key;
}

// Function to stop pressing arrow keys on button release
function stopPressArrowKey(key) {
  keys[key].pressed = false;
}

// Event listeners for button clicks to start pressing arrow keys
document.querySelector("#up-button").addEventListener("touchstart", (e) => {
  if (e.cancelable) {
    e.preventDefault(); // Prevent default touch event behavior if cancelable
  }
  startPressArrowKey("ArrowUp");
});

document.querySelector("#left-button").addEventListener("touchstart", (e) => {
  if (e.cancelable) {
    e.preventDefault();
  }
  startPressArrowKey("ArrowLeft");
});

document.querySelector("#right-button").addEventListener("touchstart", (e) => {
  if (e.cancelable) {
    e.preventDefault();
  }
  startPressArrowKey("ArrowRight");
});

document.querySelector("#down-button").addEventListener("touchstart", (e) => {
  if (e.cancelable) {
    e.preventDefault();
  }
  startPressArrowKey("ArrowDown");
});

// Event listeners to stop pressing arrow keys on button release
document.querySelector("#up-button").addEventListener("touchend", () => {
  stopPressArrowKey("ArrowUp");
});

document.querySelector("#left-button").addEventListener("touchend", () => {
  stopPressArrowKey("ArrowLeft");
});

document.querySelector("#right-button").addEventListener("touchend", () => {
  stopPressArrowKey("ArrowRight");
});

document.querySelector("#down-button").addEventListener("touchend", () => {
  stopPressArrowKey("ArrowDown");
});
