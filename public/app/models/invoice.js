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
			date: new Date(),
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

		// TODO: copied from contacts!
		//
		validate: function(attributes, options) {

			errors = {};

			// Flag isCompany must be present.
			//
			if (this.get('isCompany') === undefined) {
				errors['isCompany'] = 'Il campo è obbligatorio';
			}

			// If isCompany flag is set, then the VAT code field is mandatory.
			//
			if (this.get('isCompany') && this.get('vatCode').trim().length === 0) {
				errors['vatCode'] = 'Per un\'azienda è obbligatorio inserire il codice di partita IVA';
			}

			// If isCompany flag is not set, then the CF code field is mandatory.
			//
			if (!this.get('isCompany') && this.get('cfCode').trim().length === 0) {
				errors['cfCode'] = 'Per un privato è obbligatorio inserire il codice fiscale';
			}

			// Check the validity of VAT code, if present.
			//
			if (this.get('vatCode') && !validation.isValidPartitaIVA(this.get('vatCode'))) {
				errors['vatCode'] = 'Il codice di partita IVA immesso non è valido.';
			}

			// Check the validity of CF code, if present.
			//
			if (this.get('cfCode') && !validation.isValidCodiceFiscale(this.get('cfCode'))) {
				errors['cfCode'] = 'Il codice fiscale immesso non è valido.';
			}

			// Check the validity of the email field, if present.
			//
			if (this.get('email') && !validation.isValidEmail(this.get('email'))) {
				errors['email'] = 'L\'indirizzo email inserito non è valido.';
			}

			// Check the validity of the zip code field, if present.
			//
			if (this.get('zipCode') && !validation.isValidZipCode(this.get('zipCode'))) {
				errors['zipCode'] = 'Il CAP immesso non è valido.';
			}

			if(!_.isEmpty(errors)) {
				return errors;
			}
		},

		urlRoot: '/invoices'
	});
	return Invoice;
});
