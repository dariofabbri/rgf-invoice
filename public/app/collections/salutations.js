define([
	'jquery',
	'underscore',
	'backbone',
	'collections/autocomplete-items'
],
function ($, _, Backbone, AutocompleteItems) {
	var Salutations = AutocompleteItems.extend({

		url: '/lists/salutations'
	});
	return new Salutations();
});
