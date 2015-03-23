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