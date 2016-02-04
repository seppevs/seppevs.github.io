---
layout: post
title:  Unit Testing with Mocks in Node
summary: In this tutorial we'll learn how to test features in complete isolation by using mocks & stubs.
date:   2015-03-22 11:37:58
tags:
- JavaScript
- Node.js
- Testing
- Mocking
- TDD
- BDD
- Tutorial
comments: true
---

## Introduction to Unit Testing

Writing tests makes the developer more certain of their work, and reduces the chance of bugs. Whether you're doing TDD or BDD, in more complex applications you _will_ end up with a mix
of unit tests & integration tests.

* **Unit Testing** is a test approach where a developer tests each feature in complete isolation. The scope is very narrow and well defined. Complex dependencies and interactions
to the outside world are stubbed or mocked. Only the internal consistency is tested.
* **Integration Testing** is another approach where a developer verifies that different parts of the system work together. Multiple layers are involved and external resources (database instances, file system, network, ...) are consulted.

The rest of this post will focus on unit testing.

## Node Unit Test Tools

[Mocha](http://mochajs.org/) will be our overall test framework. It's the most feature-rich JavaScript test framework for Node.js existing today.
Make sure you've installed this globally as well:

{% highlight Bash %}
$ npm install -g mocha
{% endhighlight %}

[Chai](http://chaijs.com/) is a popular JavaScript TDD/BDD assertion library for Node.js and the browser. It works flawlessly with Mocha.

[Proxyquire](https://github.com/thlorenz/proxyquire) is a tool we will use to proxy Node's `require()` function. By doing this we can easily override dependencies during testing.

[Sinon](http://sinonjs.org/) is a mocking/spying/stubbing framework for JavaScript. This works great in combination with Proxyquire.

## Functional Requirements

Imagine we need to implement a module 'twitstat'.

#### The user story:

> As a user of the module 'twitstat'<br />
> I want to know how popular a certain url is, based on how many times it was shared on Twitter<br />
> So I can make use of this 'popularity' value in my own application

#### The logic to assign the "popularity" value:

> * LOW popularity: urls shared less than 10 times
> * MEDIUM popularity: urls shared between 10 and 50 times
> * HIGH popularity: urls shared more than 50 times

## Technical Requirements

### twitstat module

#### How the signature of the function should look like:
{% highlight JavaScript %}
function getPopularity(url, callback) {

}
{% endhighlight %}

#### The callback should follow the usual Node convention:
{% highlight JavaScript %}
function callback(err, data) {
    // err is null OR contains an Error if something went wrong
    // data contains a JSON object
}
{% endhighlight %}

#### The data JSON object should look like this:
{% highlight JavaScript %}
{
  url: "http://imdb.com/",
  popularity: "HIGH"
}
{% endhighlight %}

### Using Twitter's REST service

#### Request
The twitstat module should send a HTTP GET request to this Twitter REST service:
[http://urls.api.twitter.com/1/urls/count.json?url=imdb.com](http://urls.api.twitter.com/1/urls/count.json?url=imdb.com)

#### Response
An example:
{% highlight JavaScript %}
{
  count: 1279,
  url: "http://imdb.com/"
}
{% endhighlight %}


## Setting up the project

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

Note: [Request](https://www.npmjs.com/package/request) is a nice module to send HTTP requests. We will use to call the Twitter REST service in the production code.
It's also the module we will stub in our unit test.

Install all dependencies listed in the `package.json` file:

{% highlight Bash %}
$ npm install
{% endhighlight %}



## Scenario 1

### URL's with less than 10 shares should get a LOW popularity:
> Given a url with 9 shares on Twitter<br />
> When the popularity of that url is requested<br />
> Then I should get LOW as popularity

### RED phase: add a test that should fail

As a good software craftsman, we write the test first.

#### Create a tests directory:
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

    it('should report a LOW popularity when given url is shared less than 10 times', function (done) {
        var expectedEndpoint = 'http://urls.api.twitter.com/1/urls/count.json?url=some-url.com';
        var body = JSON.stringify({
            count: 9,
            url: "http://some-url.com/"
        });
        request.withArgs(expectedEndpoint).yields(null, null, body);

        twitstat.getPopularity('some-url.com', function (err, data) {
            expect(err).to.be.null;
            expect(data).to.equal(JSON.stringify({
                "url": "http://some-url.com/",
                "popularity": "LOW"
            }));
            done();
        });
    });
});
{% endhighlight %}

What happens:

* The `require()` statements import the test tools (chai, sinon, proxyquire)
* `describe()` bundles all twitstat tests
* `before()` runs before each test, in here:
  * A stubbed request is created with Sinon
  * The twitstat module (= the module under test) is imported with proxyquire. We inform Proxyquire to replace the real 'request' module with our stubbed 'request' module. Proxyquire will return this stub when the twitstat module calls `require('request')`.
* `it()` defines the first test/specification.
* The request stub is configured: when invoked with 'some-url.com', then yield the callback function with:
  * **null**:the 'error' parameter
  * **null**: the 'response' parameter.
  * **response**: the _(fake)_ HTTP JSON response string we would get from Twitter.
* Finally, we invoke `getPopularity()` _(the function under test)_ with:
  * **some-url.com**: the same url we've configured in the stubbed request
   * _**callback function**_, it contains the actual test/spec:
       * We expect the err to be null (= what we yield in the stubbed request)
       * We expect the data to be a JSON string containing the url (as returned by the Twitter service) and a popularity with value "LOW"
       * We inform Mocha that we're `done()`. This is necessary when testing code with callbacks.

### Run all tests:
{% highlight Bash %}
$ npm test
{% endhighlight %}
_Note: This will run `mocha tests`, as configured in the package.json file_

The test we've added should fail because we haven't implemented anything yet:

![First test should fail](/public/images/posts/unit_testing_with_mocks_in_node_js/test1-fail.png)

### GREEN Phase: make the test pass

We will now do the minimum amount of work required to make the test pass.

#### Create a lib directory:
{% highlight Bash %}
$ mkdir lib
{% endhighlight %}

Create a new file 'twitstat.js' in the lib directory.

#### lib/twitstat.js:
{% highlight JavaScript %}
var request = require('request');

module.exports = {
    getPopularity: function (url, callback) {
        var endpoint = "http://urls.api.twitter.com/1/urls/count.json?url=" + url;
        request(endpoint, function (err, response, body) {
            var twitterResponse = JSON.parse(body);
            var data = JSON.stringify({
                "url": twitterResponse.url,
                "popularity": "LOW"
            });
            return callback(null, data);
        });
    }
};
{% endhighlight %}

What happens:

* The request module is imported _(= stubbed in the test with Sinon & Proxyquire)_
* An object is exported. It has an `getPopularity()` function:
    * it constructs the endpoint by appending the url argument to the twitter endpoint URL
    * it sends an HTTP request
    * when it receives a response, it invokes the given callback with the URL of the Twitter response + a popularity of LOW.

_Note: returning the callback is not a mistake. It's a [good practice](http://blog.risingstack.com/node-js-best-practices/)!_

### Run the test again:
{% highlight Bash %}
$ npm test
{% endhighlight %}

The test should pass now:

![First test should fail](/public/images/posts/unit_testing_with_mocks_in_node_js/test1-pass.png)

Congratulations. You just completed the first iteration.

## Try to implement the rest of the scenarios by yourself
You should be able to implement the by yourself now. Another option is to scroll down and peek at the end solution.

### Scenario 2

#### URL's with more than 50 shares should get a HIGH popularity:
> Given a url with 51 shares on Twitter<br />
> When the popularity of that url is requested<br />
> Then I should get HIGH as popularity

### Scenario 3:

#### URL's with with shares between 10 and 50 should get a MEDIUM popularity
> Given a url with 25 shares on Twitter<br />
> When the popularity of that url is requested<br />
> Then I should get MEDIUM as popularity

### Scenario 4:

#### Errors should be handled correctly

> Given some random url<br />
> When an error occurred while requesting Twitter<br />
> Then I should get a populated error object and no data

Remember: [you should always check for errors](http://blog.risingstack.com/node-js-best-practices/)!

### Always follow this order:

* RED phase:
  * write a test for above scenario
  * verify that the test fails
* GREEN phase:
  * add the minimal amount of code necessary to make the test pass
  * verify that all tests pass
* REFACTOR phase:
  * refactor when necessary


## A possible end solution

#### test/twitstat.js
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

    it('should report a LOW popularity when given url is shared less than 10 times', function (done) {
        var expectedEndpoint = 'http://urls.api.twitter.com/1/urls/count.json?url=some-url.com';
        var body = JSON.stringify({
            count: 9,
            url: "http://some-url.com/"
        });
        request.withArgs(expectedEndpoint).yields(null, null, body);

        twitstat.getPopularity('some-url.com', function (err, data) {
            expect(err).to.be.null;
            expect(data).to.equal(JSON.stringify({
                "url": "http://some-url.com/",
                "popularity": "LOW"
            }));
            done();
        });
    });

    it('should report a HIGH popularity when given url is shared 51 times', function (done) {
        var expectedEndpoint = 'http://urls.api.twitter.com/1/urls/count.json?url=other-url.com';
        var body = JSON.stringify({
            count: 51,
            url: "http://other-url.com/"
        });
        request.withArgs(expectedEndpoint).yields(null, null, body);

        twitstat.getPopularity('other-url.com', function (err, data) {
            expect(err).to.be.null;
            expect(data).to.equal(JSON.stringify({
                "url": "http://other-url.com/",
                "popularity": "HIGH"
            }));
            done();
        });
    });

    it('should report a MEDIUM popularity when given url is shared 25 times', function (done) {
        var expectedEndpoint = 'http://urls.api.twitter.com/1/urls/count.json?url=blah.com';
        var body = JSON.stringify({
            count: 25,
            url: "http://blah.com/"
        });
        request.withArgs(expectedEndpoint).yields(null, null, body);

        twitstat.getPopularity('blah.com', function (err, data) {
            expect(err).to.be.null;
            expect(data).to.equal(JSON.stringify({
                "url": "http://blah.com/",
                "popularity": "MEDIUM"
            }));
            done();
        });
    });

    it('should invoke the callback with an error object when things go wrong', function(done) {
        var expectedEndpoint = 'http://urls.api.twitter.com/1/urls/count.json?url=idmb.com';
        var expectedError = new Error('Not found');
        request.withArgs(expectedEndpoint).yields(expectedError, null, null);

        twitstat.getPopularity('idmb.com', function(err, data) {
            expect(err).to.equal(expectedError);
            expect(data).to.be.null;
            done();
        });
    });
});
{% endhighlight %}


#### lib/twitstat.js
{% highlight JavaScript %}
var request = require('request');

module.exports = {
    getPopularity: function (url, callback) {
        var endpoint = "http://urls.api.twitter.com/1/urls/count.json?url=" + url;
        request(endpoint, function (err, response, body) {
            if (err) {
                return callback(err, null);
            }
            var twitterResponse = JSON.parse(body);
            var popularity = "MEDIUM";
            if (twitterResponse.count < 10) {
                popularity = "LOW";
            } else if (twitterResponse.count > 50) {
                popularity = "HIGH";
            }

            var stat = JSON.stringify({
                "url": twitterResponse.url,
                "popularity": popularity
            });

            return callback(null, stat);
        });
    }
};
{% endhighlight %}

All code of this blog post is [available on github](https://github.com/seppevs/seppevs.github.io/tree/master/code-samples/unit_testing_with_mocks_in_node_js/twitstat)