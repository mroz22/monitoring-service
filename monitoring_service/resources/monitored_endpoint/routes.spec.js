const request = require('supertest');

const server = require('../../server');
const { sequelize } = require('../../db/index');
const MonitoredEndpointSeed = require('./seed');
const MonitoringResultSeed = require('../monitoring_result/seed');
const UserSeed = require('../user/seed');

const seedEndpoint = async () => {
  const user = await new UserSeed();
  const monitoredEndpoint = await new MonitoredEndpointSeed({ UserId: user.id });
  return { monitoredEndpoint, user };
};

const seedMonitoringResults = async MonitoredEndpointId => Promise
  .all(Array.from(new Array(20), () => new MonitoringResultSeed({ MonitoredEndpointId })));

describe('routes - monitored-endpoints', () => {
  beforeAll(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  });

  beforeEach(async () => {
    await sequelize.drop();
    await sequelize.sync();
  });

  afterAll(async () => {
    await sequelize.drop();
    await sequelize.sync();
  });

  describe('GET v1/monitored-endpoints', () => {
    test('200 It should fetch list of monitored endpoints', async () => {
      const { monitoredEndpoint, user } = await seedEndpoint();
      await seedEndpoint(); // call it once again to make sure we have multiple users;
      const response = await request(server)
        .get('/v1/monitored-endpoints')
        .set({ 'x-access-token': user.accessToken });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeType('array');
      expect(response.body[0]).toEqual(expect.objectContaining({
        id: monitoredEndpoint.id,
        UserId: user.id,
        name: monitoredEndpoint.name,
        url: monitoredEndpoint.url,
        monitoredInterval: monitoredEndpoint.monitoredInterval,
      }));
    });

    test('401 It should return authentication error', async () => {
      await seedEndpoint();
      const response = await request(server).get('/v1/monitored-endpoints');
      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET v1/monitored-endpoints/user', () => {
    test('200 It should fetch monitored endpoints for belonging to user', async () => {
      const { user } = await seedEndpoint();
      await seedEndpoint();
      const response = await request(server)
        .get('/v1/monitored-endpoints/user')
        .set({ 'x-access-token': user.accessToken });
      expect(response.statusCode).toBe(200);
      response.body.forEach((endpoint) => {
        expect(endpoint.UserId).toEqual(user.id);
      });
    });
  });

  describe('GET v1/monitored-endpoints/:id', () => {
    test('200 It should fetch monitored endpoint by id', async () => {
      const { monitoredEndpoint, user } = await seedEndpoint();
      const response = await request(server)
        .get(`/v1/monitored-endpoints/${monitoredEndpoint.id}`)
        .set({ 'x-access-token': user.accessToken });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        id: monitoredEndpoint.id,
        UserId: user.id,
        name: monitoredEndpoint.name,
        url: monitoredEndpoint.url,
        monitoredInterval: monitoredEndpoint.monitoredInterval,
      }));
    });

    test('401 It should return authentication error', async () => {
      const { monitoredEndpoint } = await seedEndpoint();
      const response = await request(server)
        .get(`/v1/monitored-endpoints/${monitoredEndpoint.id}`);
      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({});
    });

    test('404 It should request forbidden resource and return not found error', async () => {
      const { monitoredEndpoint } = await seedEndpoint();
      const { user } = await seedEndpoint();
      const response = await request(server)
        .get(`/v1/monitored-endpoints/${monitoredEndpoint.id}`)
        .set({ 'x-access-token': user.accessToken });
      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({});
    });

    test('404 It should try to fetch nonexistent monitored endpoint by id', async () => {
      const { user } = await seedEndpoint();
      const response = await request(server)
        .get('/v1/monitored-endpoints/fooo')
        .set({ 'x-access-token': user.accessToken });
      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({});
    });
  });

  describe('GET v1/monitored-endpoints/:id/monitoring-results', () => {
    test('200 It should fetch monitored endpoint containing list of monitoring results', async () => {
      const { user, monitoredEndpoint } = await seedEndpoint();
      await seedMonitoringResults(monitoredEndpoint.id);

      const response = await request(server)
        .get(`/v1/monitored-endpoints/${monitoredEndpoint.id}/monitoring-results`)
        .set({ 'x-access-token': user.accessToken });
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toEqual(10);
      response.body.forEach((monitoringResult) => {
        expect(monitoringResult).toHaveProperty('id', expect.any(Number));
        expect(monitoringResult).toHaveProperty('statusCode', expect.any(Number));
        expect(monitoringResult).toHaveProperty('payload', expect.any(String));
        expect(monitoringResult).toHaveProperty('MonitoredEndpointId', expect.any(Number));
      });
    });

    test('401 It should fetch monitored endpoint containing list of monitoring results', async () => {
      const { monitoredEndpoint } = await seedEndpoint();
      const response = await request(server)
        .get(`/v1/monitored-endpoints/${monitoredEndpoint.id}/monitoring-results`);
      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({});
    });

    test('404 It should request forbidden resource and return not found error', async () => {
      const { monitoredEndpoint } = await seedEndpoint();
      const { user } = await seedEndpoint();
      await seedMonitoringResults(monitoredEndpoint.id);
      const response = await request(server)
        .get(`/v1/monitored-endpoints/${monitoredEndpoint.id}/monitoring-results`)
        .set({ 'x-access-token': user.accessToken });
      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({});
    });

    test('404 It should return not found error', async () => {
      const { monitoredEndpoint } = await seedEndpoint();
      const { user } = await seedEndpoint();
      await seedMonitoringResults(monitoredEndpoint.id);
      const response = await request(server)
        .get('/v1/monitored-endpoints/3084838/monitoring-results')
        .set({ 'x-access-token': user.accessToken });
      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({});
    });
  });

  describe('POST v1/monitored-endpoints', () => {
    test('200 It should save a new monitored endpoints and fetch it', async () => {
      const { user } = await seedEndpoint();
      const data = {
        name: 'yahoo.com',
        url: 'https://www.yahoo.com/',
        monitoredInterval: 60,
        UserId: user.id,
      };
      const response = await request(server)
        .post('/v1/monitored-endpoints')
        .set({ 'x-access-token': user.accessToken })
        .send(data);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        id: expect.any(Number),
        UserId: user.id,
        name: data.name,
        url: data.url,
        monitoredInterval: data.monitoredInterval,
      }));
    });

    test('401 It should return authentication error', async () => {
      const data = {};
      const response = await request(server)
        .post('/v1/monitored-endpoints')
        .send(data);
      expect(response.statusCode).toBe(401);
    });

    test('400 It should try to save a new monitored endpoints with incorrect data and fail', async () => {
      const { user } = await seedEndpoint();
      const response = await request(server)
        .post('/v1/monitored-endpoints')
        .set({ 'x-access-token': user.accessToken })
        .send({
          name: 1,
          url: 'https://www.yahoo.com/',
          monitoredInterval: 'aa',
        });
      expect(response.statusCode).toBe(400);
      expect(response.body).toBeType('object');
    });
  });

  describe('PUT v1/monitored-endpoints/:id', () => {
    test('200 It should find monitored endpoint by id and update it', async () => {
      const { monitoredEndpoint, user } = await seedEndpoint();
      const response = await request(server)
        .put(`/v1/monitored-endpoints/${monitoredEndpoint.id}`)
        .set({ 'x-access-token': user.accessToken })
        .send({ name: 'yahoo.com' });
      expect(response.statusCode).toBe(200);
      expect(response.body.name).toEqual('yahoo.com');
    });

    test('401 It should return authentication error', async () => {
      const { monitoredEndpoint } = await seedEndpoint();
      const response = await request(server)
        .put(`/v1/monitored-endpoints/${monitoredEndpoint.id}`)
        .send({ name: 'yahoo.com' });
      expect(response.statusCode).toBe(401);
    });

    test('404 It should try to update nonexistent monitored endpoint', async () => {
      const { user } = await seedEndpoint();
      const response = await request(server)
        .put('/v1/monitored-endpoints/fooo')
        .set({ 'x-access-token': user.accessToken })
        .send({ name: 'yahoo.com' });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE v1/monitored-endpoints/:id', () => {
    test('200 It should find monitored endpoint by id and delete it', async () => {
      const { monitoredEndpoint, user } = await seedEndpoint();
      const response = await request(server)
        .del(`/v1/monitored-endpoints/${monitoredEndpoint.id}`)
        .set({ 'x-access-token': user.accessToken });
      expect(response.statusCode).toBe(200);

      // test that resource was really deleted
      const deleted = await request(server)
        .get(`/v1/monitored-endpoints/${monitoredEndpoint.id}`)
        .set({ 'x-access-token': user.accessToken });
      expect(deleted.statusCode).toBe(404);
    });

    test('401 It should return authentication error', async () => {
      const { monitoredEndpoint } = await seedEndpoint();
      const response = await request(server)
        .del(`/v1/monitored-endpoints/${monitoredEndpoint.id}`);
      expect(response.statusCode).toBe(401);
    });

    test('404 It should request forbidden resource and return not found error', async () => {
      const { monitoredEndpoint } = await seedEndpoint();
      const { user } = await seedEndpoint();
      const response = await request(server)
        .del(`/v1/monitored-endpoints/${monitoredEndpoint.id}`)
        .set({ 'x-access-token': user.accessToken });
      expect(response.statusCode).toBe(404);
    });

    test('404 It should try to delete nonexistent monitored endpoint', async () => {
      const { user } = await seedEndpoint();
      const response = await request(server)
        .del('/v1/monitored-endpoints/fooo')
        .set({ 'x-access-token': user.accessToken });
      expect(response.statusCode).toBe(404);
    });
  });
});

