require.config({
	baseUrl: 'app',
	paths: {
		jquery: '../libs/jquery',
		'jquery-ui': '../libs/jquery-ui',
		underscore: '../libs/underscore',
		backbone: '../libs/backbone',
		text: '../libs/text'
	},
	shim: {
		backbone: {
			exports: 'Backbone',
			deps: ['underscore', 'jquery']
		},

		'jquery-ui': {
			deps: ['jquery']
		}
	}
});

requirejs([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/form-message.html',

	'jquery-ui'
],
function ($, _, Backbone, messageHtml) {

	// Customize underscore's templates to mimic mustache style
	// field replacing.
	//
	_.templateSettings = {
		interpolate: /\{\{(.+?)\}\}/g
	};

	// Create an extend version of Backbone.View dedicated to form
	// building.
	//
	Backbone.FormView = Backbone.View.extend({

		fldDelay: 1000,

		// Add a generic function to show a message in the form.
		//
		showMessage: function(title, message, removeTimeout) {

			// If no remove timeout has been specified, just
			// set a default to 5 seconds.
			//
			removeTimeout = removeTimeout || 5000;

			var html = _.template(messageHtml, { title: title, message: message});
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
		}
	});

	$(document).ready(function() {

		require(['views/login/loginview'], function(LoginView) {
			var loginView = new LoginView();
			$(document.body).append(loginView.render().el);
		});
	});
});
