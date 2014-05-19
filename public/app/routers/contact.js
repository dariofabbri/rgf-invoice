define([
	'jquery',
	'underscore',
	'backbone',
	'views/contact/search',
	'views/contact/detail',
	'models/contact',
	'utils/view-manager'
],
function ($, _, Backbone, SearchContactView, DetailContactView, ContactModel, viewManager) {
	
	var UserRouter = Backbone.Router.extend({

		routes: {
			'contacts': 'contacts',
			'newContact': 'newContact',
			'contact/:id': 'contact'
		},

		contacts: function() {

			var searchContactView = new SearchContactView();
			viewManager.setView('#main-content', searchContactView);
		},

		newContact: function() {

			var model = new ContactModel();
			var detailContactView = new DetailContactView({ model: model });
			viewManager.setView('#main-content', detailContactView);
		},

		contact: function(id) {

			var model = new ContactModel({ _id: id });
			model.fetch();
			var detailContactView = new DetailContactView({ model: model });
			viewManager.setView('#main-content', detailContactView);
		}
	});

	return UserRouter;
});
