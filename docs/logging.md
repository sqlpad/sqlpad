# Logging

SQLPad logs json messages using [pino](https://github.com/pinojs/pino), a simple and fast logging library. Log messages are sent to stdout, leaving how to handle the messages up to you. The pino ecosystem supports a variety of transports http://getpino.io/#/docs/transports that should cover most logging setups.

Two categories of messages are logged by SQLPad: "app" messages containing info messages, warnings, and errors relating to application code, and "web" messages relating to the actual http requests handled by SQLPad. The level at which these logs are logged can be configured separately, or even turned off, with the `appLogLevel` and `webLogLevel` settings. This level represents the minimum level to be logged. The value used should be one of `fatal`, `error`, `warn`, `info`, `debug`, `trace` or `silent`. Setting the level to `silent` will effectively disable the logger.

In production, log messages will be a single json object per line:

```
> node-dev server.js --dbPath ../db --port 3010 --debug --baseUrl /sqlpad --config './config.dev.ini'

{"level":30,"time":1581974034149,"pid":7226,"hostname":"hostname.local","name":"sqlpad-app","msg":"Loading users","v":1}
{"level":30,"time":1581974034150,"pid":7226,"hostname":"hostname.local","name":"sqlpad-app","msg":"Loading connections","v":1}
{"level":30,"time":1581974034150,"pid":7226,"hostname":"hostname.local","name":"sqlpad-app","msg":"Loading connectionAccesses","v":1}
{"level":30,"time":1581974034150,"pid":7226,"hostname":"hostname.local","name":"sqlpad-app","msg":"Loading queries","v":1}
{"level":30,"time":1581974034150,"pid":7226,"hostname":"hostname.local","name":"sqlpad-app","msg":"Loading queryHistory","v":1}
{"level":30,"time":1581974034150,"pid":7226,"hostname":"hostname.local","name":"sqlpad-app","msg":"Loading cache","v":1}
{"level":30,"time":1581974035055,"pid":7226,"hostname":"hostname.local","name":"sqlpad-app","msg":"Creating access on every connection to every user...","v":1}
{"level":30,"time":1581974035066,"pid":7226,"hostname":"hostname.local","name":"sqlpad-app","msg":"Welcome to SQLPad! Visit http://localhost:3010/sqlpad to get started","v":1}
{"level":30,"time":1581974050933,"pid":7226,"hostname":"hostname.local","name":"sqlpad-web","req":{"id":2,"method":"GET","url":"/sqlpad/signin"},"res":{"statusCode":200},"responseTime":3,"msg":"request completed","v":1}
{"level":30,"time":1581974050970,"pid":7226,"hostname":"hostname.local","name":"sqlpad-web","req":{"id":3,"method":"GET","url":"/sqlpad/javascripts/vendor/tauCharts/tauCharts.min.css"},"res":{"statusCode":304},"responseTime":2,"msg":"request completed","v":1}
```

During development, the logs can be piped to `pino-pretty`, which is used when running `npm start` by default, producing a more human friendly format:

```
> node-dev server.js --dbPath ../db --port 3010 --debug --baseUrl /sqlpad --config './config.dev.ini' | pino-pretty

[1581974767500] INFO  (sqlpad-app/7387 on hostname.local): Loading users
[1581974767501] INFO  (sqlpad-app/7387 on hostname.local): Loading connections
[1581974767501] INFO  (sqlpad-app/7387 on hostname.local): Loading connectionAccesses
[1581974767501] INFO  (sqlpad-app/7387 on hostname.local): Loading queries
[1581974767501] INFO  (sqlpad-app/7387 on hostname.local): Loading queryHistory
[1581974767501] INFO  (sqlpad-app/7387 on hostname.local): Loading cache
[1581974768401] INFO  (sqlpad-app/7387 on hostname.local): Creating access on every connection to every user...
[1581974768413] INFO  (sqlpad-app/7387 on hostname.local): Welcome to SQLPad! Visit http://localhost:3010/sqlpad to get started
[1581974774313] INFO  (sqlpad-web/7387 on hostname.local): request completed
    req: {
      "id": 1,
      "method": "GET",
      "url": "/sqlpad/signin"
    }
    res: {
      "statusCode": 304
    }
    responseTime: 8
[1581974774342] INFO  (sqlpad-web/7387 on hostname.local): request completed
    req: {
      "id": 2,
      "method": "GET",
      "url": "/sqlpad/javascripts/vendor/tauCharts/tauCharts.min.css"
    }
    res: {
      "statusCode": 304
    }
    responseTime: 3

```
