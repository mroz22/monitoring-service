const sequelize = require('./db');

module.exports = { sequelize, ...sequelize.models };
