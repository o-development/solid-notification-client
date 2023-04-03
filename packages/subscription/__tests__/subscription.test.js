'use strict';

const subscription = require('..');
const assert = require('assert').strict;

assert.strictEqual(subscription(), 'Hello from subscription');
console.info('subscription tests passed');
