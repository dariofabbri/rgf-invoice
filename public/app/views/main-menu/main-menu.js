define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/main-menu.html'
],
function ($, _, Backbone, html) {
	
	var MainMenuView = Backbone.View.extend({

		template: _.template(html),

		events: {
			'click #utenti': 'onUtentiClick',
			'click #clienti': 'onClientiClick',
		},

		render: function () {
			var html = this.template();
			this.$el.html(html);

			this.$('#utenti').button();
			this.$('#clienti').button();

			return this;
		},
	});

	return MainMenuView;
});
