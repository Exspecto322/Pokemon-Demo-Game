const charmanderImage = new Image();
charmanderImage.src = "./assets/charmanderback.png";

const squirtleImage = new Image();
squirtleImage.src = "./assets/squirtlefront.png";

const pkm = {
  Charmander: {
    position: {
      x: 125,
      y: 350,
    },
    image: charmanderImage,
    name: "CHARMANDER",
    attacks: [attacks.Tackle, attacks.Ember, attacks.Ember, attacks.Tackle],
  },
  Squirtle: {
    position: {
      x: 925,
      y: 125,
    },
    image: squirtleImage,
    isEnemy: true,
    name: "SQUIRTLE",
    attacks: [attacks.Tackle, attacks.Ember],
  },
};
