define([
	'jquery',
	'underscore',
	'backbone',
	'views/user/search',
	'views/user/detail',
	'models/user',
	'utils/view-manager'
],
function ($, _, Backbone, SearchUserView, DetailUserView, UserModel, viewManager) {
	
	var UserRouter = Backbone.Router.extend({

		routes: {
			'users': 'users',
			'newUser': 'newUser',
			'user/:id': 'user'
		},

		users: function() {

			var searchUserView = new SearchUserView();
			viewManager.setView('#main-content', searchUserView);
		},

		newUser: function() {

			var model = new UserModel();
			var detailUserView = new DetailUserView({ model: model });
			viewManager.setView('#main-content', detailUserView);
		},

		user: function(id) {

			var model = new UserModel({ _id: id });
			model.fetch();
			var detailUserView = new DetailUserView({ model: model });
			viewManager.setView('#main-content', detailUserView);
		}
	});

	return UserRouter;
});
