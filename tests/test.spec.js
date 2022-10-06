const usersTests = require('./suites/usersTest');
const blogsTests = require('./suites/blogsTest');

/* Forcing the order of tests, users need to be created first so blogs can be assigned to them */

describe('Users Tests', usersTests);
describe('Blogs Tests', blogsTests);
