define([
	'jquery',
	'underscore',
	'backbone',
	'views/login/login',
	'views/main-menu/main-menu',
	'utils/view-manager'
],
function ($, _, Backbone, LoginView, MainMenuView, viewManager) {
	
	var HomeRouter = Backbone.Router.extend({

		routes: {
			"login":		"login",
			"mainMenu":	"mainMenu"
		},

		login: function() {

			var loginView = new LoginView();
			viewManager.setView('#main-content', loginView);
		},

		mainMenu: function() {

			var mainMenuView = new MainMenuView();
			viewManager.setView('#main-content', mainMenuView);
		}

	});

	return HomeRouter;
});
