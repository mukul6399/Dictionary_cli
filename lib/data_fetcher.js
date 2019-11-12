const request = require('requestretry');

const apikey = 'b972c7ca44dda72a5b482052b1f5e13470e01477f3fb97c85d5313b3c112627073481104fec2fb1a0cc9d84c2212474c0cbe7d8e59d7b95c7cb32a1133f778abd1857bf934ba06647fda4f59e878d164';
const apihost = 'https://fourtytwowords.herokuapp.com';


function apiRetryStrategy (err, response, body, options) {
    // console.log(response.statusCode, response.body);
    return {
        mustRetry: err,
        options: options
    };
}

function apiDelayStrategy (err, response, body) {
    let attempts = -1;
    let retries = [10, 20, 30]; // 10 sec, 20 sec, 30 sec
    return () => {
        attempts += 1;
        return retries[attempts] * 1000;
    };
}

function api_request (params, method, payload, callback) {
    let url = apihost + '/' + params + '?api_key=' + apikey;
    let options = {
        url: url,
        method: method,
        headers: {},
        maxAttempts: 3,
        retryStrategy: apiRetryStrategy,
        delayStrategy: apiDelayStrategy()
    };
    if (payload) {
        options.body = payload;
        options.json = true;
    }
    request(options, function (err, response) {
        if (err) {
            callback(err)
        }
        callback(null, JSON.parse(response.body));
    });
}

module.exports = {
    api_request
};