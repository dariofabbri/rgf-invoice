define([
	'underscore'
],
function (_) {

	var ViewManager = function() {

		var views = {};

	};

	_.extends(ViewManager.prototype, {

		setView: function(id, view) {

			// Check if the view exists.
			//
			var prev = this.views[id];
			if(prev) {
				this.removeView(prev);
			}

			// Set the new view.
			//
			this.views[id] = view;
		},


		removeView: function(view) {

			// Check if the view has child views.
			//
			if(prev.childViews) {
				_.each(prev.childViews, this.removeViews);
			}

			// Remove the view.
			//
			view.remove();
		}
	});

	return ViewManager;
});

