const PrettyStream = require('bunyan-prettystream');

const prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

module.exports = {
  env: 'development',
  port: 3000,
  database: {
    logging: false,
  },
  logger: {
    streams: [{
      level: 'info', // anything above info level will get logged this way
      stream: prettyStdOut,
    }],
  },
};
