const { Router } = require('restify-router');

const Controller = require('./controller');

const controller = new Controller();
const router = new Router();

router.get('/user', controller.findAllForUser.bind(controller));
router.get('/', controller.findAll.bind(controller));
router.get('/:id/monitoring-results', controller.findMonitoringResults.bind(controller));
router.get('/:id', controller.findOne.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.del('/:id', controller.remove.bind(controller));

module.exports = router;
