'use strict';

module.exports = {
  movies: [],

  getTitlesByGenre: function (genre) {
    return this.movies
      .filter(function (movie) {
        return movie.genre === genre;
      })
      .map(toTitle);
  },

  getTitlesByDirector: function(director) {
    return this.movies
      .filter(function (movie) {
        return movie.director === director;
      })
      .map(toTitle);
  }
};

function toTitle(movie) {
  return movie.title;
}