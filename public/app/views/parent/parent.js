define([
	'jquery',
	'underscore',
	'backbone'
],
function ($, _, Backbone) {

	// Create an extended version of Backbone.View that can manage child views.
	//
	var ParentView = Backbone.View.extend({

		childViews: [],

		removeChildViews: function () {

			if(this.childViews) {
				_.each(this.childViews, this.removeView);
			}
		},

		removeView: function (view) {

			// Check if the view has child views.
			//
			if (view.childViews) {
				_.each(view.childViews, this.removeView);
			}

			// Remove the view.
			//
			view.remove();
		}
	});

	return ParentView;
});
