const { sequelize, MonitoredEndpoint } = require('../../db');

const MonitoredEndpointSeed = require('./seed');
const UserSeed = require('../user/seed');

describe('Model MonitoredEndpoint', () => {
  beforeEach(async () => {
    await sequelize.drop();
    await sequelize.sync();
  });

  afterAll(async () => {
    await sequelize.drop();
    await sequelize.sync();
  });

  describe('authorizedFindAll()', () => {
    test('user type 1 - It should return array of endpoints belonging to calling user', async () => {
      const user1 = await new UserSeed({ type: 1 });
      const user2 = await new UserSeed({ type: 1 });
      await new MonitoredEndpointSeed({ UserId: user1.id });
      await new MonitoredEndpointSeed({ UserId: user2.id });
      const query = {};
      const result = await MonitoredEndpoint.buildAuthorizedFindAll(query, user1);
      result.forEach((record) => {
        expect(record.UserId).toEqual(user1.id); // test we got only records belonging to user
      });
    });

    test('user type 10 - It should return array of endpoints belonging to calling user', async () => {
      const user1 = await new UserSeed({ type: 10 });
      const user2 = await new UserSeed({ type: 1 });
      await new MonitoredEndpointSeed({ UserId: user1.id });
      await new MonitoredEndpointSeed({ UserId: user2.id });
      const query = {};
      const result = await MonitoredEndpoint.buildAuthorizedFindAll(query, user1);
      expect(result).toBeType('array');
      expect(result.length).toEqual(2);
    });
  });
});
