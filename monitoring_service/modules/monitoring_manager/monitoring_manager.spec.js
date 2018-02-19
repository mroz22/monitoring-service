const MonitoringManager = require('./monitoring_manager');
const MonitoredEndpointSeed = require('../../resources/monitored_endpoint/seed');
const UserSeed = require('../../resources/user/seed');

const createMonitoredEndpoint = async (options = {}) => {
  const user = await new UserSeed();
  Object.assign(options, { UserId: user.id }, options);
  const monitoredEndpoint = await new MonitoredEndpointSeed(options);
  return { user, monitoredEndpoint };
};

describe('MonitoringManger class', () => {
  test('loadEndpoints() - it should return array of endpoints', async () => {
    await createMonitoredEndpoint({ url: 'https://jsonplaceholder.typicode.com/posts/1' });
    const endpoints = await MonitoringManager.loadEndpoints();
    expect(endpoints).toBeType('array');
    endpoints.forEach((endpoint) => {
      expect(endpoint.id).toEqual(expect.any(Number));
      expect(endpoint.monitoredInterval).toEqual(expect.any(Number));
      expect(endpoint.url).toEqual(expect.any(String));
    });
  });
});
