const sequelize = require('./db');

// TODO: why do tests fail here? ?? ?

module.exports = { sequelize, ...sequelize.models };
