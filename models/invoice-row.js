var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var invoiceRowSchema = new Schema({
	idInvoice: ObjectId,
	position: Number,
	description: String,
	uom: String,
	quantity: Number,
	price: Number,
	taxable: Number,
	vatPercentage: Number,
	tax: Number,
	total: Number
	createdBy: String,
	createdOn: { type: Date, default: Date.now },
	updatedBy: String,
	updatedOn: { type: Date, default: Date.now }
}, {
	collection: 'invoiceRows'
});

var InvoiceRow = mongoose.model('InvoiceRow', invoiceRowSchema);
module.exports = InvoiceRow;
