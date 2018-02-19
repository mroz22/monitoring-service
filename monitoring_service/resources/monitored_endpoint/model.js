const _ = require('lodash');
const {
  NotFoundError, BadRequestError, InternalServerError,
} = require('restify-errors');

const monitorEndpointsEmitter = require('./events');

module.exports = (sequelize, DataTypes) => {
  const MonitoredEndpoint = sequelize.define('MonitoredEndpoint', {
    name: {
      type: DataTypes.STRING,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: {
          args: [{ protocols: ['http', 'https'] }],
          msg: 'must be valid url',
        },
      },
    },
    dateOfLastCheck: {
      type: DataTypes.DATE,
      // isDate: {
      //   msg: 'must be of Date type',
      // },
    },
    monitoredInterval: {
      type: DataTypes.INTEGER.UNSIGNED,
      validate: {
        min: {
          args: [10],
          msg: 'value must be 10 or more',
        },
        isInt: {
          msg: 'must be of Int type',
        },
      },
      defaultValue: 300,
    },
  });

  MonitoredEndpoint.associate = function (models) {
    MonitoredEndpoint.belongsTo(models.get('User'), {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false,
      },
    });
  };

  MonitoredEndpoint.buildAuthorizedFindAll = function (query, user) {
    if (!user || !user.id || !user.type) {
      throw new InternalServerError('user parameter missing or incomplete');
    }
    const restrictions = {
      1: { where: { UserId: user.id } },
      10: {},
    };
    _.merge(query, restrictions[user.type]);
    return this.findAll(query);
  };

  MonitoredEndpoint.buildAuthorizedFindOne = function (query, user) {
    if (!user || !user.id || !user.type) {
      throw new InternalServerError('user parameter missing or incomplete');
    }
    const restrictions = {
      1: { where: { UserId: user.id } },
      10: {},
    };
    _.merge(query, restrictions[user.type]);
    return this.findOne(query);
  };

  MonitoredEndpoint.findAllForUser = async function (options) {
    let data = [];
    try {
      data = await this.buildAuthorizedFindAll(options.query, options.user);
    } catch (err) {
      throw new BadRequestError();
    }
    return data;
  };

  MonitoredEndpoint.findOneForUser = async function (options) {
    let obj;
    try {
      obj = await this.buildAuthorizedFindOne(options.query, options.user);
    } catch (err) {
      throw new BadRequestError(err);
    }
    if (!obj) {
      throw new NotFoundError();
    }
    return obj;
  };

  MonitoredEndpoint.createForUser = async function (options) {
    if (!options.user || !options.user.id) {
      throw new InternalServerError('user parameter missing');
    }
    Object.assign(options.body, { UserId: options.user.id });
    try {
      return await MonitoredEndpoint.create(options.body);
    } catch (err) {
      throw new BadRequestError(err);
    }
  };

  MonitoredEndpoint.updateForUser = async function (options) {
    let obj;
    try {
      obj = await MonitoredEndpoint.findOneForUser(options);
    } catch (err) {
      throw (err);
    }
    try {
      obj = await obj.update(options.body);
    } catch (err) {
      throw new BadRequestError(err);
    }
    return obj;
  };

  MonitoredEndpoint.deleteForUser = async function (options) {
    let obj;
    try {
      obj = await MonitoredEndpoint.findOneForUser(options);
    } catch (err) {
      throw (err);
    }
    try {
      return await obj.destroy();
    } catch (err) {
      throw new InternalServerError(err);
    }
  };

  MonitoredEndpoint.findMonitoringResults = async function (options) {
    let obj;
    try {
      obj = await MonitoredEndpoint.findOneForUser(options);
      obj = obj.get({ plain: true });
    } catch (err) {
      throw (err);
    }
    let monitoringResults = [];
    try {
      monitoringResults = await sequelize.models.MonitoringResult.findAll({
        where: {
          MonitoredEndpointId: obj.id,
        },
        limit: 10,
        order: [['createdAt', 'DESC']],
      });
    } catch (err) {
      throw new InternalServerError('failed to load monitoring results for monitored endpoint', err);
    }
    return monitoringResults;
  };

  MonitoredEndpoint.addHook('afterCreate', (monitoredEndpoint) => {
    monitorEndpointsEmitter.emit('afterCreate', monitoredEndpoint.get({ plain: true }));
  });

  MonitoredEndpoint.addHook('afterDestroy', (monitoredEndpoint) => {
    monitorEndpointsEmitter.emit('afterDestroy', monitoredEndpoint.get({ plain: true }));
  });

  return MonitoredEndpoint;
};
