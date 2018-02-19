module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  database: {
    logging: false,
  },
  logger: {
    streams: [{
      level: 'error',
      path: '.logs/errors.log',
      period: '1d',
      count: 3,
      type: 'rotating-file',
    }],
  },
};
