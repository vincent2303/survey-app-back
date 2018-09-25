const randInt = function (min, max) { // min inclued, max exclued
  return Math.floor(Math.random() * (max - min)) + min;
};
  

module.exports = randInt;