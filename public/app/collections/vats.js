define([
	'jquery',
	'underscore',
	'backbone',
	'collections/autocomplete-items'
],
function ($, _, Backbone, AutocompleteItems) {
	var VATPercentages = AutocompleteItems.extend({

		url: '/config/vat.json'
	});
	return new VATPercentages();
});
