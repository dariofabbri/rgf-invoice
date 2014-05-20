define([
	'jquery',
	'underscore',
	'backbone',
	'collections/autocomplete-items'
],
function ($, _, Backbone, AutocompleteItems) {
	var Cities = AutocompleteItems.extend({

		url: '/lists/cities'
	});
	return new Cities();
});
