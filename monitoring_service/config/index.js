const env = process.env.NODE_ENV || 'development';
require('dotenv').config({ path: `./.env.${env}` });
const { merge } = require('lodash/object');
const common = require('./common');

const envSpecificConfig = require(`./${env}`);  // eslint-disable-line
const config = merge(common, envSpecificConfig);

module.exports = config;
