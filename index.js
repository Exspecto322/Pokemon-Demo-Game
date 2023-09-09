const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1276
canvas.height = 840

c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)

const image = new Image()
image.src = './assets/pokemonStyleGameMap.png'

const playerImage = new Image()
playerImage.src = './assets/boywalk.png'

window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false) //Disable scrolling with arrow keys

class Sprite {
    constructor({position, velocity, image }) {
        this.position = position
        this.image = image
    }
    draw(){
        c.drawImage(this.image, this.position.x, this.position.y)
    } //Class to create map movement
}

const background = new Sprite({
    position: {
        x: -50,
        y: -2159
    },
    image: image 
})  //Added background to set ilusion of movement

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

function animate() {
    window.requestAnimationFrame(animate)
    background.draw()
    c.drawImage(
        playerImage,
        0,
        0,                          //Crop position
        playerImage.width/4,
        playerImage.height/4,       //Crop w&h
        canvas.width/2 - (playerImage.width/2.45)/2,
        canvas.height/2 - (playerImage.height/3.5)/2,
        playerImage.width/4,
        playerImage.height/4        // Coodinates and actual w&h render
    )

    if(keys.ArrowUp.pressed && lastKey === 'ArrowUp') background.position.y += 3
    else if(keys.ArrowDown.pressed && lastKey === 'ArrowDown') background.position.y -= 3
    else if(keys.ArrowLeft.pressed && lastKey === 'ArrowLeft') background.position.x += 3
    else if(keys.ArrowRight.pressed && lastKey === 'ArrowRight') background.position.x -= 3
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