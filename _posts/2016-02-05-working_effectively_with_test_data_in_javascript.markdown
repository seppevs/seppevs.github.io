---
layout: post
title:  Working effectively with test data in JavaScript
summary: How to write clean test code by specifying only the data that matters to your test.
date:   2016-02-05 10:11:23
tags:
- JavaScript
- Node.js
- Testing
- TDD
- BDD
- Tutorial
comments: true
---

## Introduction

This posts will show how you can keep your test code clean by using a builder to generate your test data.

## The Problem

Imagine we have an model _Movie_ where we store:

* title
* director
* rating
* genre
* year

We need to test & implement a Movie Service where we expose 2 functions:

* `getTitlesByGenre(genre)`
* `getTitlesByDirector(director)`

In the `getTitlesByGenre()` function, only the  _genre_ and _title_ attributes are relevant. <br />In the `getTitlesByDirector()` function, only the _title_ and _director_ are important.

While I prefer to work with full blown movie objects in my tests, I only want to specify the values of the attributes that really matter to my test. This is something I typically solve by creating a _movieBuilder_

## Generating Test Data

### movieBuilder.js
{% highlight JavaScript %}
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
{% endhighlight %}

This module provides 2 functions to create complete or partial randomized movie objects:

* `movie()` creates a movie object where all its attributes are randomized. It uses [chance](http://chancejs.com/) to generate realistic random data.
* `movieWith()` creates a movie object with all its attributes randomized, except for those specified in the _override_ argument.

An example of invoking `movie()`
{% highlight JavaScript %}
> movie()
{ title: 'Wasudfab be lezun.',
  director: 'Joe Pratt',
  rating: 7.5,
  genre: 'Comedy',
  year: 1995 }
{% endhighlight %}

And an example of invoking `movieWith(override)`
{% highlight JavaScript %}
> movieWith({title: 'The Loft'})
{ title: 'The Loft',
  director: 'Scott Torres',
  rating: 4.5,
  genre: 'Mystery',
  year: 2004 }
{% endhighlight %}

Let's see now how we can benefit from this in our tests:

### movieServiceTest.js

{% highlight JavaScript %}
'use strict';

var expect = require('chai').expect;
var movieService = require('../lib/movieService');

var movie = require('./movieBuilder').movie;
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
{% endhighlight %}

The `movieWith()` function allows us to specify only the data relevant to the functionality we're implementing.
All other data is randomized. It keeps the test code clean and readable.

For completeness, here is a possible implementation (and the `package.json` file):

### movieService.js

{% highlight JavaScript %}
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
{% endhighlight %}

### package.json

{% highlight JavaScript %}
{
  "name": "test-builders",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "mocha"
  },
  "author": "Sebastian Van Sande",
  "license": "MIT",
  "devDependencies": {
    "chai": "^3.5.0",
    "chance": "^0.8.0"
  },
  "dependencies": {
    "lodash": "^4.2.1"
  }
}
{% endhighlight %}

All code of this blog post is [available on github](https://github.com/seppevs/seppevs.github.io/tree/master/code-samples/working_effectively_with_test_data_in_javascript/test-builders)
