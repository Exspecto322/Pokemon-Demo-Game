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

image.onload = () => {
    c.drawImage(image, -50, -2159)
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
}
