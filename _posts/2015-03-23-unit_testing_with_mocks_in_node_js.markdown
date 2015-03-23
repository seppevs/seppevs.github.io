---
layout: post
title:  Unit Testing with Mocks in Node.js
summary: Testing features in complete isolation by using mocks.
date:   2015-03-22 11:37:58
tags:
- JavaScript
- Node.js
- Unit
- Testing
- Mocking
---

## Introduction

Writing tests makes the developer more certain of his work, and reduces the chance of bugs. Whether you're doing TDD or BDD, usually you will end up with writing a mix
of unit tests & integration tests in your application.

* **Unit Testing** is a test approach where a developer tests each feature in complete isolation. The scope is very narrow and well defined. Complex dependencies and interactions
to the outside world are stubbed or mocked. Only the internal consistency is tested.
* **Integration Testing** is another approach where a developer verifies that different parts of the system work together. Multiple layers are involved and external resources (database instances, file system, network, ...) are consulted.

In this post, we will focus on how you can write unit tests with mocks in Node.

## An Example

### Functional Requirements

Imagine we need to implement a module 'twitstat' with the following specifications:

> As a user of the module 'twitstat'

> I want to know how many times a certain url was shared on Twitter

> So I can make use of this functionality in my own application

The signature of the new function should look like this:
{% highlight JavaScript %}
function urlCount(url, callback) {

}
{% endhighlight %}

The callback should follow the usual Node convention:
{% highlight JavaScript %}
function callback(err, data) {
    // err is null OR contains an Error if something went wrong
    // data contains the JSON response received from Twitter
}
{% endhighlight %}


It needs to send a HTTP GET request to this Twitter JSON REST endpoint:
[http://urls.api.twitter.com/1/urls/count.json?url=imdb.com](`http://urls.api.twitter.com/1/urls/count.json?url=imdb.com`)

A possible response:
{% highlight JavaScript %}
{
count: 1279,
url: "http://imdb.com/"
}
{% endhighlight %}


### Setting up the project

Create a new directory & navigate into it
{% highlight Bash %}
$ mkdir twitstat
$ cd twitstat
{% endhighlight %}

Create a package.json file:

#### package.json:
{% highlight JavaScript %}
{
  "name": "twitstat",
  "version": "1.0.0",
  "description": "A module to retrieve Twitter statistics",
  "main": "./lib/twitstat.js",
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
  },
  "dependencies": {
    "request": "^2.53.0"
  }
}
{% endhighlight %}

Install all dependencies listed in your `package.json` file:

{% highlight Bash %}
$ npm install
{% endhighlight %}


