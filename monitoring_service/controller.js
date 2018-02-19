const handleError = require('./error_handler');

class Controller {
  constructor(model) {
    this.model = model;
  }

  async findAll(req, res, next) {
    let data = [];
    const options = {
      user: req.user,
      query: {},
    };
    try {
      data = await this.model.findAllForUser(options);
    } catch (err) {
      return next(handleError(err));
    }
    res.send(data);
    return next();
  }

  async findOne(req, res, next) {
    let obj = {};

    const options = {
      user: req.user,
      query: {
        where: { id: req.params.id },
      },
    };
    try {
      obj = await this.model.findOneForUser(options);
    } catch (err) {
      return next(handleError(err));
    }
    res.send(obj);
    return next();
  }

  async create(req, res, next) {
    let obj = {};
    const options = {
      user: req.user,
      body: req.body,
      query: {},
    };
    try {
      obj = await this.model.createForUser(options);
    } catch (err) {
      return next(handleError(err));
    }
    res.send(obj);
    return next();
  }

  async update(req, res, next) {
    let obj;
    const options = {
      user: req.user,
      body: req.body,
      query: { where: { id: req.params.id } },
    };
    try {
      obj = await this.model.updateForUser(options);
    } catch (err) {
      return next(handleError(err));
    }
    res.send(obj);
    return next();
  }

  async remove(req, res, next) {
    const options = {
      user: req.user,
      query: { where: { id: req.params.id } },
    };
    try {
      await this.model.deleteForUser(options);
    } catch (err) {
      return next(handleError(err));
    }
    res.send();
    return next();
  }
}

module.exports = Controller;
