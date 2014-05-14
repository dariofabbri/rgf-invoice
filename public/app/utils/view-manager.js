define([
	'underscore'
],
function (_) {

	var ViewManager = function() {
		this.views = {};

		this.transitionIn = {
			effect: 'fade',
			duration: 400
		};

		this.transitionOut = {
			effect: 'fade',
			duration: 400
		};
	};

	_.extend(ViewManager.prototype, {

		setView: function(selector, view, useTransition, transitionIn, transitionOut) {

			var that = this;

			var tIn = transitionIn || this.transitionIn;

			var tOut = transitionOut || this.transitionOut;
			_.extend(tOut, {
				
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

			var tUse = _.isUndefined(useTransition) ? true : useTransition;


			// Check if the view exists.
			//
			var prev = this.views[selector];
			if(prev) {

				// Transition out existing view.
				//
				if(tUse) {
					prev.$el.hide(tOut);
				} else {
					that.removeView(prev);
				}

			} else {

				// Transition in new view.
				//
				$(selector).append(view.render().el);
				if(tUse) {
					view.$el.hide();
					view.$el.show(that.transitionIn);
				}
			}

			// Set the new view.
			//
			this.views[selector] = view;
		},

		removeView: function(view) {

			var that = this;

			// Check if the view has child views.
			//
			if (view.childViews) {
				_.each(view.childViews, that.removeView, that);
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

