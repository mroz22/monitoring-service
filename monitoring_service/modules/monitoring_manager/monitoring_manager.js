const MonitoringTask = require('./monitoring_task');
const logger = require('../../logger');
const monitoredEndpointsEmitter = require('../../resources/monitored_endpoint/events');
const { MonitoredEndpoint } = require('../../db');

const monitoringTasks = [];
let monitoredEndpoints = [];

class MonitoringManager {
  static async loadEndpoints() {
    try {
      monitoredEndpoints = await MonitoredEndpoint.findAll().map(model => model.dataValues);
    } catch (err) {
      logger.error(err);
    }
    return monitoredEndpoints;
  }

  static addEndpoint(monitoredEndpoint) {
    const monitoringTask = new MonitoringTask(monitoredEndpoint);
    monitoringTask.start();
    monitoringTasks.push(monitoringTask);
    MonitoringManager.logInfo();
  }

  static removeEndpoint(monitoredEndpoint) {
    const index = monitoringTasks.findIndex(task => monitoredEndpoint.id === task.endpoint.id);
    monitoringTasks[index].stop();
    monitoringTasks.splice(index, 1);
    MonitoringManager.logInfo();
  }

  static logInfo() {
    logger.info(`now monitoring ${monitoringTasks.length} total endpoints`);
  }

  static async start() {
    try {
      monitoredEndpoints = await MonitoringManager.loadEndpoints();
      logger.info(`loaded ${monitoredEndpoints.length} monitored endpoints`);
      monitoredEndpoints.forEach(async (endpoint) => {
        const task = new MonitoringTask(endpoint);
        await task.start();
        monitoringTasks.push(task);
      });
    } catch (err) {
      logger.error('Monitoring endpoints failed', err);
    }
  }
}

monitoredEndpointsEmitter.on('afterCreate', (monitoredEndpoint) => {
  MonitoringManager.addEndpoint(monitoredEndpoint);
});

monitoredEndpointsEmitter.on('afterDestroy', (monitoredEndpoint) => {
  MonitoringManager.removeEndpoint(monitoredEndpoint);
});

module.exports = MonitoringManager;
