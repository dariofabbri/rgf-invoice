define([
	'jquery',
	'underscore',
	'backbone',
	'views/user/main',
	'utils/view-manager'
],
function ($, _, Backbone, MainUserView, viewManager) {
	
	var UserRouter = Backbone.Router.extend({

		routes: {
			"users":		"users"
		},

		users: function() {

			var mainUserView = new MainUserView();
			viewManager.setView('#main-content', mainUserView);
		}
	});

	return UserRouter;
});
