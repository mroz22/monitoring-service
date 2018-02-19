const { User } = require('../db');
const { UnauthorizedError, BadRequestError } = require('restify-errors');

module.exports = async function (req, res, next) {
  const token = req.headers['x-access-token'];
  let user = {};
  try {
    user = await User.findOne({
      where: {
        accessToken: token,
      },
      raw: true,
    });
  } catch (err) {
    return next(new BadRequestError('token does not appear to be valid', err));
  }
  if (!user) {
    return next(new UnauthorizedError('authentication failed'));
  }
  req.user = user;
  return next();
};
