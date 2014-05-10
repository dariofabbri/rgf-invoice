define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/login.html'
],
function ($, _, Backbone, loginHtml) {
	
	var LoginView = Backbone.FormView.extend({

		template: _.template(loginHtml),

		events: {
			'click #login': 'onLoginClick',
			'keypress input': 'onKeypress'
		},

		render: function () {
			var html = this.template();
			this.$el.html(html);

			this.$('#login').button();

			_.defer(function () {
				this.$('#username').focus();
			});

			return this;
		},

		onKeypress: function (e) {
			if(e.keyCode == 13) {
				this.doLogin();
			}
		},

		onLoginClick: function () {
			this.doLogin();
		},

		doLogin: function () {

			var username,
				password,
				firstInError;

			// Read username and password fields.
			//
			username = this.$('#username').val();
			password = this.$('#password').val();

			// Clear previous validation errors from form fields.
			//
			this.resetFieldErrors();

			// Validate username field.
			//
			if (!username) {
				firstInError = firstInError || this.$('#username').addClass('field-error', this.fldDelay);
				this.showMessage('Errore', 'Il campo username è obbligatorio.');
			}

			// Validate password field.
			//
			if (!password) {
				firstInError = firstInError || this.$('#password').addClass('field-error', this.fldDelay).focus();
				this.showMessage('Errore', 'Il campo password è obbligatorio.');
			}

			// Set the focus on the first field in error.
			//
			firstInError && firstInError.focus();
		},

		resetFieldErrors: function () {
			this.$('#username').removeClass('field-error');
			this.$('#password').removeClass('field-error');
		}
	});

	return LoginView;
});
