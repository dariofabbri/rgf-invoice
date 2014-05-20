define([
	'jquery',
	'underscore',
	'backbone',
	'collections/autocomplete-items'
],
function ($, _, Backbone, AutocompleteItems) {
	var Names = AutocompleteItems.extend({

		url: '/lists/names'
	});
	return new Names();
});
