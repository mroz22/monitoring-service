const bunyan = require('bunyan');

const config = require('./config/index');

const logger = bunyan.createLogger(config.logger);

module.exports = logger;
