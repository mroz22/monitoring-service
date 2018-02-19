const Controller = require('../../controller');
const { MonitoredEndpoint } = require('../../db');
const handleError = require('../../error_handler');

class MonitoredEndpointsController extends Controller {
  constructor(model = MonitoredEndpoint) {
    super(model);
  }

  async findAllForUser(req, res, next) {
    let monitoredEndpoints = [];
    const options = {
      user: req.user,
      query: {
        where: { UserId: req.user },
      },
    };
    try {
      monitoredEndpoints = await this.model.findAllForUser(options);
    } catch (err) {
      return next(handleError(err));
    }
    res.send(monitoredEndpoints);
    return next();
  }

  async findMonitoringResults(req, res, next) {
    let monitoredEndpoint = {};
    const options = {
      query: {
        where: {
          id: req.params.id,
        },
      },
      user: req.user,
    };
    try {
      monitoredEndpoint = await this.model.findMonitoringResults(options);
    } catch (err) {
      return next(handleError(err));
    }
    res.send(monitoredEndpoint);
    return next();
  }
}

module.exports = MonitoredEndpointsController;
