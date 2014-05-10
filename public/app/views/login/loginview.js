define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/login.html',
	'text!templates/form-message.html'
],
function ($, _, Backbone, loginHtml, messageHtml) {
	
	var LoginView = Backbone.View.extend({

		template: _.template(loginHtml),

		events: {
			'click #login': 'doLogin'
		},

		render: function () {
			var html = this.template();
			this.$el.html(html);

			this.$('#login').button();

			_.defer(function() {
				this.$('#username').focus();
			});

			return this;
		},

		doLogin: function () {

			var username,
				password;

			// Read username and password fields.
			//
			username = this.$('#username').val();
			password = this.$('#password').val();

			// Both must be present.
			//
			if(!username) {
				this.$('username').addClass('error', 1000);

				var html = _.template(messageHtml, { title: 'Errore', message: 'Il campo username è obbligatorio.'});
				this.$('.row').first().before(html).prev().hide().fadeIn(function() {
					var that = this;
					setTimeout(function() {
						$(that).fadeOut(function() {
							this.remove();
						});
					}, 5000);
				});

			}
		}
	});
	return LoginView;
});
