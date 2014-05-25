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

		addSubview: function (subview) {

			this.subviews.push(subview);
		},

		removeView: function (view) {

			view = view || this;

			// Process subviews, if needed.
			//
			if (view.subviews) {
				_.each(view.subviews, this.removeView, this);
			}

			// Remove the view.
			//
			if(view.onRemove && _.isFunction(view.onRemove)) {
				view.onRemove();
			}
			view.$el.off();
			view.$('*').off();
			view.remove();
		}
	});

	return ParentView;
});
