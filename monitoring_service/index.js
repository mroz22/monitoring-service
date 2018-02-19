const config = require('./config');
const server = require('./server');
const logger = require('./logger');
const { sequelize } = require('./db');
const MonitoringManager = require('./modules/monitoring_manager/monitoring_manager');

try {
  sequelize.sync().then(() => {
    server.listen(config.port, async () => {
      logger.info(`server listening on port ${config.port}`);
      await MonitoringManager.start();
    });
  }).catch((err) => {
    logger.fatal('unable to connect to database', err);
  });
} catch (err) {
  logger.error(err);
}

