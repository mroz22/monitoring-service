const bunyan = require('bunyan');

module.exports = {
  name: 'Monitoring services',
  database: {
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    dialect: 'mysql',
    operatorsAliases: false, // disable aliases
  },
  logger: {
    name: 'base_logger',
    serializers: {
      req: bunyan.stdSerializers.req,
      res: bunyan.stdSerializers.res,
    },
  },
};
