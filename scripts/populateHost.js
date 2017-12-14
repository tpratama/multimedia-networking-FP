require('../models/connection');

const Bluebird = require('bluebird');
const _ = require('lodash');
const hostQuery = require('../models/queries/host-query');

// Tambahkan list whitelist disini untuk di masukkan
const listHost = [
	'localhost:9001',
	'10.151.252.185:9001'
];

tasks = _.map(listHost, (host) => {
	return hostQuery.addHost(host)
});

Bluebird.each(tasks)
	.then((status) => {
		console.log('Done populate.....');
	})
	.catch(console.log);