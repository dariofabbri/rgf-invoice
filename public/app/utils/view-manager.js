define([
	'underscore'
],
function (_) {

	var ViewManager = function() {
		this.views = {};
	};

	_.extend(ViewManager.prototype, {

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
			if(view.childViews) {
				_.each(view.childViews, this.removeViews);
			}

			// Remove the view.
			//
			view.remove();
		}
	});

	return ViewManager;
});

