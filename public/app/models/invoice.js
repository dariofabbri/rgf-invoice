define([
	'jquery',
	'underscore',
	'backbone',
	'utils/validation'
],
function ($, _, Backbone, validation) {
	var Invoice = Backbone.Model.extend({
		idAttribute: '_id',

		defaults: {
			type: null,
			number: null,
			date: null,
			issuer: {
				description: null,
				address: null,
				zipCode: null,
				city: null,
				county: null,
				cfCode: null,
				vatCode: null,
				reaCode: null,
				stock: null	
			},
			addressee: {
				idContact: null,
				description: null,
				address1: null,
				address2: null,
				zipCode: null,
				city: null,
				county: null,
				cfCode: null,
				vatCode: null
			},
			receipt: {
				cashRegister: {
					model: null,
					serial: null
				},
				number: null,
				date: null
			},
			rows: null,
			totals: {
				taxable: null,
				tax: null,
				total: null
			},
			payment: null,
			createdBy: null,
			createdOn: null,
			updatedBy: null,
			updatedOn: null
		},

		setIssuer: function(data) {
			
			issuer = _.extend({}, data);
			this.set('issuer', issuer);

			this.set('receipt', {
				cashRegister: data.cashRegister
			});
		},

		validate: function(attributes, options) {

			errors = {};

			// Type must be present and must assume one of 'I' and 'C'.
			//
			if (!this.get('type')) {
				errors['type'] = 'Il campo tipo è obbligatorio.';
			} else {
				if (this.get('type') !== 'C' && this.get('type') !== 'I') {
					errors['type'] = 'Il tipo deve essere I oppure C.';
				}
			}

			// The invoice number must be present.
			//
			if (!this.get('number')) {
				errors['number'] = 'Il campo numero fattura è obbligatorio.';
			} else {
				if (!validation.isValidInvoiceNumber(this.get('number'))) {
					errors['number'] = 'Il numero fattura immesso non è valido.';
				}
			}

			// The invoice date must be present.
			//
			if (!this.get('date')) {
				errors['date'] = 'Il campo data fattura è obbligatorio.';
			} else {
				if (!_.isDate(this.get('date'))) {
					errors['date'] = 'Il campo data fattura non rappresenta una data valida.';
				}
			}

			// TODO: finish validation.
			//

			if(!_.isEmpty(errors)) {
				return errors;
			}
		},

		urlRoot: '/invoices'
	});
	return Invoice;
});
