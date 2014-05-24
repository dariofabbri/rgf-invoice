define([
	'jquery',
	'underscore',
	'backbone',
	'models/autocomplete-item',
	'utils/regexp'
],
function ($, _, Backbone, AutocompleteItem, regExp) {
	var AutocompleteItems = Backbone.Collection.extend({

		model: AutocompleteItem,

		refreshTimeout: 60000,

		refreshJitterMagnitude: 5000,

		lastUpdate: null,

		initialize: function(options) {

			var that = this;
			var refreshFn = function() {
				that.fetch({
					reset: true,
					success: function() {
						that.lastUpdate = new Date();
					}
				});

				// Add a bit of jitter to avoid continuos clash of update
				// requests on the server.
				//
				var jitter = Math.random() * that.refreshJitterMagnitude * 2 - that.refreshJitterMagnitude;
				setTimeout(refreshFn, that.refreshTimeout + jitter);
			}
			refreshFn();
		},

		list: function (filter) {

			// Apply the filter.
			//
			var filterRe = new RegExp(regExp.escapeRegExp(filter), 'i');
			var filtered = this.filter(function (model) {
				return model.get('description') && model.get('description').match(filterRe);
			});

			return _.map(filtered, function(model) {
				return model.get('description');
			});
		}
	});
	return AutocompleteItems;
});
