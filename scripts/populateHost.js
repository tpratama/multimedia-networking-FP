require('../models/connection');

const Bluebird = require('bluebird');
const _ = require('lodash');
const hostQuery = require('../models/queries/host-query');

const listHost = [
	'localhost:9001'
];

tasks = _.map(listHost, (host) => {
	return hostQuery.addHost(host)
});

Bluebird.all(tasks)
	.then((status) => {
		console.log('Done populate.....');
	})
	.catch(console.log);