define([
	'underscore'
],
function (_) {

	var ViewManager = function() {
		this.views = {};
	};

	_.extend(ViewManager.prototype, {

		setView: function(selector, view) {

			// Check if the view exists.
			//
			var prev = this.views[selector];
			if(prev) {

				var that = this;

				// Transition out existing view.
				//
				this.transitionOut(prev, function() {

					// Clean up previous view including
					// subviews, if present.
					//
					that.removeView(prev);
				});
			}

			// Transition in new view.
			//
			$(selector).append(view.render().el);
			view.$el.addClass('page');
			this.transitionIn(view);

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
		},

		transitionIn: function (view, callback) {
			var animateIn = function () {
				view.$el.addClass('is-visible');
				view.$el.one('transitionend', function () {
					if (_.isFunction(callback)) {
						callback();
					}
				});
			};

			_.delay(animateIn, 20);
		},

		transitionOut: function (view, callback) {
			view.$el.removeClass('is-visible');
			view.$el.one('transitionend', function () {
				if (_.isFunction(callback)) {
					callback();
				}
			});
		}
	});

	// Return the singleton instance.
	//
	return new ViewManager();
});

