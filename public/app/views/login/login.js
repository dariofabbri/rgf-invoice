define([
	'jquery',
	'underscore',
	'backbone',
	'views/form/form',
	'models/login-info',
	'text!templates/login.html'
],
function ($, _, Backbone, FormView, loginInfo, loginHtml) {
	
	var LoginView = FormView.extend({

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
				that = this;

			// Read username and password fields and fill in the login info model.
			//
			loginInfo.set('username', this.$('#username').val());
			loginInfo.set('password', this.$('#password').val());

			// Validate read data.
			//
			if(!this.validate(loginInfo)) {
				return;
			}

			// Try to execute the login on the server.
			//
			var authorization = loginInfo.getAuthorization();
			$.ajax('login', {
				headers: {
					'Authorization': authorization
				},
				type: 'GET',
				success: function(data) {
					loginInfo.set({
						_id: data._id,
						name: data.name,
						surname: data.surname,
						createdOn: data.createdOn,
						updatedOn: data.updatedOn,
						loggedOn: true
					});
					Backbone.history.navigate('mainMenu', true);
				},
				error: function(data) {
					that.showMessage('Errore', 'Username e password non validi.');
				}
			});
		},

		validate: function(loginInfo) {

			var firstInError,
				field,
				msg;

			// Clear previous validation errors from form fields.
			//
			this.resetFieldErrors();

			// Validate username field.
			//
			if (!loginInfo.get('username')) {
				msg = 'Il campo username è obbligatorio.';
				field = this.setFieldError('#username', msg);
				firstInError = firstInError || field;
				this.showMessage('Errore', msg);
			}

			// Validate password field.
			//
			if (!loginInfo.get('password')) {
				msg = 'Il campo password è obbligatorio.';
				field = this.setFieldError('#password', msg);
				firstInError = firstInError || field;
				this.showMessage('Errore', msg);
			}

			// Set the focus on the first field in error.
			//
			firstInError && firstInError.focus();

			return !firstInError;
		},

		resetFieldErrors: function () {
			this.resetFieldError('#username');
			this.resetFieldError('#password');
		}
	});

	return LoginView;
});
