'use strict';

var chance = require('chance').Chance();
var _ = require('lodash');

module.exports = {
  movie: movie,
  movieWith: movieWith
}

function movie() {
  return {
    title: chance.sentence({words: chance.natural({min: 1, max: 3})}),
    director: chance.first() + ' ' + chance.last(),
    rating: chance.floating({min: 0, max: 9, fixed: 1}),
    genre: randomOf('Thriller', 'Action', 'Comedy', 'Mystery', 'Romance'),
    year: chance.natural({min: 1950, max: 2016})
  }
}

function movieWith(override) {
  return _.merge(movie(), override);
}

function randomOf() {
  var args = Array.prototype.slice.call(arguments);
  return args[Math.floor(Math.random() * args.length)];
}