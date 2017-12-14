const _ = require('lodash');
const mongoose = require('mongoose');
const Bluebird = require('bluebird');

const Host = Bluebird.promisifyAll(mongoose.model('Host'));

exports.isHostWhitelisted = (url) => {
	return Host.findOne({baseurl: url})
		.then((host) => {
			console.log(host);
			if (!host) {
				return false;
			}

			if (!host.isActive) {
				return false;
			}

			return true;
		});
}

exports.addHost = (url) => {
	return Host.create({
		baseurl: url,
		isActive: true
	});
}
