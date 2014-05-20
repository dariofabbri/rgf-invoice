define([
	'jquery',
	'underscore',
	'backbone',
	'collections/autocomplete-items'
],
function ($, _, Backbone, AutocompleteItems) {
	var Countries = AutocompleteItems.extend({

		url: '/lists/countries'
	});
	return new Countries();
});
