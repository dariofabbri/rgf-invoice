define([
	'jquery',
	'underscore',
	'backbone',
	'collections/autocomplete-items'
],
function ($, _, Backbone, AutocompleteItems) {
	var Payments = AutocompleteItems.extend({

		url: '/config/payment.json'
	});
	return new Payments();
});
