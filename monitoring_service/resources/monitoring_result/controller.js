const Controller = require('../../controller');
const { MonitoringResult } = require('../../db/index');

class MonitoringResultsController extends Controller {
  constructor(model = MonitoringResult) {
    super(model);
  }
}

module.exports = MonitoringResultsController;
