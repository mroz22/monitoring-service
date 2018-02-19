module.exports = (sequelize, DataTypes) => sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNul: false,
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
    },
  },
  accessToken: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    // todo: enum
  },
});
