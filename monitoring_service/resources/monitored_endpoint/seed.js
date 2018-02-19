const Chance = require('chance');

const { MonitoredEndpoint } = require('../../db/index');

const chance = new Chance();

class MonitoredEndpointSeed {
  constructor(options) {
    const defaults = {
      name: chance.word(),
      url: chance.url(),
      dateOfLastCheck: null,
      monitoredInterval: chance.integer({ min: 15, max: 600 }),
    };
    const data = Object.assign({}, defaults, options);
    return new Promise(async (resolve, reject) => {
      try {
        const monitoredEndpoint = await MonitoredEndpoint.create(data);
        return resolve(monitoredEndpoint.get({ plain: true }));
      } catch (err) {
        return reject(err);
      }
    });
  }
}

module.exports = MonitoredEndpointSeed;
