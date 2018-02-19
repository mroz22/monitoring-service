const Chance = require('chance');

const { User } = require('../../db/index');

const chance = new Chance();

class UserSeed {
  constructor(options) {
    const defaults = {
      name: chance.name(),
      email: chance.email(),
      accessToken: chance.string({ length: 36 }),
    };
    const data = Object.assign({}, defaults, options);
    return new Promise(async (resolve, reject) => {
      try {
        const user = await User.create(data);
        return resolve(user.get({ plain: true }));
      } catch (err) {
        return reject(err);
      }
    });
  }
}

module.exports = UserSeed;
