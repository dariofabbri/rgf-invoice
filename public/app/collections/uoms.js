define([
	'jquery',
	'underscore',
	'backbone',
	'collections/autocomplete-items'
],
function ($, _, Backbone, AutocompleteItems) {
	var UnitOfMeasures = AutocompleteItems.extend({

		url: '/config/uom.json'
	});
	return new UnitOfMeasures();
});
