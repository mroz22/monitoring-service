const fs = require('fs');
const Sequelize = require('sequelize');
const databaseConfig = require('../config').database;

const sequelize = new Sequelize(
  databaseConfig.name,
  databaseConfig.username,
  databaseConfig.password,
  databaseConfig,
);

const models = new Map();
fs.readdirSync(`${__dirname}/../resources`).forEach((resource) => {
  const model = sequelize.import(`../resources/${resource}/model`);
  models.set(model.name, model);
});

models.forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = sequelize;
