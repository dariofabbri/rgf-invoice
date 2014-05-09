define([
	'jquery',
	'underscore',
	'backbone',
	'text!views/login/login.html'
],
function ($, _, Backbone, html) {
	
	var LoginView = Backbone.View.extend({

		template: _.template(html),

		events: {
			'click': 'showUserName'
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

		showUserName: function () {
			alert('User ' + this.model.get('name') + ' clicked!');
		}
	});
	return LoginView;
});
