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
			'click #logout': 	'onLogoutClick',
			'click #home': 		'onHomeClick',
			'click #chuck': 	'onChuckClick'
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

			var homeButton = this.$('#home').button({
				icons: {
					primary: 'ui-icon-home',
					text: false
				}
			});

			var chuckButton = this.$('#chuck').button({
				icons: {
					primary: 'ui-icon-notice',
					text: false
				}
			});
			
			if(this.model.get('loggedOn')) {
				homeButton.show('fade');
				logoutButton
					.attr('title', this.model.get('name') + ' ' + this.model.get('surname'))
					.tooltip()
					.show('fade');
			} else {
				homeButton.hide('fade');
				logoutButton.hide('fade');
			}

			return this;
		},

		onLogoutClick: function() {

			this.model.doLogout();
			Backbone.history.navigate('login', true);
		},

		onHomeClick: function() {

			Backbone.history.navigate('mainMenu', true);
		},

		onChuckClick: function() {

			$.ajax({
				url: 'http://api.icndb.com/jokes/random?callback=callback',
				type: 'GET',
				dataType: 'jsonp',
				jsonp: 'callback',
				success: function(response) {

					$('<div>' + response.value.joke + '</div>').dialog({
						title: 'Chuck Norris',
						modal: true
					});
				}
			});
		}

	});

	return HeaderView;
});
