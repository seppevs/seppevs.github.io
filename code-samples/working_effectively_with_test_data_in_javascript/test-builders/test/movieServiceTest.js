'use strict';

var expect = require('chai').expect;
var movieService = require('../lib/movieService');

var movieWith = require('./movieBuilder').movieWith;

describe('movieService', function() {

  it('should be possible to get a list of titles by genre', function() {
    movieService.movies = [
      movieWith({title: 'Django Unchained', genre: 'Western'}),
      movieWith({title: 'Lost Highway', genre: 'Mystery'}),
      movieWith({title: 'The Hateful Eight', genre: 'Western'}),
      movieWith({title: 'Terminator 2', genre: 'Action'}),
    ];

    expect(movieService.getTitlesByGenre('Western'))
      .to.have.length(2)
      .and.to.contain('Django Unchained', 'The Hateful Eight');
  });

  it('should be possible to get a list of titles by director', function() {
    movieService.movies = [
      movieWith({title: 'Casino', director: 'Martin Scorsese'}),
      movieWith({title: 'Corpse Bride', director: 'Tim Burton'}),
      movieWith({title: 'Django Unchained', director: 'Quentin Tarantino'}),
      movieWith({title: 'Taxi Driver', director: 'Martin Scorsese'}),
      movieWith({title: 'The Hateful Eight', director: 'Quentin Tarantino'}),
      movieWith({title: 'Raging Bull', director: 'Martin Scorsese'}),
    ];

    expect(movieService.getTitlesByDirector('Martin Scorsese'))
      .to.have.length(3)
      .and.to.contain('Casino', 'Taxi Driver', 'Raging Bull');
  });

});