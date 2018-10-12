"use strict";

var randInt = function randInt(min, max) {
  // min inclued, max exclued
  return Math.floor(Math.random() * (max - min)) + min;
};

module.exports = randInt;
//# sourceMappingURL=randInt.js.map