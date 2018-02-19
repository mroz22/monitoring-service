const _ = require('lodash');
const {
  InternalServerError, BadRequestError,
  NotFoundError,
} = require('restify-errors');

module.exports = (sequelize, DataTypes) => {
  const MonitoringResult = sequelize.define('MonitoringResult', {
    statusCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSON,
      validate: {
        isJSON: {
          msg: 'payload must be JSON',
        },
      },
    },
  });

  MonitoringResult.associate = function (models) {
    models.get('MonitoringResult').belongsTo(models.get('MonitoredEndpoint'), {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false,
      },
    });
  };

  // Methods
  MonitoringResult.buildAuthorizedFindAll = function (query, user) {
    if (!user || !user.id || !user.type) {
      throw new InternalServerError('user parameter not passed or incomplete!');
    }
    const restrictions = {
      1: {
        include: [{
          model: sequelize.models.MonitoredEndpoint,
          where: { UserId: user.id },
          attributes: [],
        }],
      },
      10: {},
    };
    _.merge(query, restrictions[user.type]);
    return this.findAll(query);
  };

  MonitoringResult.buildAuthorizedFindOne = function (query, user) {
    if (!user || !user.id || !user.type) {
      throw new InternalServerError('user parameter not passed or incomplete!');
    }
    const restrictions = {
      1: {
        include: [{
          model: sequelize.models.MonitoredEndpoint,
          where: { UserId: user.id },
          attributes: [],
        }],
      },
      10: {},
    };
    _.merge(query, restrictions[user.type]);
    return this.findOne(query);
  };

  MonitoringResult.findAllForUser = async function (options) {
    let data = [];
    try {
      data = await this.buildAuthorizedFindAll(options.query, options.user);
    } catch (err) {
      throw new BadRequestError(err);
    }
    return data;
  };

  MonitoringResult.findOneForUser = async function (options) {
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

  MonitoringResult.createForUser = async function (options) {
    if (!options.user || !options.user.id) {
      throw new InternalServerError('user parameter missing');
    }
    if (!options.body.MonitoredEndpointId) {
      throw new BadRequestError('MonitoredEndpoint required parameter missing');
    }
    let associatedMonitoredEndpoint = {};
    try {
      associatedMonitoredEndpoint = await sequelize.models.MonitoredEndpoint.findOneForUser({
        user: options.user,
        query: { id: options.body.MonitoredEndpointId },
      });
    } catch (err) {
      throw new InternalServerError('unable to find associated monitoredEndpoint', err);
    }
    const body = {};
    Object.assign(body, options.body, { MonitoredEndpointId: associatedMonitoredEndpoint.id });
    try {
      return await MonitoringResult.create(body);
    } catch (err) {
      throw new BadRequestError(err);
    }
  };

  MonitoringResult.updateForUser = async function (options) {
    let obj;
    try {
      obj = await sequelize.models.MonitoringResult.findOneForUser({
        user: options.user,
        query: options.query,
      });
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

  MonitoringResult.deleteForUser = async function (options) {
    let obj;
    try {
      obj = await sequelize.models.MonitoredEndpoint.findOneForUser({
        user: options.user,
        query: options.query,
      });
    } catch (err) {
      throw (err);
    }
    try {
      return await obj.destroy();
    } catch (err) {
      throw new InternalServerError();
    }
  };
  return MonitoringResult;
};
