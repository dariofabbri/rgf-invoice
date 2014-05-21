define([
	'jquery',
	'underscore',
	'backbone',
	'utils/validation'
],
function ($, _, Backbone, validation) {
	var Contact = Backbone.Model.extend({
		idAttribute: '_id',

		defaults: {
			isCompany: false,
			vatCode: '',
			cfCode: '',
			description: '',
			salutation: '',
			firstName: '',
			lastName: '',
			address1: '',
			address2: '',
			city: '',
			county: '',
			zipCode: '',
			country: '',
			phone: '',
			fax: '',
			email: '',
			createdBy: null,
			createdOn: null,
			updatedBy: null,
			updatedOn: null
		},

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

		urlRoot: '/contacts'
	});
	return Contact;
});
