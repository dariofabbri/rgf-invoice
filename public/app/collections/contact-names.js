define([
	'jquery',
	'underscore',
	'backbone',
	'collections/autocomplete-items'
],
function ($, _, Backbone, AutocompleteItems) {
	var ContactNames = AutocompleteItems.extend({

		url: '/lists/names'
	});
	return new ContactNames();
});
