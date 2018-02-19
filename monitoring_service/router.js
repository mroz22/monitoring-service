const { Router } = require('restify-router');

const authenticationMiddleware = require('./middlewares/authentication');
const monitoredEndpointsRouter = require('./resources/monitored_endpoint/routes');
const monitoringResultsRouter = require('./resources/monitoring_result/routes');

const rootRouter = new Router();

rootRouter.get('/', (req, res, next) => {
  res.send({
    name: 'monitoring-service',
  });
  return next();
});

const v1Router = new Router();
v1Router.use(authenticationMiddleware); // v1 router is behind authentication.

v1Router.get('/', (req, res, next) => {
  res.send('v1');
  return next();
});

v1Router.add('/monitored-endpoints', monitoredEndpointsRouter);
v1Router.add('/monitoring-results', monitoringResultsRouter);

rootRouter.add('/v1', v1Router);

module.exports = rootRouter;
