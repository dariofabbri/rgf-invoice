define([
	'jquery',
	'underscore',
	'backbone'
],
function ($, _, Backbone) {

	// Create an extended version of Backbone.View that can support subviews.
	//
	var ParentView = Backbone.View.extend({

		constructor: function() {
			
			this.subviews = [];

			Backbone.View.apply(this, arguments);
		},

		removeSubviews: function () {

			if(this.subviews) {
				_.each(this.subviews, this.removeView);
			}
		},

		addSubview: function(subview) {

			this.subviews.push(subview);
		},

		removeView: function (view) {

			// Process subviews, if needed.
			//
			if (view.subviews) {
				_.each(view.subviews, this.removeView);
			}

			// Remove the view.
			//
			view.remove();
		}
	});

	return ParentView;
});
