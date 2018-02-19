const request = require('supertest');

const server = require('../../server');
const { sequelize } = require('../../db/index');

const MonitoringResultSeed = require('./seed');
const UserSeed = require('../user/seed');
const MonitoredEndpointSeed = require('../monitored_endpoint/seed');

const seedData = async () => {
  const user = await new UserSeed();
  const monitoredEndpoint = await new MonitoredEndpointSeed({ UserId: user.id });
  const monitoringResult = await new MonitoringResultSeed({
    MonitoredEndpointId: monitoredEndpoint.id,
  });
  return { monitoredEndpoint, monitoringResult, user };
};

describe('routes - monitoring-results', () => {
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

  describe('GET v1/monitoring-results', () => {
    test('200 It should fetch list of monitoring results', async () => {
      const { user, monitoredEndpoint, monitoringResult } = await seedData();
      await Promise.all([await seedData(), await seedData()]);
      const response = await request(server)
        .get('/v1/monitoring-results')
        .set({ 'x-access-token': user.accessToken });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeType('array');
      expect(response.body[0]).toEqual(expect.objectContaining({
        id: monitoringResult.id,
        MonitoredEndpointId: monitoredEndpoint.id,
        statusCode: monitoringResult.statusCode,
        payload: monitoringResult.payload,
      }));
    });

    test('401 It should return authentication error', async () => {
      await seedData();
      const response = await request(server)
        .get('/v1/monitoring-results');
      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({});
    });
  });

  describe('GET v1/monitoring-results/:id', () => {
    test('200 It should fetch monitoring result by id', async () => {
      const { user, monitoredEndpoint, monitoringResult } = await seedData();
      const response = await request(server)
        .get(`/v1/monitoring-results/${monitoringResult.id}`)
        .set({ 'x-access-token': user.accessToken });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        id: monitoringResult.id,
        MonitoredEndpointId: monitoredEndpoint.id,
        statusCode: monitoringResult.statusCode,
        payload: monitoringResult.payload,
      }));
    });

    test('401 It should return authentication error', async () => {
      const { monitoringResult } = await seedData();
      const response = await request(server)
        .get(`/v1/monitoring-results/${monitoringResult.id}`);
      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({});
    });
  });

  describe('POST v1/monitoring-results', () => {
    test('200 It should save a new monitoring result and fetch it', async () => {
      const { user, monitoredEndpoint } = await seedData();
      const payload = JSON.stringify({ 'hello world': 'well hello' });
      const response = await request(server)
        .post('/v1/monitoring-results')
        .set({ 'x-access-token': user.accessToken })
        .send({
          statusCode: 200,
          payload,
          MonitoredEndpointId: monitoredEndpoint.id,
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        id: expect.any(Number),
        MonitoredEndpointId: monitoredEndpoint.id,
        statusCode: 200,
        payload,
      }));
    });

    test('400 It should try to save a new monitoring result with incorrect data and fail', async () => {
      const { user } = await seedData();
      const response = await request(server)
        .post('/v1/monitoring-results')
        .set({ 'x-access-token': user.accessToken })
        .send({
          statusCode: 'foo',
          payload: 'whatever',
        });
      expect(response.statusCode).toBe(400);
      expect(response.body).toBeType('object');
    });

    test('401 It should return authentication error', async () => {
      await seedData();
      const response = await request(server)
        .post('/v1/monitoring-results')
        .send();
      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({});
    });
  });

  describe('PUT v1/monitoring-results/:id', () => {
    test('200 It should find monitoring result by id and update it', async () => {
      const { monitoringResult, user } = await seedData();
      const payload = JSON.stringify({ hello: 'hello' });
      const response = await request(server)
        .put(`/v1/monitoring-results/${monitoringResult.id}`)
        .set({ 'x-access-token': user.accessToken })
        .send({
          statusCode: 200,
          payload,
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.payload).toEqual(payload);
    });

    test('401 It should return authentication error', async () => {
      const { monitoringResult } = await seedData();
      const response = await request(server)
        .put(`/v1/monitoring-results/${monitoringResult.id}`)
        .send({
          statusCode: 200,
          payload: 'hello underworld',
        });
      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({});
    });
  });

  describe('DELETE v1/monitoring-results/:id', () => {
    test('200 It should find monitoring result by id and delete it', async () => {
      const { monitoringResult, user } = await seedData();
      const response = await request(server)
        .del(`/v1/monitoring-results/${monitoringResult.id}`)
        .set({ 'x-access-token': user.accessToken });
      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({});
    });

    test('401 It should return authentication error', async () => {
      const { monitoringResult } = await seedData();
      const response = await request(server)
        .del(`/v1/monitoring-results/${monitoringResult.id}`);
      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({});
    });

    test('404 It should return not found error', async () => {
      const { user } = await seedData();
      const response = await request(server)
        .del('/v1/monitoring-results/2000') // non existent id
        .set({ 'x-access-token': user.accessToken });

      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({});
    });
  });
});

