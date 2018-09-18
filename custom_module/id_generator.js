const char_list = 'azertyuiopqsdfghjklmwxcvbn1234567890';
const char_list_length = char_list.length;
const id_length = 20;

const randInt = function (min, max) { // min inclued, max exclued
  return Math.floor(Math.random() * (max - min)) + min;
};

const id_generator = function () {
  let id = "";
  for (let index = 0; index < id_length; index++) {
    id += char_list[randInt(0, char_list_length)];
  }
  return id;
};

module.exports = id_generator;