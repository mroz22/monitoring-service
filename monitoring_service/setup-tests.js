process.env.NODE_ENV = 'test';

/*
A bit of a hack, to get rid of error:'Encoding not recognized: 'cesu8' (searched as: 'cesu8')'
https://github.com/sidorares/node-mysql2/issues/489
 */

require('./server');

const toBeType = require('jest-tobetype');

expect.extend(toBeType);
