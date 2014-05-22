var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var invoiceSchema = new Schema({
	type: String, // I - Invoice, C - Credit note
	number: Number,
	date: Date,
	issuer: {
		description: String,
		address: String,
		zipCode: String,
		city: String,
		cfCode: String,
		vatCode: String,
		reaCode: String,
		stock: String
	},
	addressee: {
		idContact: ObjectId,
		description: String,
		address1: String,
		address2: String,
		zipCode: String,
		city: String,
		cfCode: String,
		vatCode: String
	},
	receipt: {
		cashRegister: {
			model: String,
			serial: String
		},
		number: Number,
		date: Date
	},
	totals: {
		taxable: Number,
		tax: Number,
		total: Number
	},
	payment: String,
	createdBy: String,
	createdOn: { type: Date, default: Date.now },
	updatedBy: String,
	updatedOn: { type: Date, default: Date.now }
}, {
	collection: 'invoices'
});

var Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
