const battleBackgroundImage = new Image()
battleBackgroundImage.src = './assets/pokemonBattle.png'
const battleBackground = new Sprite ({
  position: {
    x: 0,
    y:0 
  },
  image: battleBackgroundImage,
})

const squirtleImage = new Image()
squirtleImage.src = './assets/squirtlefront.png'
const squirtle = new Sprite({
  position: {
    x: 925,
    y: 125
  },
  image: squirtleImage,
  isEnemy: true,
  name: 'SQUIRTLE'
})

const charmanderImage = new Image()
charmanderImage.src = './assets/charmanderback.png'
const charmander = new Sprite({
  position: {
    x: 125,
    y: 350
  },
  image: charmanderImage,
  name: 'CHARMANDER'
})

const renderedSprites =[squirtle, charmander]

function animateBattle() {
  window.requestAnimationFrame(animateBattle)
  battleBackground.draw()

  renderedSprites.forEach((sprite) => {
    sprite.draw()
  })
}

animate()
// animateBattle()

const queue = []


// event listeners for our buttons (attack)
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', (e) => {
    const selectedAttack = attacks[e.currentTarget.innerHTML]
    charmander.attack({ attack: selectedAttack,
    recipient: squirtle,
    renderedSprites
   })

   queue.push(() => {
    squirtle.attack({ attack: attacks.Tackle,
      recipient: charmander,
      renderedSprites
     })
   })
  })
})

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