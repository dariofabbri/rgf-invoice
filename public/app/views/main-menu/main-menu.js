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
			'click #users': 'onUsersClick',
			'click #contacts': 'onContactsClick'
		},

		render: function () {
			var html = this.template();
			this.$el.html(html);

			this.$('#users').button();
			this.$('#contacts').button();
			this.$('#invoices').button();
			this.$('#creditNotes').button();
			this.$('#deliveryNotes').button();
			this.$('#repairs').button();

			return this;
		},

		onUsersClick: function() {

			Backbone.history.navigate('users', true);
		},

		onContactsClick: function() {

			Backbone.history.navigate('contacts', true);
		}
	});

	return MainMenuView;
});
