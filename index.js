const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1276
canvas.height = 840

const collisionsMap = []
for (let i = 0; i < collisions.length; i+=36) {
  collisionsMap.push(collisions.slice(i, 36 + i))  // adds collision to rows with the info from the json Map
}

const boundaries = []
const offset = {
  x: -579,
  y: -2660
}

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 4817)  //collision value from array
    boundaries.push(
      new Boundary({
        position:{
      x: j * Boundary.width + offset.x, 
      y: i * Boundary.height + offset.y // collisions with size, 88 is the 32x32 pixels that the map and assets, as they are made at 275% zoom
       }
      })
    )
  })
})

const image = new Image()
image.src = './assets/pokemonStyleGameMap.png'

const foregroundImage = new Image()
foregroundImage.src = './assets/foreground.png'

const playerImage = new Image()
playerImage.src = './assets/boywalkdown.png'

window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false) //Disable scrolling with arrow keys

const player = new Sprite({
  position : {
    x:canvas.width/2 - (352/2.45)/2,
    y:canvas.height/2 - (120)/4.5,  //arbitrary size mod as assets are not perfect
  },
  image: playerImage,
  frames: {
    max:4
  }
})

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image 
})  //Added background to set ilusion of movement

const foreground = new Sprite({
  position: {
      x: offset.x,
      y: offset.y
  },
  image: foregroundImage 
})  //Added image to set ilusion of foreground

const keys = {
    ArrowUp: {
        pressed: false
    },
    ArrowDown: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    }
}

const movables = [background, ...boundaries, foreground]

function rectangularCollision({rectangle1, rectangle2}) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y)
}

function animate() {
    window.requestAnimationFrame(animate)
    background.draw()
    boundaries.forEach(boundary => {
      boundary.draw()
    })
    player.draw()
    foreground.draw()
  
    let moving = true
    if(keys.ArrowUp.pressed && lastKey === 'ArrowUp') {
      for (let i = 0; i< boundaries.length; i++) {
        const boundary = boundaries[i]
        if (
          rectangularCollision({
            rectangle1: player,
            rectangle2: {...boundary, position: {
              x: boundary.position.x,
              y: boundary.position.y + 3
            }}
          })
        ) {
          console.log('colliding')
          moving = false
          break 
        }
      }

      if (moving)
    movables.forEach((movable) => {
      movable.position.y += 3
    }) 
  } else if(keys.ArrowDown.pressed && lastKey === 'ArrowDown') {
    for (let i = 0; i< boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {...boundary, position: {
            x: boundary.position.x,
            y: boundary.position.y -3
          }}
        })
      ) {
        console.log('colliding')
        moving = false
        break 
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.y -= 3
      }) 
  } else if(keys.ArrowLeft.pressed && lastKey === 'ArrowLeft') {
    for (let i = 0; i< boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {...boundary, position: {
            x: boundary.position.x + 3,
            y: boundary.position.y
          }}
        })
      ) {
        console.log('colliding')
        moving = false
        break 
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.x += 3
      })    
  }  else if(keys.ArrowRight.pressed && lastKey === 'ArrowRight') {
    for (let i = 0; i< boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {...boundary, position: {
            x: boundary.position.x - 3,
            y: boundary.position.y
          }}
        })
      ) {
        console.log('colliding')
        moving = false
        break 
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.x -= 3
      }) 
  }
}
animate()

let lastKey =''
window.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowUp':
            keys.ArrowUp.pressed = true
            lastKey = "ArrowUp"
            break
          case 'ArrowDown':
            keys.ArrowDown.pressed = true
            lastKey = "ArrowDown"
            break
          case 'ArrowLeft':
            keys.ArrowLeft.pressed = true
            lastKey = "ArrowLeft"
            break
          case 'ArrowRight':
            keys.ArrowRight.pressed = true
            lastKey = "ArrowRight"
            break
        } //Event listener for Arrow Keys Down for movement
})

window.addEventListener('keyup', (e) => {
    switch (e.key) {
      case 'ArrowUp':
        keys.ArrowUp.pressed = false
        break
      case 'ArrowDown':
        keys.ArrowDown.pressed = false
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = false
        break
      case 'ArrowRight':
        keys.ArrowRight.pressed = false
        break
    } //Event listener for Arrow Keys Up to stop
})