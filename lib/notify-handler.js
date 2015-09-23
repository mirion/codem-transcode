var url    = require('url'),
    http   = require('http'),
    https   = require('https'),
    logger = require('./logger');

exports.notify = function(job) {
  var opts = job.parsedOpts();
  var notificationTimestamp = new Date().getTime();

  if (opts['callback_urls'] instanceof Array) {
    for (var u in opts['callback_urls']) {
      logger.log('Callback URL: ' + opts['callback_urls'][u]);
      try {
        var obj = url.parse(opts['callback_urls'][u]);
        var data = JSON.stringify(job);
        var urlOpts = {
          method: 'PUT',
          port: obj.port,
          host: obj.hostname,
          path: [obj.pathname, obj.search].join(''),
          headers: { 'Content-Type': 'application/json',
                     'Accept': 'application/json',
                     'Content-Length': data.length,
                     'X-Codem-Notify-Timestamp': notificationTimestamp
                   }
        };
        var requestHandler = obj.protocol == "https:" ? https : http;
        var req = requestHandler.request(urlOpts, function(res) {
          logger.log('Notification completed with HTTP status code: ' + res.statusCode);
        }).on('error', function(err) {
          logger.log("Failed delivering notification due to connection error: " + err);
        });
        req.write(data);
        req.end();
      } catch (error) {
        logger.log("Failed delivering notification: " + error);
      }
    }
  }
}
