define([
	'jquery',
	'underscore',
	'backbone',
	'collections/autocomplete-items'
],
function ($, _, Backbone, AutocompleteItems) {
	var ContactNames = AutocompleteItems.extend({

		url: '/contacts/names',

		lastUpdate: null,

		list: function (request, response) {

			// Apply the filter.
			//
			var filterRe = new RegExp(this.escapeRegExp(request.term), "i");
			var filtered = this.filter(function (model) {
				model.get('description') && model.get('description').match(filterRe);
			});

			return _.map(filtered, function(model) {
				model.get('description');
			});
		}
	});
	return new ContactNames();
});
