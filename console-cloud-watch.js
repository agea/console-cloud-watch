(function (name, context, definition) {
    'use strict'
    if (typeof window.define === 'function' && window.define.amd) { window.define(definition) } else if (typeof module !== 'undefined' && module.exports) { module.exports = definition() } else if (context.exports) { context.exports = definition() } else { context[name] = definition() }
})('ConsoleCloudWatch', this, function () {

    return function (aws_access_key_id, aws_secret_access_key, region, group, levels, timeout, mute) {
        var logEvents = [];
        var cloudwatchlogs = new AWS.CloudWatchLogs({
            accessKeyId: aws_access_key_id, secretAccessKey: aws_secret_access_key, region: region
        });;

        var stream = localStorage.getItem('ConsoleCloudWatch:stream');

        if (stream) {
            init();
        } else {
            if (typeof (Fingerprint2) == 'undefined') {
                function guid() {
                    function s4() {
                        return Math.floor((1 + Math.random()) * 0x10000)
                            .toString(16)
                            .substring(1);
                    }
                    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                        s4() + '-' + s4() + s4() + s4();
                }
                createStream(guid());
            } else {
                new Fingerprint2().get(function (result, components) {
                    createStream(result);
                });
            }
        }
        window.onerror = function (msg, file, line, col, error) {
            StackTrace.fromError(error).then(function (stackFrames) {
                var stringifiedStack = msg + '\n' + file + '\n' + stackFrames.map(function (sf) {
                    return sf.toString();
                }).join('\n');
                logEvents.push({
                    message: stringifiedStack,
                    timestamp: new Date().getTime()
                });
            });
        };

        if (typeof (console) !== 'undefined') {
            (levels || ['error']).forEach(function (level) {
                var originalFn = console[level];
                console[level] = function (msg) {
                    logEvents.push({
                        message: msg,
                        timestamp: new Date().getTime()
                    });
                    if (!mute) {
                        originalFn(msg);
                    }
                }
            });
        }

        function init() {
            setInterval(function () {
                var pendingEvents = logEvents.splice(0);
                if (pendingEvents.length) {
                    cloudwatchlogs.putLogEvents({
                        logEvents: pendingEvents,
                        sequenceToken: localStorage.getItem('ConsoleCloudWatch:sequenceToken'),
                        logGroupName: group,
                        logStreamName: localStorage.getItem('ConsoleCloudWatch:stream')
                    }, function (err, data) {
                        if (err) {
                            logEvents = pendingEvents.concat(logEvents);
                            if (err.code == "InvalidSequenceTokenException") {
                                localStorage.setItem('ConsoleCloudWatch:sequenceToken', err.message.split('The next expected sequenceToken is: ')[1])
                            }
                        }
                        if (data) {
                            localStorage.setItem('ConsoleCloudWatch:sequenceToken', data.nextSequenceToken)
                        }
                    });
                }
            }, timeout || 10000);
        }

        function createStream(stream) {
            cloudwatchlogs.createLogStream({
                logGroupName: group,
                logStreamName: stream
            }, function (err, data) {
                if (err && err.code !== 'ResourceAlreadyExistsException') {
                    console.log(err, err.stack);
                } else {
                    localStorage.setItem('ConsoleCloudWatch:stream', stream);
                    init();
                }
            });
        }
    };
});