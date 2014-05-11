define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/header.html'
],
function ($, _, Backbone, headerHtml) {
	
	var HeaderView = Backbone.View.extend({

		template: _.template(headerHtml),

		events: {
			'click #logout': 'onLogoutClick',
		},

		render: function () {
			var html = this.template();
			this.$el.html(html);

			this.$('#logout').button({
				icons: {
					primary: 'ui-icon-power',
					text: false
				}
			});

			return this;
		},

		onLogoutClick: function() {
			console.log('Logout requested.');
		}

	});

	return HeaderView;
});
