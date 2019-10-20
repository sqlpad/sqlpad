const bunyan = require('bunyan');
const config = require('./config');

module.exports = bunyan.createLogger({
  name: 'x-ray',
  src: true,
  serializers: {
    req: require('bunyan-express-serializer'),
    res: bunyan.stdSerializers.res,
    err: bunyan.stdSerializers.err
  },
  version: '0.1.0',
  level: config.get('logLevel')
});
