const PrettyStream = require('bunyan-prettystream');

const prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

module.exports = {
  env: 'test',
  port: 3000,
  database: {
    logging: false,
  },
  logger: {
    level: 100, // this mutes bunyan logger for testing
  },
};
