define([
	'jquery',
	'underscore',
	'backbone',
	'collections/autocomplete-items'
],
function ($, _, Backbone, AutocompleteItems) {
	var Counties = AutocompleteItems.extend({

		url: '/lists/counties'
	});
	return new Counties();
});
