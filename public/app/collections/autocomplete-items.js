define([
	'jquery',
	'underscore',
	'backbone',
	'models/autocomplete-item'
],
function ($, _, Backbone, AutocompleteItem) {
	var AutocompleteItems = Backbone.Collection.extend({
		model: AutocompleteItems,

		refreshTimeout: 60000,

		escapeRegExp: function(s) {
			return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		},

		initialize: function(options) {

			var that = this;
			var refreshFn = function() {
				that.fetch({reset: true});
				setTimeout(refreshFn, that.refreshTimeout);
			}
			refreshFn();
		}
	});
	return AutocompleteItems;
});
