var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var contactSchema = new Schema({
	isCompany: Boolean,
	vatCode: String,
	cfCode: String,
	description: String,
	salutation: String,
	firstName: String,
	lastName: String,
	address1: String,
	address2: String,
	city: String,
	county: String,
	zipCode: String,
	country: String,
	phone: String,
	fax: String,
	email: String,
	createdBy: String,
	createdOn: { type: Date, default: Date.now },
	updatedBy: String,
	updatedOn: { type: Date, default: Date.now }
}, {
	collection: 'contacts'
});

var Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
