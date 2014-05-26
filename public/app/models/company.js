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

			isDefault: false,
			description: null,
			address: null,
			city: null,
			county: null,
			zipCode: null,
			country: null,
			vatCode: null,
			cfCode: null,
			reaCode: null,
			stock: null,
			cashRegister: {
				model: null,
				serial: null
			},
			createdBy: null,
			createdOn: null,
			updatedBy: null,
			updatedOn: null
		},

		urlRoot: '/companies'
	});
	return Contact;
});