###Introducing the Test Tools
[Mocha](http://mochajs.org/) will be our overall test framework. It's the most feature-rich JavaScript test framework for Node.js existing today.
Make sure you've installed this globally as well:

{% highlight Bash %}
$ npm install -g mocha
{% endhighlight %}

[Chai](http://chaijs.com/) is a popular JavaScript TDD/BDD assertion library for Node.js and the browser. It works flawlessly with Mocha.

[Proxyquire](https://github.com/thlorenz/proxyquire) is a tool we will use to proxy Node's `require()` function. By doing this we can easily override dependencies during testing.

[Sinon](http://sinonjs.org/) is a mocking/spying/stubbing framework for JavaScript. This works great in combination with Proxyquire.

This is a very good combination of test tools to do unit testing in Node.

_Note: [Request]() is NOT a test tool! It's the module we will use to send HTTP requests to the Twitter API in the production code.
It's also the module we will stub in our unit test._

### Adding a first test

As a good software craftsman, we write the test first.

Create a tests directory
{% highlight Bash %}
$ mkdir tests
{% endhighlight %}

In this tests directory, create a new file 'twitstat.js':

#### tests/twitstat.js:
{% highlight JavaScript %}
var expect = require('chai').expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire');

describe('twitstat', function () {
    var twitstat;
    var request;
    before(function () {
        request = sinon.stub();
        twitstat = proxyquire('../lib/twitstat', {'request': request});
    });

    it('should invoke the callback with the data received from Twitter for the given URL', function (done) {
        var expectedEndpoint = 'http://urls.api.twitter.com/1/urls/count.json?url=reddit.com';
        var body = JSON.stringify({
            count: 9512,
            url: "http://reddit.com/"
        });
        request.withArgs(expectedEndpoint).yields(null, null, body);

        twitstat.urlCount('reddit.com', function (err, data) {
            expect(err).to.be.null;
            expect(data).to.equal(body);
            done();
        });
    });
});
{% endhighlight %}

A lot happens in here:

* The `require()` statements import the test tools (chai, sinon, proxyquire)
* `describe()` bundles all twitstat tests
* `before()` runs before each test, in here:
  * A stubbed request is created with Sinon
  * The twitstat module (= the module under test) is imported with proxyquire. We informed Proxyquire to replace the real 'request' module with our stubbed 'request' module. Proxyquire will return this stubbed request when the twitstat module calls `require('request')`.
* `it()` defines the first test/specification.
* The request stub is configured: when invoked with 'reddit.com', then yield the callback function with:
  * **null**:the 'error' parameter
  * **null**: the 'response' parameter.
  * **response**: the JSON response string. This is what the Twitter REST service would reply as HTTP response.
* Finally, we invoke `urlCount()` (the function under test) with:
  * **reddit.com**: the same url we've configured in the stubbed request
   * _**callback function**_, it contains the actual test/spec:
       * We expect the err to be null (because that's what we yield in the stubbed request)
       * We expect the data to be equal to the response we've configured in the stubbed request
       * We inform Mocha that we're `done()`. This is necessary when testing code with callbacks.

#### Run all tests:
{% highlight Bash %}
$ npm test
{% endhighlight %}
_Note: This will run `mocha tests`, as configured in the package.json file_

The test we've added should fail because we haven't implemented anything yet:

![First test should fail](/public/images/posts/unit_testing_with_mocks_in_node_js/first-test-fail.png)

### Making the first test pass

In order to make the test pass, we need to write the implementation code.

#### Create a lib directory:
{% highlight Bash %}
$ mkdir lib
{% endhighlight %}

Create a new file 'twitstat.js' in the lib directory.

#### lib/twitstat.js:
{% highlight JavaScript %}
var request = require('request');

module.exports = {
    urlCount: function (url, callback) {
        var endpoint = "http://urls.api.twitter.com/1/urls/count.json?url=" + url;
        request(endpoint, function (err, response, body) {
            return callback(null, body);
        });
    }
};

{% endhighlight %}

What happens here:

* The request module is imported _(= stubbed in the test with Sinon & Proxyquire)_
* An object is exported. It has an `urlCount()` function:
    * it constructs the endpoint by appending the url argument to the twitter endpoint URL
    * when the request module receives a response, it invokes the given callback with the received body.

_Note: returning the callback is not a mistake. It's a [good practice](http://blog.risingstack.com/node-js-best-practices/)!_

#### Run the test again:
{% highlight Bash %}
$ npm test
{% endhighlight %}


The test should pass now:

![First test should fail](/public/images/posts/unit_testing_with_mocks_in_node_js/first-test-pass.png)

### Adding a second test

Checking for errors is a [good practice](http://blog.risingstack.com/node-js-best-practices/). So add a new test after the previous `it()` function in the same `describe()` function block.
This time we do the HTTP request to Twitter with another url parameter (imdb.com).

#### tests/twitstat.js:
{% highlight JavaScript %}
    it('should invoke the callback with an error object when something went wrong', function(done) {
        var expectedEndpoint = 'http://urls.api.twitter.com/1/urls/count.json?url=idmb.com';
        var expectedError = new Error('Not found');
        request.withArgs(expectedEndpoint).yields(expectedError, null, null);

        twitstat.urlCount('idmb.com', function(err, data) {
            expect(err).to.equal(expectedError);
            expect(data).to.be.null;
            done();
        });
    });
{% endhighlight %}


#### Run all tests:
{% highlight Bash %}
$ npm test
{% endhighlight %}

The test we've added should fail:

### Making the second test pass

Modify the production code so it can deal with errors received from the request module:

#### lib/twitstat.js
{% highlight JavaScript %}
var request = require('request');

module.exports = {
    urlCount: function (url, callback) {
        var endpoint = "http://urls.api.twitter.com/1/urls/count.json?url=" + url;
        request(endpoint, function (err, response, body) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, body);
        });
    }
};
{% endhighlight %}


#### Run all tests again:
{% highlight Bash %}
$ npm test
{% endhighlight %}

All tests should pass now:


All code of this blog post is [available on github]()