"use strict";

var char_list = 'azertyuiopqsdfghjklmwxcvbn1234567890';
var char_list_length = char_list.length;
var id_length = 20;

var randInt = function randInt(min, max) {
  // min inclued, max exclued
  return Math.floor(Math.random() * (max - min)) + min;
};

var id_generator = function id_generator() {
  var id = "";

  for (var index = 0; index < id_length; index++) {
    id += char_list[randInt(0, char_list_length)];
  }

  return id;
};

module.exports = id_generator;
//# sourceMappingURL=id_generator.js.map