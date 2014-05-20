define([
	'jquery',
	'underscore',
	'backbone'
],
function ($, _, Backbone) {
	var AutocompleteItem = Backbone.Model.extend({
		defaults: {
			description: null
		}
	});
	return AutocompleteItem;
});

