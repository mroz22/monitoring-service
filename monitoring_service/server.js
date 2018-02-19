const restify = require('restify');

const router = require('./router');
const logger = require('./logger');
const config = require('./config/index');

const server = restify.createServer({
  name: config.name,
  log: logger,
  // handleUncaughtExceptions: true,
});

server.pre(restify.pre.sanitizePath());
server.pre((request, response, next) => {
  request.log.info({ req: request }, 'REQUEST');
  next();
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.on('InternalServer', (req, res, err, callback) => {
  logger.error(err);
  return callback();
});

server.on('uncaughtException', (req, res, route, err) => {
  logger.error(err);
  res.send(500, {});
});

router.applyRoutes(server);

module.exports = server;
