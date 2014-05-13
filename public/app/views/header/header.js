define([
	'jquery',
	'underscore',
	'backbone',
	'models/login-info',
	'text!templates/header.html'
],
function ($, _, Backbone, loginInfo, headerHtml) {
	
	var HeaderView = Backbone.View.extend({

		template: _.template(headerHtml),

		model: loginInfo,

		events: {
			'click #logout': 'onLogoutClick',
		},

		initialize: function () {

			// Listen to changes to login info model.
			//
			this.model.on('change:loggedOn', this.render, this);
		},

		render: function () {
			var html = this.template();
			this.$el.html(html);

			var logoutButton = this.$('#logout').button({
				icons: {
					primary: 'ui-icon-power',
					text: false
				}
			});
			
			if(this.model.get('loggedOn')) {
				logoutButton
					.attr('title', this.model.get('name') + ' ' + this.model.get('surname'))
					.tooltip()
					.show('fade');
			} else {
				logoutButton.hide('fade');
			}

			return this;
		},

		onLogoutClick: function() {

			this.model.doLogout();
			Backbone.history.navigate('login', true);
		}

	});

	return HeaderView;
});
