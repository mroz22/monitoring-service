/* eslint-disable */

/*
Just a small db seeder script run via `npm run seed`
 */

const inquirer = require('inquirer');
const Chance = require('chance');

const { sequelize } = require('./db/index');
const config = require('./config/index');

const UserSeed = require('./resources/user/seed');
const MonitoredEndpointSeed = require('./resources/monitored_endpoint/seed');
const MonitoringResultSeed = require('./resources/monitoring_result/seed');

const chance = new Chance();

sequelize.authenticate().then(() => inquirer.prompt([{
  type: 'confirm',
  name: 'confirm',
  message: `Are you sure you want to delete all data from ${config.database.name} db instance
    and run this seeder?`,
  default: true,
}])).catch((err) => {
  throw new Error(`unable to connect to dev database, are you sure it is up and your .env.development is set up correctly? ${err.message}`);
}).then((answers) => {
  if (answers.confirm) {
    return sequelize.sync({ force: true });
  }
  console.log('no seeding happened');
  process.exit(0);
})
  .catch((err) => {
    throw new Error(`sync database failed. ${err.message}`);
  })
  .then(() => sequelize.query('SET FOREIGN_KEY_CHECKS = 0'))
  .then(() => {
    const users = [
      new UserSeed({
        name: 'Applifting',
        email: 'info@applifting.cz',
        accessToken: '93f39e2f-80de-4033-99ee-249d92736a2',
        type: 10,
      }),
      new UserSeed({
        name: 'Batman',
        email: 'batman@example.com',
        accessToken: 'dcb20f8a-5657-4f1b-9f7f-ce65739b359e',
        type: 1,
      }),
    ];
    const monitoredEndpoints = [
      new MonitoredEndpointSeed({
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        monitoredInterval: 15,
        UserId: 1,
      }),
      new MonitoredEndpointSeed({
        url: 'https://jsonplaceholder.typicode.com/posts',
        monitoredInterval: 60,
        UserId: 2,
      }),
    ];
    const monitoringResults = Array.from(new Array(20), () => new MonitoringResultSeed({
      MonitoredEndpointId: chance.integer({ min: 1, max: monitoredEndpoints.length }),
    }));
    return Promise.all([
      ...users,
      ...monitoredEndpoints,
      ...monitoringResults,
    ]);
  })
  .catch((err) => {
    throw new Error(`Seed constructors failed. ${err.message}`);
  })
  .then(() => {
    console.log('Seed finished without errors');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(0);
  });
