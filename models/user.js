var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var userSchema = new Schema({
	username: String,
	password: String,
	name: String,
	surname: String,
	createdOn: { type: Date, default: Date.now },
	updatedOn: { type: Date, default: Date.now }
}, {
	collection: 'users'
});
var User = mongoose.model('User', userSchema);
module.exports = User;
