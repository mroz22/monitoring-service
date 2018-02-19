const Chance = require('chance');

const { sequelize, MonitoringResult } = require('../../db');
const MonitoringTask = require('./monitoring_task');
const UserSeed = require('../../resources/user/seed');
const MonitoredEndpointSeed = require('../../resources/monitored_endpoint/seed');

const chance = new Chance();

const createMonitoringTask = async (options) => {
  const user = await new UserSeed();
  Object.assign(options, { UserId: user.id }, options);
  const monitoredEndpoint = await new MonitoredEndpointSeed(options);
  return new MonitoringTask(monitoredEndpoint);
};

describe('MonitoringTask class', () => {
  afterAll(async () => {
    await sequelize.drop();
    await sequelize.sync();
  });

  test('new MonitoringTask() - It should create a new instance', () => {
    const result = new MonitoringTask({
      url: chance.url(),
      monitoredInterval: chance.integer({ min: 15, max: 600 }),
      MonitoredEndpointId: chance.integer({ min: 1 }),
    });
    expect(result).toBeInstanceOf(MonitoringTask);
  });

  test('start() - It should call start method on monitoringTask instance', async () => {
    jest.useFakeTimers();
    const monitoringTask = await createMonitoringTask({
      monitoredInterval: 40,
      url: 'https://jsonplaceholder.typicode.com/posts/1',
    });
    await monitoringTask.start();
    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 40000);
  });

  test('monitor() - It should fetch and save remote data using monitor method', async () => {
    const monitoringTask = await createMonitoringTask({
      monitoredInterval: 40,
      url: 'https://jsonplaceholder.typicode.com/posts/1',
    });
    const data = await monitoringTask.monitor();
    expect(data).toBeInstanceOf(MonitoringResult);
  });

  test('monitor() - It should try to use monitor method but fail, as the requested url is not accessible', async () => {
    const monitoringTask = await createMonitoringTask({
      monitoredInterval: 40,
      url: 'http://www.foo.foofoo/',
    });
    try {
      await monitoringTask.monitor();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('failed to fetch remote data for url http://www.foo.foofoo/');
    }
  });

  test('monitor() - It should try to use monitor method but fail, as the requested url does not return JSON', async () => {
    const monitoringTask = await createMonitoringTask({
      monitoredInterval: 40,
      url: 'http://www.foo.com/',
    });
    try {
      await monitoringTask.monitor();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual('failed to save data for url http://www.foo.com/. Error: Validation error: payload must be JSON');
    }
  });
});
