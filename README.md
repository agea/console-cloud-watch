# Console Cloud Watch

Send your browser errors and console message to AWS CLoudWatch

## Setup

 - Login to AWS console
 - Open CloudWatch
 - Create a Log Group (Set up a retention period to save space)
 - Open IAM
 - Create a new user with secret and access key
 - Assign the user a new policy wich will be able to write logs and create log streams (set your region and log group name):
 ```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": [
                "arn:aws:logs:AWS_REGION:*:log-group:LOG_GROUP:*:*",
                "arn:aws:logs:AWS_REGION:*:log-group:LOG_GROUP"
            ]
        }
    ]
}
 ```
 - beware that the credentials will be exposed in the browser so don't assign other permissions to this user.

## Get Console Cloud Watch

```
npm install console-cloud-watch

https://cdn.rawgit.com/agea/console-cloud-watch/0.0.3/dist/console-cloud-watch-all.min.js

```
`dist/console-cloud-watch-all.min.js` contains all the dependencies (and a custom build of AWS SDK with only the CloudWatch service), 
if you already include AWS SDK you may use `dist/dist/console-cloud-watch.min.js` directly, note that you have alsto to include `fingerprintjs2` and `stacktrace-js`



## Usage
Include `consolewatch.js` in your page, configure your parameters and you are done:

```javascript
    ConsoleCloudWatch(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, LOG_GROUP);
```

You may also pass 3 optional configuration parameters:

- `levels` (default: `['error']`): an array of strings with the console levels to intercept
- `timeout` (default: `10000`): milliseconds between calls to CloudWatch
- `mute` (default: `false`): if set to `true`, intercepted message will not be shown in console

Example: 
```javascript
    ConsoleCloudWatch(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, LOG_GROUP,['warn','error'],30000,true);
```
