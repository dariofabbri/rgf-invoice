require.config({
	baseUrl: 'app',
	paths: {
		jquery: '../libs/jquery',
		'jquery-ui': '../libs/jquery-ui',
		underscore: '../libs/underscore',
		backbone: '../libs/backbone',
		text: '../libs/text'
	},
	shim: {
		backbone: {
			exports: 'Backbone',
			deps: ['underscore', 'jquery']
		},

		'jquery-ui': {
			deps: ['jquery']
		}
	}
});

requirejs([
	'jquery',
	'underscore',
	'backbone',

	'jquery-ui'
],
function ($, _, Backbone) {

	// Customize underscore's templates to mimic mustache style
	// field replacing.
	//
	_.templateSettings = {
		interpolate: /\{\{(.+?)\}\}/g
	};


	$(document).ready(function() {

		require([
			'utils/view-manager',
			'views/header/header',
			'views/footer/footer',
			'routers/home',
			'routers/user'
		], 
		function(viewManager, HeaderView, FooterView, HomeRouter, UserRouter) {

			// Set up header view. It will stay there for the whole application
			// lifetime.
			//
			var headerView = new HeaderView();
			viewManager.setView('#header', headerView, false);

			// Set up footer view. It will stay there for the whole application
			// lifetime.
			//
			var footerView = new FooterView();
			viewManager.setView('#footer', footerView, false);


			// Register application routers.
			//
			var homeRouter = new HomeRouter();
			var userRouter = new UserRouter();

			// Kick off the application.
			//
			Backbone.history.start({ pushState: true });
			Backbone.history.navigate('login', true);
		});
	});
});
