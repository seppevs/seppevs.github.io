---
layout: post
title:  Test Driven Development with Node.js
summary: Covering your code with tests is important as it makes you more certain of your work and reduces the chance of bugs. Enter the world of TDD/BDD in Node.js
date:   2015-03-15 11:37:58
tags:
- JavaScript
- Node.js
- TDD
- BDD
- Testing
- Mocking
---

## Introduction

Test Driven Development is an iterative process where a developer follows the _red-green-refactor_ cycle:

1. Add a test
+  Run all tests and verify that the new test fails (RED)
*  Write the minimal amount of code necessary to make the test pass
*  Run all tests again to verify that all tests pass now (GREEN)
*  Refactor any code if necessary (REFACTOR)

Writing tests makes the developer more certain of his work, and reduces the chance of bugs.
Another positive side-effect is that those tests also function as documentation, because they read as list of specifications of the written software.

## Unit Testing with Node.js

Unit Testing is a test approach where a developer tests each feature in complete isolation of any other code. A mocking framework can help to achieve this level of isolation.

### Requested specifications
Imagine we need to write a piece of software with the following specifications:
> Implement a HTTP server that listens on 127.0.0.1:1337


> It should respond with HTTP status code 200.

> It should response with content type 'plain text'.

> It should write 'Hello World\n' as response body.

Let's see how we can implement this by following a TDD approach in Node.js

### Setting up the project

Usually, you initialize a Node project with `npm init` and you continue with installing dependencies with `npm install <module>`.
But to speed things up, just create a `package.json` file in a empty directory with the following content:

{% highlight JavaScript %}
{
  "name": "hello-tdd",
  "version": "1.0.0",
  "description": "A TDD example",
  "main": "index.js",
  "scripts": {
    "test": "mocha tests"
  },
  "author": "Sebastian Van Sande",
  "license": "MIT",
  "devDependencies": {
    "mocha": "^2.2.1",
    "chai": "^2.1.1",
    "proxyquire": "^1.4.0",
    "sinon": "^1.14.0"
  }
}
{% endhighlight %}

Install all dependencies listed in your `package.json` file:

{% highlight Bash %}
$ npm install
{% endhighlight %}


###Introducing the Test Toolkit
[Mocha](http://mochajs.org/) will be our overall test framework. It's the most feature-rich JavaScript test framework for Node.js existing today.
Make sure you've installed this globally as well:

{% highlight Bash %}
$ npm install -g mocha
{% endhighlight %}

[Chai](http://chaijs.com/) is a popular JavaScript TDD/BDD assertion library for Node.js and the browser. It works flawlessly with Mocha.

[Proxyquire](https://github.com/thlorenz/proxyquire) is a tool we will use to proxy Node's `require()`function. By doing this we can easily override dependencies during testing.

[Sinon](http://sinonjs.org/) is a mocking/spying/stubbing framework for JavaScript. We will use it fake behaviour of external dependencies.


### Doing TDD

We will now iteratively implement the requested features in a TDD fashion.

#### First cycle
> Implement a HTTP server that listens on 127.0.0.1:1337
> It should respond with HTTP status code 200.

##### RED phase
Create the test file `tests/hello.js` with content:
{% highlight JavaScript %}

{% endhighlight %}

We end up with the famous code snippet that [features on the Node.js homepage](https://nodejs.org/)
{% highlight JavaScript %}
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
{% endhighlight %}


## This post is still incomplete, the rest will follow later.
