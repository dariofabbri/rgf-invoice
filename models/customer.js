var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var customerSchema = new Schema({
	vatCode: String,
	cfCode: String,
	description: String,
	firstName: String,
	lastName: String,
	address1: String,
	address2: String,
	city: String,
	zipCode: String,
	country: String,
	createdOn: { type: Date, default: Date.now },
	updatedOn: { type: Date, default: Date.now }
}, {
	collection: 'customers'
});

var Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
