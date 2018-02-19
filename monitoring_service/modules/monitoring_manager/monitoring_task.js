const request = require('request-promise-native');

const logger = require('../../logger');
const { sequelize, MonitoringResult, MonitoredEndpoint } = require('../../db');

class MonitoringTask {
  constructor(endpoint) {
    if (!endpoint.url || !endpoint.monitoredInterval) {
      throw new Error('missing required property in constructor');
    }
    this.endpoint = endpoint;
  }

  async start() {
    try {
      await this.monitor();
    } catch (err) {
      logger.error('monitoring task failed', err);
    }
    this.interval = setInterval(async () => {
      try {
        await this.monitor();
      } catch (err) {
        logger.error('monitoring task failed', err);
      }
    }, this.endpoint.monitoredInterval * 1000);
  }

  stop() {
    clearInterval(this.interval);
  }

  async monitor() {
    let response = {};
    try {
      response = await request({
        uri: this.endpoint.url,
        resolveWithFullResponse: true,
      });
    } catch (err) {
      throw new Error(`failed to fetch remote data for url ${this.endpoint.url}`, err);
    }

    const t = await sequelize.transaction();
    let monitoringResult = {};
    try {
      monitoringResult = await MonitoringResult.create({
        statusCode: response.statusCode,
        payload: response.body,
        MonitoredEndpointId: this.endpoint.id,
      }, { transaction: t });
      await MonitoredEndpoint.update({
        dateOfLastCheck: new Date(),
      }, {
        transaction: t,
        where: {
          id: this.endpoint.id,
        },
      });
      await t.commit();
    } catch (err) {
      await t.rollback();
      throw new Error(`failed to save data for url ${this.endpoint.url}. Error: ${err.message}`);
    }
    logger.info(`monitoring sequence for ${this.endpoint.url} finished successfully.`);
    return monitoringResult;
  }
}

module.exports = MonitoringTask;
