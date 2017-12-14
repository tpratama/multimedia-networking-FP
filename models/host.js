const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	baseurl: {
		type: String,
		index: {
			unique: true
		}
	},
	isActive: Boolean
});

module.exports = mongoose.model('Host', schema);
