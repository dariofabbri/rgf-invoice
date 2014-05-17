define([
	'jquery',
	'underscore',
	'backbone',
	'views/user/search',
	'utils/view-manager'
],
function ($, _, Backbone, SearchUserView, viewManager) {
	
	var UserRouter = Backbone.Router.extend({

		routes: {
			"users":		"users"
		},

		users: function() {

			var searchUserView = new SearchUserView();
			viewManager.setView('#main-content', searchUserView);
		}
	});

	return UserRouter;
});
