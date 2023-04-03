'use strict';

const discoveryClient = require('..');
const assert = require('assert').strict;

assert.strictEqual(discoveryClient(), 'Hello from discoveryClient');
console.info('discoveryClient tests passed');
