const { MonitoringResult } = require('../../db/index');

class MonitoringResultSeed {
  constructor(options) {
    const payload = JSON.stringify({ bla: 'bla' });
    const defaults = {
      statusCode: 200,
      payload,
    };
    const data = Object.assign({}, defaults, options);
    return new Promise(async (resolve, reject) => {
      try {
        const monitoringResult = await MonitoringResult.create(data);
        return resolve(monitoringResult.get({ plain: true }));
      } catch (err) {
        return reject(err);
      }
    });
  }
}

module.exports = MonitoringResultSeed;
