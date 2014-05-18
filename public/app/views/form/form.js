define([
	'jquery',
	'underscore',
	'backbone',
	'views/parent/parent',
	'text!templates/form-message.html'
],
function ($, _, Backbone, ParentView, messageHtml) {

	// Create an extended version of Backbone.View dedicated to form
	// building.
	//
	var FormView = ParentView.extend({

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
		},

		setFormErrors: function(errors, mapping) {

			var field, firstInError, selector;
			var that = this;

			// Manage model validation error.
			//
			if (errors) {

				_.each(errors, function(value, key, list) {

					selector = (mapping && mapping[key]) || '#' + key;

					field = that.setFieldError(selector, value);
					firstInError = firstInError || field;
					that.showMessage('Errore', value);
				});

			}

			// Set the focus on the first field in error.
			//
			firstInError && firstInError.focus();
		}
	});

	return FormView;
});
