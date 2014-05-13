define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/form-message.html'
],
function ($, _, Backbone, messageHtml) {

	// Create an extend version of Backbone.View dedicated to form
	// building.
	//
	var FormView = Backbone.View.extend({

		fldDelay: 1000,

		// Add a generic function to show a message in the form.
		//
		showMessage: function(title, message, removeTimeout) {

			// If no remove timeout has been specified, just
			// set a default to 5 seconds.
			//
			removeTimeout = removeTimeout || 5000;

			var html = _.template(messageHtml, { title: title, message: message });
			this.$('.row').first().before(html).prev().hide().fadeIn(function() {
				var that = this;

				// A negative remove timeout disables the automatic
				// removal of the message.
				//
				if(removeTimeout >= 0) {
					setTimeout(function() {
						$(that).fadeOut(function() {
							this.remove();
						});
					}, removeTimeout);
				}
			});
		},


		// Set the error on a field.
		//
		setFieldError: function(selector, tooltip) {

			if(tooltip) {

				// Save existing title attribute.
				//
				var title = this.$(selector).attr('title');
				this.$(selector).data('savedTitle', title);

				this.$(selector)
					.addClass('field-error', this.fldDelay)
					.attr('title', tooltip)
					.tooltip();
			}

			return this.$(selector).addClass('field-error', this.fldDelay);
		},

		// Reset the error on a field.
		//
		resetFieldError: function(selector) {

			// Restore previous tooltip, in case.
			//
			var savedTitle = this.$(selector).data('savedTitle');
			if(savedTitle) {
				this.$(selector)
					.attr('title', savedTitle);
			}

			return this.$(selector)
				.removeClass('field-error')
				.data('savedTitle', null);
		}
	});

	return FormView;
});
