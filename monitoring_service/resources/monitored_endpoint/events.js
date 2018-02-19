const Emitter = require('../../events');

class MonitoredEndpointsEmitter extends Emitter {}

const monitoredEndpointsEmitter = new MonitoredEndpointsEmitter();

module.exports = monitoredEndpointsEmitter;
