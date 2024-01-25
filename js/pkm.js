const pkm = {
  Charmander: {
    position: {
      x: 125,
      y: 350,
    },
    image: {
      src: "./assets/charmanderback.png",
    },
    name: "CHARMANDER",
    attacks: [attacks.Tackle, attacks.Ember, attacks.Ember, attacks.Tackle],
  },
  Squirtle: {
    position: {
      x: 925,
      y: 125,
    },
    image: {
      src: "./assets/squirtlefront.png",
    },
    isEnemy: true,
    name: "SQUIRTLE",
    attacks: [attacks.Tackle, attacks["Water Gun"]],
  },
};
