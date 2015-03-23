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