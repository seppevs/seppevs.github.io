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
});

/*
 var request = require('request');

 module.exports = {
 urlCount: function (url, callback) {
 request(url, function (err, response, body) {
 callback(null, body);
 });
 }
 };
 */


/*
 var request = require('request');
 request('http://www.google.com', function (error, response, body) {
 if (!error && response.statusCode == 200) {
 console.log(body) // Show the HTML for the Google homepage.
 }
 })
 */