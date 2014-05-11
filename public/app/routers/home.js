define([
	'jquery',
	'underscore',
	'backbone',
	'views/login/login'
],
function ($, _, Backbone, LoginView) {
	
	var HomeRouter = Backbone.Router.extend({

		routes: {
			"login":	"login",
			"home":		"home"
		},

		login: function() {

			// Transition out existing view.
			//

			// Remove existing view.
			//

			// Create new view.
			//

			// Transition in new view.
			//

			var loginView = new LoginView();
			$("#main-content").append(loginView.render().el);
		},

		home: function() {
		}

	});

	return HomeRouter;
});
