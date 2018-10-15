'use strict';

const loggerConfig = {
    url: 'https://<ip>:8088/services/collector',
    token: '<token>',
    maxRetries: 1
};

const SplunkLogger = require("splunk-logging").Logger;

var logger = new SplunkLogger(loggerConfig);

// Enable SSL certificate validation
//Logger.requestOptions.strictSSL = true;

// Override Splunk's default formatter
// to remove "message" and "severity" from the event message
logger.eventFormatter = function (message, severity) {
    return message;
}


module.exports = function (context, req) {
    if (req.body) {
        var payload = {
            message: req.body,

            // Metadata is optional
            metadata: {
                source: context.executionContext.functionName,
                sourcetype: "evidentio:alerts",
                host: "azure_function"
            }
        };
        context.log("Sending payload :", payload);

        logger.send(payload, function(err, resp, body) {
            if (err) {
                context.log("Response from Splunk: ", err);
                context.res = { status: 500, body: err};
            } else {
                context.log("Response from Splunk: ", body);
                context.res = { status: 200, body: body};
            }
            
        });
    } else {
        context.log("Unexpected alert message: ", req.body)
        context.res = { status: 400, body: {"error" : "Unexpected alert message"}};
    };
    

    context.done();
};
