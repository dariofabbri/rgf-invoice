var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var companySchema = new Schema({
	isDefault: Boolean,
	description: String,
	address: String,
	city: String,
	county: String,
	zipCode: String,
	country: String,
	vatCode: String,
	cfCode: String,
	reaCode: String,
	stock: String,
	createdBy: String,
	createdOn: { type: Date, default: Date.now },
	updatedBy: String,
	updatedOn: { type: Date, default: Date.now }
}, {
	collection: 'companies'
});

var Company = mongoose.model('Company', companySchema);
module.exports = Company;
