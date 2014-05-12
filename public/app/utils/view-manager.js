define([
	'underscore'
],
function (_) {

	var ViewManager = function() {
		this.views = {};

		this.transitionIn = {
			effect: 'fade',
			duration: 1000
		};

		this.transitionOut = {
			effect: 'fade',
			duration: 1000
		};
	};

	_.extend(ViewManager.prototype, {

		setView: function(selector, view) {

			var that = this;

			// Check if the view exists.
			//
			var prev = this.views[selector];
			if(prev) {

				// Transition out existing view.
				//
				_.extend(this.transitionOut, { 
					
					complete: function() {

						// Clean up previous view including
						// subviews, if present.
						//
						that.removeView(prev);

						// Transition in new view.
						//
						$(selector).append(view.render().el);
						view.$el.hide();
						view.$el.show(that.transitionIn);
					}
				});
				prev.$el.hide(this.transitionOut);

			} else {

				// Transition in new view.
				//
				$(selector).append(view.render().el);
				view.$el.hide();
				view.$el.show(that.transitionIn);
			}

			// Set the new view.
			//
			this.views[selector] = view;
		},

		removeView: function(view) {

			// Check if the view has child views.
			//
			if (view.childViews) {
				_.each(view.childViews, this.removeViews);
			}

			// Remove the view.
			//
			view.remove();
		}
	});

	// Return the singleton instance.
	//
	return new ViewManager();
});

