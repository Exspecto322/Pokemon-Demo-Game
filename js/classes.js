class Sprite {
    constructor({position, velocity, image, frames = { max: 1 } }) {
        this.position = position
        this.image = image
        this.frames = frames

        this.image.onload = () => { 
        this.width = this.image.width / this.frames.max
        this.height = this.image.height
      }
    }
    draw(){
        c.drawImage(
          this.image,
          0,
          0,                         
          (this.image.width/this.frames.max)-1, // -1 added as sprite seems to have artifact with the cropping
          this.image.height,       
          this.position.x,
          this.position.y,
          (this.image.width/this.frames.max)+1, //compensating for artifact
          this.image.height       
      )
    } //Class to create map movement
}

class Boundary {
    static width = 88
    static height = 88
    constructor({position}) {
      this.position = position
      this.width = 84
      this.height =  60  //changed the 88 in height to produce a perspective for the top part of the player
    }
  
    draw() {
      c.fillStyle= 'rgba(255,0,0,0.0)'
      c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
  }