const supertest = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = require('../../app');
const User = require('../../models/user');
const testHelper = require('../../utils/test_helper');
const usersDummy = require('./usersDummy');

const api = supertest(app);

const usersTests = () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const promises = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const user of usersDummy) {
      const { username, name, password } = user;
      // eslint-disable-next-line no-await-in-loop
      const hashedPassword = await bcrypt.hash(password, 10);
      // eslint-disable-next-line no-await-in-loop
      promises.push(await new User({ username, name, hashedPassword }).save());
    }

    return Promise.all(promises);
  });

  describe('reading users', () => {
    test('amount of initial remote users equals amount of local dummy users', async () => {
      await api
        .get('/api/users')
        .expect('Content-Type', /json/)
        .expect(200);

      const users = await testHelper.usersInDb();

      expect(users.length).toStrictEqual(usersDummy.length);
    });

    test('populate', async () => {
      await api
        .get('/api/users')
        .expect('Content-Type', /json/)
        .expect(200);

      const users = await User.find({}).populate('blogs', { author: 1 });
      expect(users.length).toStrictEqual(usersDummy.length);
    });
  });

  describe('creating a user', () => {
    test('succeeds with status 201 if well-formed username and password are provided', async () => {
      await api
        .post('/api/users')
        .send({
          username: 'Test',
          password: '123456',
        })
        .expect('Content-Type', /json/)
        .expect(201);
    });

    test('fails with status 400 if username or password are not provided', async () => {
      await api
        .post('/api/users')
        .send({
          username: 'Test name',
        })
        .expect('Content-Type', /json/)
        .expect(400);

      await api
        .post('/api/users')
        .send({
          password: 'letmein',
        })
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('fails with status 400 if username or password have less than 3 characters', async () => {
      let req = await api
        .post('/api/users')
        .send({
          username: 'A',
          password: 'letmein',
        })
        .expect(400);

      expect(req.body.error.message).toEqual('The username has to be at least 3 characters long!');

      req = await api
        .post('/api/users')
        .send({
          username: 'Test',
          password: '1',
        })
        .expect(400);

      expect(req.body.error.message).toEqual('The username has to be at least 3 characters long!');
    });

    test('fails with status 400 if username is not unique', async () => {
      const { username } = usersDummy[0];
      const res = await api
        .post('/api/users')
        .send({
          username,
          name: 'Random',
          password: 'somerandompassword',
        })
        .expect(400);

      expect(res.body.error.message).toStrictEqual(`${username} already exists. The username has to be unique.`);
    });
  });

  afterAll(() => {
    mongoose.connection.close();
  });
};

module.exports = usersTests;
